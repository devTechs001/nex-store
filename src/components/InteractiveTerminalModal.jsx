import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  X,
  Play,
  Sparkles,
  Trash2,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Server,
  Database,
  Globe
} from 'lucide-react';

const QUICK_COMMANDS = [
  { label: 'help', cmd: 'help', badge: 'Guide' },
  { label: 'nex status', cmd: 'nex status', badge: 'System' },
  { label: 'nex servers', cmd: 'nex servers', badge: '6 Nodes' },
  { label: 'nex ping', cmd: 'nex ping', badge: 'Latency' },
  { label: 'nex apps', cmd: 'nex apps', badge: 'Packages' },
  {
    label: 'nex deploy netlify',
    cmd: 'nex deploy https://quantum-synth-pro.netlify.app',
    badge: 'Netlify'
  },
  { label: 'nex security scan', cmd: 'nex security scan', badge: 'Audit' },
  { label: 'nex security block', cmd: 'nex security block', badge: 'WAF' },
  { label: 'nex products', cmd: 'nex products', badge: 'Catalog' },
  { label: 'nex restock', cmd: 'nex restock', badge: '+15 Stock' },
  {
    label: 'nex sql apps',
    cmd: 'nex sql SELECT name, source_provider, downloads, security_score FROM apps',
    badge: 'SQL'
  },
  { label: 'nex theme cyber', cmd: 'nex theme cyber', badge: 'Theme' }
];

export default function InteractiveTerminalModal({
  isOpen,
  onClose,
  terminalLogs = [],
  onExecuteCommand,
  wsConnected,
  onPlaySound
}) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [running, setRunning] = useState(false);
  const [localEntries, setLocalEntries] = useState([
    {
      id: 'welcome-banner',
      command: 'nex status --boot',
      output: [
        '╔══════════════════════════════════════════════════════════════════════════════╗',
        '║  NEX-SH v2.7 • Interactive Cloud, Edge Server & SQLite Subsystem Terminal   ║',
        '║  Type "help" or click any command chip above to execute live operations.     ║',
        '╚══════════════════════════════════════════════════════════════════════════════╝'
      ].join('\n'),
      exit_code: 0,
      duration_ms: 0.8,
      created_at: new Date().toISOString()
    }
  ]);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localEntries, terminalLogs, isOpen]);

  if (!isOpen) return null;

  const handleRun = async (rawCommand) => {
    const cmd = (rawCommand ?? input).trim();
    if (!cmd) return;

    if (cmd.toLowerCase() === 'clear') {
      onPlaySound?.('click');
      setLocalEntries([]);
      setInput('');
      return;
    }

    setHistory((prev) => [cmd, ...prev.slice(0, 30)]);
    setHistoryIdx(-1);
    setInput('');
    setRunning(true);
    onPlaySound?.('click');

    const result = await onExecuteCommand?.(cmd);
    setRunning(false);

    if (result) {
      setLocalEntries((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          command: cmd,
          output: result.output,
          exit_code: result.exitCode ?? 0,
          duration_ms: result.durationMs ?? 1.2,
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIdx < history.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = QUICK_COMMANDS.find((q) => q.cmd.startsWith(input.toLowerCase()));
      if (match) setInput(match.cmd);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col overflow-hidden rounded-3xl border border-indigo-500/40 bg-slate-950 text-slate-100 shadow-2xl transition-all ${
          isMaximized ? 'h-[92vh] w-full max-w-7xl' : 'h-[82vh] w-full max-w-5xl'
        }`}
      >
        {/* Top Terminal Window Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="h-3 w-3 rounded-full bg-rose-500 hover:opacity-80 cursor-pointer"
                title="Close Terminal"
              />
              <button
                onClick={() => setIsMaximized((m) => !m)}
                className="h-3 w-3 rounded-full bg-amber-400 hover:opacity-80 cursor-pointer"
                title="Toggle Size"
              />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center gap-2 font-mono-num text-xs font-bold text-slate-200">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>root@nex-edge-nbo:~# (NEX-SH v2.7 Cloud CLI)</span>
              <span className="rounded-md bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-[10px] text-emerald-400">
                {wsConnected ? 'WSS + SQLITE LIVE' : 'LOCAL EDGE SHELL'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocalEntries([])}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 font-mono-num text-[11px] text-slate-300 hover:text-white cursor-pointer"
              title="Clear Scrollback"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
            <button
              onClick={() => setIsMaximized((m) => !m)}
              className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:text-white cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* How It Works Architecture Strip + 1-Click Command Chips */}
        <div className="border-b border-slate-800/90 bg-slate-900/60 px-4 py-2.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                How NEX-SH Works:
              </span>
              <span className="inline-flex items-center gap-1">
                <Server className="h-3 w-3 text-indigo-400" /> 1. Parses CLI command (`Tab` autocomplete, `↑/↓` history)
              </span>
              <span>→</span>
              <span className="inline-flex items-center gap-1">
                <Database className="h-3 w-3 text-emerald-400" /> 2. Executes on `/api/terminal/exec` & logs to SQLite `terminal_logs`
              </span>
              <span>→</span>
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3 text-amber-400" /> 3. Broadcasts state changes via WebSockets
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="font-mono-num text-[10px] font-bold uppercase text-indigo-400 shrink-0 mr-1">
              1-Click Run:
            </span>
            {QUICK_COMMANDS.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => handleRun(q.cmd)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900 hover:border-cyan-400/60 hover:bg-slate-800 px-2.5 py-1 font-mono-num text-[11px] text-slate-200 transition cursor-pointer shrink-0"
              >
                <Play className="h-2.5 w-2.5 text-cyan-400" />
                <span>{q.label}</span>
                <span className="rounded bg-indigo-500/20 px-1 text-[9px] text-indigo-300">
                  {q.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Terminal Output Buffer */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          className="flex-1 overflow-y-auto p-4 font-mono-num text-xs space-y-4 bg-slate-950/95"
        >
          {localEntries.map((entry) => (
            <div key={entry.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">root@nex-edge-nbo:~#</span>
                  <span className="text-white font-bold">{entry.command}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-500">{entry.duration_ms}ms</span>
                  <span
                    className={`rounded px-1.5 py-0.2 font-bold ${
                      entry.exit_code === 0
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    EXIT {entry.exit_code}
                  </span>
                </div>
              </div>
              <pre className="whitespace-pre-wrap break-words rounded-xl border border-slate-800/90 bg-slate-900/70 p-3 text-[11px] leading-relaxed text-cyan-200 overflow-x-auto">
                {entry.output}
              </pre>
            </div>
          ))}

          {running && (
            <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
              <span>Executing command on NEX Edge Cluster...</span>
            </div>
          )}
        </div>

        {/* Bottom Command Input Prompt */}
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-3 flex items-center gap-2.5 font-mono-num text-xs">
          <span className="text-emerald-400 font-bold shrink-0">root@nex-edge-nbo:~#</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type a command (e.g. "help", "nex status", "nex deploy https://my-app.netlify.app", "nex servers")...'
            className="flex-1 bg-transparent text-white focus:outline-none placeholder-slate-500"
          />
          <button
            type="button"
            onClick={() => handleRun()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white cursor-pointer"
          >
            <Play className="h-3 w-3" />
            <span>Run</span>
          </button>
        </div>
      </div>
    </div>
  );
}
