import React from 'react';

/**
 * StatCard – small labeled metric block
 */
function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/8 p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-black ${color} leading-none`}>{value}</p>
    </div>
  );
}

/**
 * Stats Panel
 *
 * Shows:
 *  - User move count & time elapsed
 *  - AI: optimal moves, nodes explored, time taken
 *  - Efficiency comparison (user vs AI)
 */
export default function StatsPanel({ userMoves, elapsedTime, aiResult, heuristic, isSolved }) {
  const optimalMoves = aiResult ? aiResult.path.length - 1 : null;
  const efficiency = optimalMoves && userMoves > 0
    ? Math.round((optimalMoves / Math.max(userMoves, optimalMoves)) * 100)
    : null;

  const formatMs = (ms) => ms >= 1000
    ? `${(ms / 1000).toFixed(2)}s`
    : `${Math.round(ms)}ms`;

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── User Stats ── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold">Your Stats</h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Moves" value={userMoves} color="text-sky-300" />
          <StatCard label="Time" value={formatTime(elapsedTime)} color="text-amber-300" />
        </div>
        {isSolved && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2 text-center">
            <span className="text-emerald-400 text-sm font-bold">Puzzle Solved!</span>
          </div>
        )}
      </div>

      {/* ── AI Stats ── */}
      {aiResult && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold">A* Algorithm</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 capitalize">
              {heuristic}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <StatCard label="Optimal Moves" value={optimalMoves} color="text-violet-300" />
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Explored" value={aiResult.nodesExplored.toLocaleString()} color="text-pink-300" />
              <StatCard label="Time" value={formatMs(aiResult.timeTaken)} color="text-orange-300" />
            </div>
          </div>

          {/* Efficiency bar */}
          {efficiency !== null && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Your Efficiency</span>
                <span className={`font-bold ${efficiency >= 90 ? 'text-emerald-400' : efficiency >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                  {efficiency}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700
                    ${efficiency >= 90 ? 'bg-emerald-500' : efficiency >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${efficiency}%` }}
                />
              </div>
              <p className="text-[10px] text-white/30">
                {userMoves} moves vs {optimalMoves} optimal
                {userMoves === optimalMoves ? ' — Perfect!' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Heuristic Explainer ── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold">How it Works</h3>
        <div className="space-y-2 text-[11px] text-white/50 leading-relaxed">
          <p>
            <span className="text-violet-400 font-semibold">A* Search</span> finds the optimal path using:
          </p>
          <p className="font-mono bg-black/20 rounded px-2 py-1 text-white/60">
            f(n) = g(n) + h(n)
          </p>
          <div className="space-y-1">
            <p><span className="text-sky-400">g(n)</span> = moves made so far</p>
            <p><span className="text-amber-400">h(n)</span> = heuristic estimate to goal</p>
          </div>
          {heuristic === 'manhattan'
            ? <p className="text-emerald-400/80">Manhattan: Sum of |Δrow| + |Δcol| per tile</p>
            : <p className="text-pink-400/80">Hamming: Count of misplaced tiles</p>}
        </div>
      </div>
    </div>
  );
}
