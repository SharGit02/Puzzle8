import React, { useState, useEffect } from 'react';

const LS_KEY = 'puzzle_leaderboard';

export function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveLeaderboard(lb) {
  localStorage.setItem(LS_KEY, JSON.stringify(lb));
}

/**
 * Leaderboard Component (local storage only)
 */
export default function Leaderboard({ onClose }) {
  const [entries, setEntries] = useState(getLeaderboard());

  const formatTime = ms => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10
                      shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10
                        bg-gradient-to-r from-violet-900/40 to-pink-900/20">
          <div>
            <h2 className="text-lg font-black text-white">Leaderboard</h2>
            <p className="text-[11px] text-white/40">Local – sorted by fewest moves</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition
                       flex items-center justify-center text-white/60 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-96">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">
              No entries yet. Solve the puzzle to record a score!
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-white/30 border-b border-white/5">
                  <th className="py-2 pl-6 text-left">Rank</th>
                  <th className="py-2 text-left">Moves</th>
                  <th className="py-2 text-left">Time</th>
                  <th className="py-2 pr-6 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={i}
                    className="lb-row border-b border-white/5 text-white/70 transition-colors"
                  >
                    <td className="py-3 pl-6 font-bold text-white/40">
                      {i + 1}
                    </td>
                    <td className="py-3 font-bold text-sky-300">{entry.moves}</td>
                    <td className="py-3 text-amber-300">{formatTime(entry.time)}</td>
                    <td className="py-3 pr-6 text-white/40 text-xs">{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Clear button */}
        <div className="px-6 py-3 border-t border-white/5 flex justify-end">
          <button
            onClick={() => { saveLeaderboard([]); setEntries([]); }}
            className="text-xs text-red-400/60 hover:text-red-400 transition"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
