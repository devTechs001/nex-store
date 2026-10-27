// Procedural Web Audio API Sound Synthesizer & Native Push Notification Engine

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSound(type = 'ping', { enabled = true, volume = 0.35 } = {}) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const gainValue = Math.max(0.02, Math.min(1, Number(volume) || 0.35));

  const playTone = (freq, startOffset, duration, wave = 'sine', endFreq = null, peakGain = 0.25) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now + startOffset);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + startOffset + duration);
      }

      const scaledPeak = Math.min(0.8, peakGain * gainValue * 2.2);
      gain.gain.setValueAtTime(0.0001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(scaledPeak, now + startOffset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration + 0.02);
    } catch {
      // ignore audio context restrictions before user gesture
    }
  };

  switch (type) {
    case 'click':
      playTone(680, 0, 0.045, 'triangle', 420, 0.14);
      break;

    case 'cart':
      // Crisp 2-note upward pop
      playTone(523.25, 0, 0.09, 'sine', 659.25, 0.24);
      playTone(783.99, 0.075, 0.16, 'triangle', 1046.5, 0.28);
      break;

    case 'success':
      // Harmonic triad arpeggio (C5 -> E5 -> G5 -> C6)
      playTone(523.25, 0, 0.12, 'sine', null, 0.24);
      playTone(659.25, 0.07, 0.14, 'sine', null, 0.26);
      playTone(783.99, 0.14, 0.16, 'triangle', null, 0.28);
      playTone(1046.5, 0.22, 0.32, 'sine', null, 0.32);
      break;

    case 'push':
      // Crystal bell notification chime
      playTone(880, 0, 0.16, 'sine', 1174.66, 0.28);
      playTone(1318.51, 0.11, 0.28, 'triangle', 1760, 0.3);
      break;

    case 'security':
      // Cyber telemetry scan lock chime
      playTone(440, 0, 0.08, 'sawtooth', 880, 0.18);
      playTone(880, 0.09, 0.1, 'triangle', 1320, 0.22);
      playTone(1320, 0.19, 0.22, 'sine', 1760, 0.26);
      break;

    case 'alert':
      // Urgent dual-pulse security/threat warning
      playTone(340, 0, 0.14, 'sawtooth', 260, 0.28);
      playTone(320, 0.16, 0.22, 'sawtooth', 220, 0.3);
      break;

    case 'server':
      // Edge server node boot / telemetry sweep
      playTone(330, 0, 0.11, 'sine', 660, 0.22);
      playTone(660, 0.1, 0.2, 'triangle', 990, 0.25);
      break;

    case 'ping':
    default:
      // Subtle real-time WebSocket pulse
      playTone(740, 0, 0.11, 'sine', 987.77, 0.22);
      break;
  }
}

export async function requestDesktopPushPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

export function triggerDesktopPush(title, body, tag = 'nex-store-push') {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }
  try {
    const notif = new Notification(title, {
      body,
      tag,
      silent: false
    });
    setTimeout(() => notif.close(), 6000);
    return true;
  } catch {
    return false;
  }
}
