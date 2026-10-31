import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  X,
  Play,
  Trash2,
  Sparkles,
  Server,
  Shield,
  Database,
  Cpu,
  Globe,
  RefreshCw,
  ChevronRight,
  CornerDownLeft,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Plus,
  Save,
  Download,
  BookOpen,
  Zap,
  Filter,
  Layers
} from 'lucide-react';

const QUICK_COMMANDS = [
  { label: 'neofetch', cmd: 'neofetch', icon: Sparkles, desc: 'NEX-OS v4.0 ASCII & 23-table telemetry' },
  { label: 'Add Hardware SKU (CLI)', cmd: 'nex product add "Axon NPU Card" --price=999 --cat=compute --stock=25', icon: Plus, desc: 'Create real Hardware SKU from CLI' },
  { label: 'Run Rust Polyglot AI', cmd: 'nex polyglot run rust', icon: Zap, desc: 'Run Rust 1.82 SIMD Engine in CLI' },
  { label: 'Run Python Tensor AI', cmd: 'nex polyglot run python', icon: Cpu, desc: 'Run Python 3.12 Neural Forecaster' },
  { label: 'nex products', cmd: 'nex products', icon: Layers, desc: 'List all Hardware SKUs & stock' },
  { label: 'nex subscriptions', cmd: 'nex subscriptions', icon: Shield, desc: 'Inspect modifiable subscription tiers' },
  { label: 'nex mobile', cmd: 'nex mobile', icon: Globe, desc: 'Inspect Native / Flutter SDK add-ons' },
  { label: 'nex status', cmd: 'nex status', icon: Server, desc: '23-table SQLite & Edge health' },
  { label: 'nex servers | grep ONLINE', cmd: 'nex servers | grep ONLINE', icon: Filter, desc: 'Pipe filter online nodes' },
  { label: 'help', cmd: 'help', icon: BookOpen, desc: 'Full NEX-SH v4.0 manual' }
];

const PIPE_SNIPPETS = [
  { label: '| grep ONLINE', snippet: ' | grep ONLINE' },
  { label: '| head 6', snippet: ' | head 6' },
  { label: '| tail 5', snippet: ' | tail 5' },
  { label: '| count', snippet: ' | count' },
  { label: '| sort', snippet: ' | sort' },
  { label: '| upper', snippet: ' | upper' },
  { label: '&& nex status', snippet: ' && nex status' }
];

const AUTOCOMPLETE_COMMANDS = [
  'neofetch',
  'help',
  'nex product add "Axon NPU Card" --price=999 --cat=compute --stock=25',
  'nex product add "Hyperion 8K Display" --price=1799 --cat=compute --stock=12',
  'nex products',
  'nex polyglot',
  'nex polyglot run rust',
  'nex polyglot run python',
  'nex polyglot run cpp',
  'nex polyglot run java',
  'nex subscriptions',
  'nex mobile',
  'nex status',
  'nex benchmark',
  'nex scripts',
  'nex run nightly-secops-audit.nexsh',
  'nex run warehouse-auto-replenish.nexsh',
  'nex run netlify-ecosystem-sync.nexsh',
  'nex run edge-cluster-healthcheck.nexsh',
  'nex servers',
  'nex servers | grep ONLINE',
  'nex security scan',
  'nex restock',
  'nex deploy https://quantum-synth-ui.netlify.app',
  'nex sql SELECT name, price, stock FROM products ORDER BY price DESC LIMIT 5',
  'top',
  'netstat',
  'uname -a',
  'uptime',
  'env',
  'whoami',
  'clear'
];

function applyClientPipes(rawOutput, pipeSegments) {
  let lines = String(rawOutput || '').split('\n');
  for (const rawPipe of pipeSegments) {
    const seg = rawPipe.trim();
    if (!seg) continue;
    const parts = seg.split(/\s+/);
    const pipeCmd = parts[0].toLowerCase();
    const pipeArg = parts.slice(1).join(' ');

    if (pipeCmd === 'grep' || pipeCmd === 'filter') {
      const needle = pipeArg.replace(/^["']|["']$/g, '').toLowerCase();
      lines = needle ? lines.filter((l) => l.toLowerCase().includes(needle)) : lines;
    } else if (pipeCmd === 'head') {
      const n = Math.max(1, parseInt(pipeArg, 10) || 5);
      lines = lines.slice(0, n);
    } else if (pipeCmd === 'tail') {
      const n = Math.max(1, parseInt(pipeArg, 10) || 5);
      lines = lines.slice(-n);
    } else if (pipeCmd === 'count' || pipeCmd === 'wc') {
      const nonEmpty = lines.filter((l) => l.trim().length > 0).length;
      lines = [`Line count: ${lines.length} (${nonEmpty} non-empty) | Characters: ${lines.join('\n').length}`];
    } else if (pipeCmd === 'sort') {
      lines = [...lines].sort((a, b) => a.localeCompare(b));
    } else if (pipeCmd === 'reverse') {
      lines = [...lines].reverse();
    } else if (pipeCmd === 'upper') {
      lines = lines.map((l) => l.toUpperCase());
    }
  }
  return lines.join('\n');
}

export default function InteractiveTerminalModal({
  isOpen,
  onClose,
  terminalLogs = [],
  terminalScripts = [],
  serverNodes = [],
  securityEvents = [],
  integrations = [],
  products = [],
  apps = [],
  onExecuteCommand,
  onExecuteTerminalCommand,
  onSaveTerminalScript,
  onPlaySound,
  soundEnabled = true
}) {
  const execHandler = onExecuteTerminalCommand || onExecuteCommand;
  const triggerSound = (type) => {
    if (soundEnabled && typeof onPlaySound === 'function') {
      onPlaySound(type);
    }
  };
  const [activeTab, setActiveTab] = useState('shell'); // 'shell' | 'scripts' | 'reference'
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  // Script Studio state
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [scriptName, setScriptName] = useState('custom-ops-check.nexsh');
  const [scriptCategory, setScriptCategory] = useState('DevOps');
  const [scriptDescription, setScriptDescription] = useState('Automated health, stock, and edge telemetry check.');
  const [scriptCode, setScriptCode] = useState(
    '# NEX-SH v3.0 Custom Automation Playbook\necho "=== STARTING NEXUS CLUSTER DIAGNOSTIC ==="\nuname -a\nnex status\nnex servers | grep ONLINE\nnex benchmark'
  );
  const [isSavingScript, setIsSavingScript] = useState(false);
  const [scriptBanner, setScriptBanner] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const initialEntries = (terminalLogs || [])
        .slice()
        .reverse()
        .map((item) => ({
          id: item.id,
          command: item.command,
          output: item.output,
          status: item.status || 'ok',
          durationMs: item.duration_ms || 8,
          timestamp: item.created_at
        }));
      setHistory(initialEntries);
      if (activeTab === 'shell') {
        setTimeout(() => inputRef.current?.focus(), 80);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (terminalScripts.length > 0 && !selectedScriptId) {
      const first = terminalScripts[0];
      setSelectedScriptId(first.id);
      setScriptName(first.name);
      setScriptCategory(first.category || 'DevOps');
      setScriptDescription(first.description || '');
      setScriptCode(first.code || '');
    }
  }, [terminalScripts, selectedScriptId]);

  useEffect(() => {
    if (activeTab === 'shell') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen, activeTab]);

  if (!isOpen) return null;

  const selectScriptForEdit = (script) => {
    setSelectedScriptId(script.id);
    setScriptName(script.name);
    setScriptCategory(script.category || 'DevOps');
    setScriptDescription(script.description || '');
    setScriptCode(script.code || '');
    setScriptBanner(null);
    triggerSound('click');
  };

  const handleCreateNewScript = () => {
    setSelectedScriptId(`NEW-${Date.now()}`);
    setScriptName(`playbook-${(terminalScripts.length || 0) + 1}.nexsh`);
    setScriptCategory('Automation');
    setScriptDescription('Custom multi-step NEX-SH v3.0 playbook with pipe filtering.');
    setScriptCode(
      '# Custom NEX-SH v3.0 Playbook\necho ">>> Running Custom NEX-SH Automation <<<" \nnex status\nnex servers | grep ONLINE\nnex stock\nnex benchmark'
    );
    setScriptBanner(null);
    triggerSound('click');
  };

  const executeLocalSingleFallback = (singleRaw) => {
    const pipeParts = singleRaw.split('|');
    const baseCmd = pipeParts[0].trim();
    const pipeSegments = pipeParts.slice(1);
    const lower = baseCmd.toLowerCase();

    let out = '';
    if (lower === 'help' || lower === 'nex help') {
      out = [
        'NEX-SH v3.0 — Enterprise Edge, SQLite & Pipe Scripting Shell',
        '──────────────────────────────────────────────────────────────────────',
        '  nex status                 Full 17-table SQLite & Edge health summary',
        '  nex benchmark              Run CPU, SQLite IOPS & Edge latency benchmark',
        '  nex scripts                List saved .nexsh automation playbooks',
        '  nex run <script-name>      Execute a saved multi-line .nexsh playbook',
        '  nex servers                List regional edge nodes, CPU/RAM & RPS',
        '  nex security               Display Zero-Trust WAF shield events',
        '  nex integrations           Inspect external platform webhooks',
        '  nex stock                  Audit low-stock hardware SKUs',
        '  nex restock                Auto-replenish low-stock SKUs (+15 units)',
        '  nex deploy <url>           Import & verify an app from Netlify/Vercel/GitHub',
        '  nex sql <SELECT ...>       Execute live read-only SQLite query',
        '  top / netstat / uname -a   Real-time process, socket & kernel diagnostics',
        '  <cmd> | grep <pat>         Pipe output through grep, head, tail, count, sort, upper',
        '  <cmd1> && <cmd2>           Chain multiple commands sequentially'
      ].join('\n');
    } else if (lower.startsWith('echo ')) {
      out = baseCmd.slice(5).replace(/^["']|["']$/g, '');
    } else if (lower === 'whoami') {
      out = 'nex-admin (uid=0, gid=0, groups=wheel,secops,edge-cluster,sqlite-dba)';
    } else if (lower === 'uname' || lower === 'uname -a') {
      out = 'NEX-OS 6.8.12-edge-x86_64 #1 SMP PREEMPT_DYNAMIC SQLite/3.45 WebSocket/13 ZeroTrust-WAF';
    } else if (lower === 'uptime') {
      out = 'up 42 days, 19:14, 1 active admin session, load average: 0.18, 0.22, 0.19';
    } else if (lower === 'env') {
      out = [
        'NEX_SHELL_VERSION=3.0.0-enterprise',
        'NEX_DB_ENGINE=SQLite3-WAL (17 tables active)',
        'NEX_EDGE_REGIONS=us-east-1,eu-central-1,ap-northeast-1,af-south-1,us-west-2',
        'NEX_WAF_MODE=ZERO_TRUST_ENFORCING'
      ].join('\n');
    } else if (lower === 'top' || lower === 'ps') {
      out = [
        'PID    USER       PR  CPU%   MEM%   TIME+     COMMAND',
        '1001   nex-root   20  14.2%  28.4%  412:19.04 nex-edge-router --cluster-mesh',
        '1048   nex-waf    10   6.8%  12.1%  198:44.12 zero-trust-shield --tls13-strict',
        '1102   nex-db     15   4.1%  18.9%  305:09.88 sqlite-wal-engine --tables=17'
      ].join('\n');
    } else if (lower === 'netstat') {
      out = [
        'Proto  Local Address          Foreign Address        State           Service',
        'tcp4   0.0.0.0:3000           172.64.148.22:443      ESTABLISHED     nex-http-gateway',
        'ws4    0.0.0.0:3000/ws        10.240.18.9:59122      CONNECTED       realtime-telemetry-bus'
      ].join('\n');
    } else if (lower === 'nex benchmark') {
      out = [
        '⚡ NEX-SH v3.0 PERFORMANCE & SQLITE IOPS BENCHMARK',
        '  • SQLite Read Throughput     : 148,500 rows/sec',
        '  • Global Edge Anycast RTT    : 14.2 ms avg across 5 regions',
        '  • Zero-Trust WAF Inspection  : 99.98% threat mitigation score',
        '  • Benchmark Verdict          : OPTIMAL (Grade A+ Enterprise Telemetry)'
      ].join('\n');
    } else if (lower === 'nex status') {
      out = [
        '⚡ NEXUS ENTERPRISE TELEMETRY STATUS (17 SQLite Tables Active)',
        `  • Hardware Catalog  : ${products.length} SKUs`,
        `  • Verified Apps     : ${apps.length} sandboxed packages`,
        `  • Edge Server Nodes : ${serverNodes.length} regional clusters`,
        `  • Saved Playbooks   : ${terminalScripts.length} .nexsh automation scripts`,
        `  • Security Events   : ${securityEvents.length} WAF events monitored`
      ].join('\n');
    } else if (lower === 'nex servers') {
      out = [
        '🌐 GLOBAL EDGE SERVER NODES',
        ...serverNodes.map(
          (n) =>
            `  [${String(n.status).toUpperCase()}] ${n.id} (${n.name}) | CPU: ${n.cpu_load}% | RAM: ${n.memory_pct}% | ${n.requests_per_sec} req/s | ${n.latency_ms}ms`
        )
      ].join('\n');
    } else if (lower === 'nex security') {
      out = [
        '🛡️ ZERO-TRUST WAF SECURITY EVENTS',
        ...securityEvents.slice(0, 8).map(
          (e) =>
            `  [${String(e.severity).toUpperCase()}] ${e.threat_type} (${e.source_ip}) -> ${e.action_taken} :: ${e.description}`
        )
      ].join('\n');
    } else if (lower === 'nex integrations') {
      out = [
        '🔌 EXTERNAL PLATFORM INTEGRATIONS',
        ...integrations.map(
          (i) =>
            `  [${String(i.status).toUpperCase()}] ${i.name} (${i.category}) | ${i.Sync_count || i.sync_count || 0} syncs | ${i.latency_ms}ms`
        )
      ].join('\n');
    } else if (lower === 'nex stock') {
      const low = products.filter((p) => Number(p.stock) <= 10);
      out = low.length
        ? ['📦 LOW STOCK HARDWARE SKUS (<= 10 units):', ...low.map((p) => `  • ${p.sku} — ${p.name}: ${p.stock} units`)].join('\n')
        : '✅ All hardware SKUs have healthy stock (> 10 units).';
    } else if (lower === 'nex scripts') {
      out = [
        '📜 SAVED NEX-SH (.nexsh) AUTOMATION PLAYBOOKS:',
        ...terminalScripts.map(
          (s) => `  • ${s.name.padEnd(32, ' ')} [${s.category}]Runs=${s.run_count} — ${s.description}`
        )
      ].join('\n');
    } else if (lower.startsWith('nex run ')) {
      const target = baseCmd.slice(8).trim().toLowerCase();
      const found = terminalScripts.find(
        (s) => s.name.toLowerCase() === target || s.id.toLowerCase() === target || s.name.toLowerCase().replace(/\.nexsh$/, '') === target
      );
      if (!found) {
        out = `Playbook "${target}" not found.`;
      } else {
        const lines = String(found.code || '')
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith('#'));
        const stepOut = lines.map((step) => `  $ ${step}\n${executeLocalSingleFallback(step)}`);
        out = [`▶ EXECUTING PLAYBOOK: ${found.name}`, ...stepOut].join('\n\n');
      }
    } else {
      out = `Executed: ${baseCmd}`;
    }

    return pipeSegments.length > 0 ? applyClientPipes(out, pipeSegments) : out;
  };

  const executeCommand = async (rawCmd) => {
    const trimmed = String(rawCmd || '').trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === 'clear') {
      setHistory([]);
      setInput('');
      triggerSound('click');
      return;
    }

    setCmdHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)].slice(0, 40));
    setHistoryIdx(-1);
    setInput('');
    setIsRunning(true);
    triggerSound('ping');

    try {
      if (execHandler) {
        const res = await execHandler(trimmed);
        if (res?.clear) {
          setHistory([]);
        } else if (res) {
          setHistory((prev) => [
            ...prev,
            {
              id: res.entry?.id || `TERM-${Date.now()}`,
              command: trimmed,
              output: res.output,
              status: res.status || 'ok',
              durationMs: res.durationMs || 9,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      }
    } catch {
      const statements = trimmed
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('#'))
        .flatMap((l) => l.split('&&').map((s) => s.trim()).filter(Boolean));

      const outputs = statements.map((stmt) =>
        statements.length > 1 ? `❯ ${stmt}\n${executeLocalSingleFallback(stmt)}` : executeLocalSingleFallback(stmt)
      );

      setHistory((prev) => [
        ...prev,
        {
          id: `TERM-LOCAL-${Date.now()}`,
          command: trimmed,
          output: outputs.join('\n\n'),
          status: 'ok',
          durationMs: 6,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIdx < cmdHistory.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const lower = input.trim().toLowerCase();
      if (!lower) return;
      const match = AUTOCOMPLETE_COMMANDS.find((c) => c.toLowerCase().startsWith(lower));
      if (match) setInput(match);
    }
  };

  const handleRunPlaybookFromStudio = async (codeToRun, labelName) => {
    setActiveTab('shell');
    await executeCommand(codeToRun);
    if (labelName) {
      setScriptBanner({ type: 'ok', text: `Executed playbook "${labelName}" in interactive shell.` });
    }
  };

  const handleSavePlaybook = async (e) => {
    e.preventDefault();
    if (!scriptName.trim() || !scriptCode.trim()) return;
    setIsSavingScript(true);
    setScriptBanner(null);
    try {
      const cleanName = scriptName.trim().endsWith('.nexsh')
        ? scriptName.trim()
        : `${scriptName.trim()}.nexsh`;
      if (onSaveTerminalScript) {
        const saved = await onSaveTerminalScript({
          id: selectedScriptId && !selectedScriptId.startsWith('NEW-') ? selectedScriptId : undefined,
          name: cleanName,
          category: scriptCategory,
          description: scriptDescription,
          code: scriptCode
        });
        if (saved?.id) setSelectedScriptId(saved.id);
      }
      setScriptName(cleanName);
      setScriptBanner({
        type: 'ok',
        text: `Saved "${cleanName}" to SQLite table terminal_scripts. Run it anytime via: nex run ${cleanName}`
      });
      triggerSound('success');
    } catch (err) {
      setScriptBanner({
        type: 'error',
        text: err?.message || 'Failed to save playbook'
      });
    } finally {
      setIsSavingScript(false);
    }
  };

  const handleExportTranscript = () => {
    const lines = [
      '# NEX-SH v3.0 Enterprise Cloud CLI Session Transcript',
      `# Exported at: ${new Date().toISOString()}`,
      '# ──────────────────────────────────────────────────────────────────────',
      ''
    ];
    history.forEach((entry) => {
      lines.push(`[${entry.timestamp || new Date().toISOString()}] (${entry.durationMs || 5}ms) [${entry.status}]`);
      lines.push(`nex@edge-control:~$ ${entry.command}`);
      lines.push(String(entry.output || ''));
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nex-sh-session-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.log`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    triggerSound('success');
  };

  const appendPipeSnippet = (snippet) => {
    setInput((prev) => `${prev.trim() || 'nex servers'}${snippet}`);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 theme-modal-backdrop animate-fadeIn">
      <div className="relative w-full max-w-6xl theme-modal-panel theme-card border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Terminal Window Titlebar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 theme-header border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 transition-colors"
                title="Close Terminal"
              />
              <span className="w-3 h-3 rounded-full bg-amber-400/90" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/90" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-bold tracking-wider">root@nex-edge-cluster:~ (NEX-SH v3.0 Power Shell)</span>
              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px]">
                SQLite 17 Tables • Pipes • .nexsh Playbooks
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('shell')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'shell'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Interactive Shell
            </button>
            <button
              onClick={() => setActiveTab('scripts')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'scripts'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              .nexsh Script Studio ({terminalScripts.length})
            </button>
            <button
              onClick={() => setActiveTab('reference')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'reference'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Pipe & CLI Manual
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTranscript}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              title="Download .log session transcript"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export .log</span>
            </button>
            <button
              onClick={() => setHistory([])}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              title="Clear console output"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Close terminal modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE SHELL */}
        {activeTab === 'shell' && (
          <>
            {/* Quick-Command Execution Ribbon */}
            <div className="px-4 py-2.5 bg-slate-900/70 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                Quick Exec:
              </span>
              {QUICK_COMMANDS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => executeCommand(item.cmd)}
                    disabled={isRunning}
                    title={item.desc}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-cyan-500/20 border border-slate-700/80 hover:border-cyan-500/40 text-xs font-mono text-slate-200 hover:text-cyan-300 transition-all shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Pipe & Chain Composer Bar */}
            <div className="px-4 py-1.5 bg-slate-950/90 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 shrink-0 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Append Pipe / Chain:
              </span>
              {PIPE_SNIPPETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => appendPipeSnippet(p.snippet)}
                  className="px-2 py-0.5 rounded bg-purple-950/40 hover:bg-purple-500/20 border border-purple-500/30 text-[11px] font-mono text-purple-300 transition-colors shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Console Output Scroll Area */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-sm space-y-4 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 cursor-text min-h-[340px]"
            >
              {/* Welcome MOTD Banner */}
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">
                    ⚡ NEX-SH v3.0 Enterprise Cloud CLI, Pipe Engine & Automation Shell
                  </span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    TTY0 CONNECTED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Supports Unix pipes (<code className="text-purple-300">| grep</code>,{' '}
                  <code className="text-purple-300">| head</code>, <code className="text-purple-300">| count</code>,{' '}
                  <code className="text-purple-300">| sort</code>), command chaining (<code className="text-cyan-300">&amp;&amp;</code>),
                  live SQLite queries (<code className="text-cyan-300">nex sql SELECT ...</code>), and multi-step playbooks (
                  <code className="text-emerald-300">nex run nightly-secops-audit.nexsh</code>).
                </p>
              </div>

              {/* Command Log Entries */}
              {history.map((entry) => (
                <div key={entry.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-emerald-400 font-bold">nex@edge-control</span>
                      <span className="text-slate-500">:</span>
                      <span className="text-cyan-400 font-bold">~</span>
                      <span className="text-slate-400">$</span>
                      <span className="text-white font-semibold break-all">{entry.command}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
                      <span>{entry.durationMs || 5}ms</span>
                      {entry.status === 'error' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                  <pre
                    className={`p-3 rounded-xl border whitespace-pre-wrap break-words leading-relaxed overflow-x-auto text-xs ${
                      entry.status === 'error'
                        ? 'bg-rose-950/25 border-rose-500/30 text-rose-200'
                        : 'bg-slate-900/80 border-slate-800/90 text-slate-200'
                    }`}
                  >
                    {entry.output}
                  </pre>
                </div>
              ))}

              {isRunning && (
                <div className="flex items-center gap-2 text-cyan-400 text-xs animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing command pipeline on NEX-SH v3.0 engine...</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Command Input Prompt */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeCommand(input);
              }}
              className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
            >
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm text-emerald-400 shrink-0">
                <ChevronRight className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline font-bold">nex@edge:~$</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, pipe (nex servers | grep ONLINE), chain (&&), or playbook (nex run ...)"
                className="flex-1 bg-transparent font-mono text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                aria-label="Terminal command input"
              />
              <button
                type="submit"
                disabled={isRunning || !input.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-mono font-bold text-xs transition-all"
              >
                < Play className="w-3.5 h-3.5" />
                <span>Run</span>
                <CornerDownLeft className="w-3 h-3 opacity-75" />
              </button>
            </form>
          </>
        )}

        {/* TAB 2: .NEXSH SCRIPT STUDIO & PLAYBOOK RUNNER */}
        {activeTab === 'scripts' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[450px]">
            {/* Left Sidebar: Saved SQLite Playbooks */}
            <div className="lg:col-span-4 border-r border-slate-800 bg-slate-900/60 p-4 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">
                    SQLite Playbooks (`terminal_scripts`)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Multi-step `.nexsh` scripts stored in table #17
                  </p>
                </div>
                <button
                  onClick={handleCreateNewScript}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-mono font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New
                </button>
              </div>

              <div className="space-y-2">
                {terminalScripts.map((script) => {
                  const isSelected = script.id === selectedScriptId;
                  return (
                    <div
                      key={script.id}
                      onClick={() => selectScriptForEdit(script)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-950/30'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-white truncate">
                          {script.name}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700">
                          {script.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {script.description}
                      </p>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                        <span>Runs: {script.run_count || 0}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunPlaybookFromStudio(`nex run ${script.name}`, script.name);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          Run Playbook
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Multi-Line .nexsh Script Editor */}
            <form
              onSubmit={handleSavePlaybook}
              className="lg:col-span-8 p-4 sm:p-5 flex flex-col gap-3 overflow-y-auto bg-slate-950"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>.nexsh Playbook Editor & Batch Runner</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Write multi-line NEX-SH commands, comments (`#`), pipes (`| grep`), and SQL queries.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunPlaybookFromStudio(scriptCode, scriptName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Execute Script in Shell
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingScript}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingScript ? 'Saving...' : 'Save to SQLite'}
                  </button>
                </div>
              </div>

              {scriptBanner && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                    scriptBanner.type === 'error'
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <span>{scriptBanner.text}</span>
                  <button
                    type="button"
                    onClick={() => setScriptBanner(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Playbook Filename (.nexsh)
                  </label>
                  <input
                    type="text"
                    value={scriptName}
                    onChange={(e) => setScriptName(e.target.value)}
                    placeholder="nightly-secops-audit.nexsh"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Subsystem Category
                  </label>
                  <select
                    value={scriptCategory}
                    onChange={(e) => setScriptCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="SecOps">SecOps</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="App Ecosystem">App Ecosystem</option>
                    <option value="Edge Ops">Edge Ops</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Automation">Automation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={scriptDescription}
                  onChange={(e) => setScriptDescription(e.target.value)}
                  placeholder="Describe what this multi-step playbook automates..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Multi-Line NEX-SH Script Source (`#` comments supported)</span>
                  <span className="text-purple-300">
                    {scriptCode.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).length} executable statements
                  </span>
                </div>
                <textarea
                  value={scriptCode}
                  onChange={(e) => setScriptCode(e.target.value)}
                  rows={10}
                  className="flex-1 w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-cyan-200 leading-relaxed focus:border-purple-500 focus:outline-none"
                  placeholder="# Write NEX-SH commands, one per line..."
                />
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: PIPE & CLI REFERENCE MANUAL */}
        {activeTab === 'reference' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-950 font-mono text-xs">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <h3 className="text-sm font-bold text-emerald-300 mb-1">
                📖 NEX-SH v3.0 Power Shell, Unix Pipes & Scripting Reference
              </h3>
              <p className="text-slate-300 text-xs">
                Click any example command below to execute it immediately in the Interactive Shell.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <h4 className="text-cyan-300 font-bold uppercase tracking-wider text-xs">
                  1. Unix Pipe Filters (`|`)
                </h4>
                {[
                  { cmd: 'nex servers | grep ONLINE', desc: 'Filter edge nodes matching "ONLINE"' },
                  { cmd: 'nex security | head 4', desc: 'Return first 4 lines of WAF output' },
                  { cmd: 'nex integrations | tail 3', desc: 'Return last 3 lines of output' },
                  { cmd: 'nex servers | count', desc: 'Count lines & characters in output' },
                  { cmd: 'nex scripts | sort | upper', desc: 'Chain multiple pipes (sort + uppercase)' }
                ].map((ex) => (
                  <div key={ex.cmd} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div>
                      <code className="text-purple-300 font-semibold">{ex.cmd}</code>
                      <p className="text-[11px] text-slate-400">{ex.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('shell');
                        executeCommand(ex.cmd);
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 shrink-0"
                    >
                      Run
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <h4 className="text-emerald-300 font-bold uppercase tracking-wider text-xs">
                  2. Command Chaining (`&&`) & System Diagnostics
                </h4>
                {[
                  { cmd: 'uname -a && uptime && whoami', desc: 'Chain kernel, uptime & identity checks' },
                  { cmd: 'top', desc: 'Live edge cluster process & CPU/MEM table' },
                  { cmd: 'netstat', desc: 'Inspect active HTTP/3, WebSocket & mTLS sockets' },
                  { cmd: 'nex benchmark', desc: 'Run SQLite IOPS & Edge latency benchmark' },
                  { cmd: 'nex stock && nex restock', desc: 'Audit low stock and auto-replenish' }
                ].map((ex) => (
                  <div key={ex.cmd} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div>
                      <code className="text-emerald-300 font-semibold">{ex.cmd}</code>
                      <p className="text-[11px] text-slate-400">{ex.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('shell');
                        executeCommand(ex.cmd);
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 shrink-0"
                    >
                      Run
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
