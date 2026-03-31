import React from 'react';
import Tile from './Tile';

/**
 * PuzzleBoard Component
 * Fully responsive block that aligns gracefully on any screen size.
 */
export default function PuzzleBoard({ state, onMove, imageTiles, isAnimating, isSolved, fullImageSrc, tileHue = 250 }) {
  return (
    <div
      className="
        relative p-2 md:p-3 rounded-[1.25rem] w-full max-w-[400px] md:max-w-[480px] aspect-square
        bg-black/20 backdrop-blur-md
        border border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        overflow-hidden mx-auto
      "
    >
      <div
        className="grid w-full h-full gap-1.5 md:gap-2"
        style={{
          gridTemplateColumns: `repeat(3, 1fr)`,
          gridTemplateRows:    `repeat(3, 1fr)`,
          opacity: isSolved && fullImageSrc ? 0 : 1, // Hide grid if solved & have full image
          transition: 'opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}
      >
        {state.map((value, index) => {
          // Dynamic vivid coloring for number tiles if no image (using base hue + some variation)
          const baseColor = `hsl(${(tileHue + value * 15) % 360}, 75%, 58%)`;
          
          return (
            <div
              key={index}
              className="w-full h-full transition-colors duration-300 relative rounded-xl"
              style={{
                background: value === 0
                  ? 'rgba(0,0,0,0.35)'
                  : imageTiles
                    ? 'rgba(255,255,255,0.03)'
                    : baseColor,
                boxShadow: value !== 0 
                  ? '0 4px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)' 
                  : 'inset 0 0 16px rgba(0,0,0,0.6)',
              }}
            >
              <Tile
                value={value}
                index={index}
                state={state}
                onMove={onMove}
                imageTiles={imageTiles}
                isAnimating={isAnimating}
                isSolved={isSolved}
              />
            </div>
          );
        })}
      </div>

      {/* Solved overlay - either Full Image or just text if playing "original numbers mode" */}
      {isSolved && (
        <div className="absolute inset-2 md:inset-3 rounded-[0.85rem] flex items-center justify-center
                        backdrop-blur-sm solved-overlay pointer-events-none overflow-hidden"
             style={{
               background: fullImageSrc ? 'transparent' : 'rgba(0,0,0,0.6)',
             }}
        >
          {fullImageSrc ? (
            <img 
              src={fullImageSrc} 
              alt="Solved" 
              className="w-full h-full object-cover rounded-[0.85rem] ring-2 ring-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]" 
            />
          ) : (
            <div className="text-center shadow-[0_0_40px_rgba(16,185,129,0.4)] bg-gray-900/90 px-8 py-5 rounded-2xl border border-emerald-500/50 backdrop-blur-md">
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-emerald-500 drop-shadow-lg">
                Solved!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
