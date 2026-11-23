// Real-time process, memory and request metrics collector (zero deps).
// Every number here is measured — nothing is simulated.

import os from 'os';

const MAX_MEMORY_SAMPLES = 180; // 30 minutes at a 10s sampling interval
const MAX_LATENCY_SAMPLES = 500;

const memorySamples = []; // { t, rss, heapUsed, heapTotal, external, freeMem, totalMem, load1 }
const latencySamples = []; // rolling request durations (ms) for percentiles
const routeStats = new Map(); // "GET /api/xyz" -> { count, totalMs, maxMs, s2xx, s4xx, s5xx, slowCount }

let totalRequests = 0;
let errorResponses = 0;
let activeRequests = 0;
const startedAt = Date.now();
let samplerTimer = null;

export function recordRequest(method, route, status, durationMs) {
  totalRequests += 1;
  activeRequests = Math.max(0, activeRequests);
  if (status >= 500) errorResponses += 1;

  latencySamples.push(durationMs);
  if (latencySamples.length > MAX_LATENCY_SAMPLES) latencySamples.shift();

  const key = `${method} ${route}`;
  const stat = routeStats.get(key) || { count: 0, totalMs: 0, maxMs: 0, s2xx: 0, s4xx: 0, s5xx: 0, slowCount: 0 };
  stat.count += 1;
  stat.totalMs += durationMs;
  stat.maxMs = Math.max(stat.maxMs, durationMs);
  if (durationMs > 500) stat.slowCount += 1;
  if (status >= 500) stat.s5xx += 1;
  else if (status >= 400) stat.s4xx += 1;
  else stat.s2xx += 1;
  routeStats.set(key, stat);
}

export function trackActive(increment) {
  activeRequests = Math.max(0, activeRequests + (increment ? 1 : -1));
}

function memoryPoint() {
  const mem = process.memoryUsage();
  return {
    t: Date.now(),
    rss: mem.rss,
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    external: mem.external,
    freeMem: os.freemem(),
    totalMem: os.totalmem(),
    load1: Number(os.loadavg()[0].toFixed(2))
  };
}

export function sampleMemory() {
  const point = memoryPoint();
  memorySamples.push(point);
  if (memorySamples.length > MAX_MEMORY_SAMPLES) memorySamples.shift();
  return point;
}

export function startSampler(intervalMs = 10_000) {
  if (samplerTimer) return;
  sampleMemory(); // seed immediately
  samplerTimer = setInterval(() => {
    try {
      sampleMemory();
    } catch {
      // never let sampling kill the server
    }
  }, intervalMs);
  if (typeof samplerTimer.unref === 'function') samplerTimer.unref();
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export function getMetricsSnapshot() {
  const current = memoryPoint();
  const sortedLatency = [...latencySamples].sort((a, b) => a - b);
  const routes = [...routeStats.entries()]
    .map(([key, s]) => ({
      route: key,
      count: s.count,
      avgMs: Number((s.totalMs / s.count).toFixed(2)),
      maxMs: Number(s.maxMs.toFixed(2)),
      slowCount: s.slowCount,
      s2xx: s.s2xx,
      s4xx: s.s4xx,
      s5xx: s.s5xx
    }))
    .sort((a, b) => b.count - a.count);

  return {
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      uptimeSec: Math.round((Date.now() - startedAt) / 1000),
      rss: current.rss,
      heapUsed: current.heapUsed,
      heapTotal: current.heapTotal,
      external: current.external,
      rssMb: Number((current.rss / 1048576).toFixed(1)),
      heapUsedMb: Number((current.heapUsed / 1048576).toFixed(1))
    },
    system: {
      platform: `${os.type()} ${os.release()}`,
      totalMemMb: Math.round(os.totalmem() / 1048576),
      freeMemMb: Math.round(os.freemem() / 1048576),
      memUsedPct: Number((((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1)),
      cpuCount: os.cpus().length,
      cpuModel: os.cpus()[0]?.model?.trim() || 'unknown',
      loadAvg1: Number(os.loadavg()[0].toFixed(2)),
      loadAvg5: Number(os.loadavg()[1].toFixed(2)),
      loadAvg15: Number(os.loadavg()[2].toFixed(2)),
      osUptimeSec: Math.round(os.uptime())
    },
    requests: {
      total: totalRequests,
      errors5xx: errorResponses,
      active: activeRequests,
      avgMs: sortedLatency.length
        ? Number((sortedLatency.reduce((a, b) => a + b, 0) / sortedLatency.length).toFixed(2))
        : 0,
      p50Ms: percentile(sortedLatency, 50),
      p95Ms: percentile(sortedLatency, 95),
      p99Ms: percentile(sortedLatency, 99),
      slowTotal: routes.reduce((a, r) => a + r.slowCount, 0),
      errorRatePct: totalRequests ? Number(((errorResponses / totalRequests) * 100).toFixed(2)) : 0,
      topRoutes: routes.slice(0, 20)
    },
    memorySeries: memorySamples.slice()
  };
}
