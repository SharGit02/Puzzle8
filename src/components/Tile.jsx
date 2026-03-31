import React, { useRef } from 'react';
import { isValidMove } from '../utils/solver';

/**
 * Tile Component
 */
export default function Tile({ value, index, state, onMove, imageTiles, isAnimating, isSolved }) {
  const prevValue = useRef(value);
  const changed = prevValue.current !== value;
  prevValue.current = value;

  if (value === 0) {
    return (
      <div
        className="w-full h-full rounded-xl"
        style={{ background: 'transparent' }}
      />
    );
  }

  const canMove = !isAnimating && isValidMove(state, index);
  const tileOriginIndex = value - 1;

  const baseStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    cursor: canMove ? 'pointer' : 'default',
    userSelect: 'none',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease',
    position: 'relative',
    overflow: 'hidden',
  };

  if (imageTiles && imageTiles[tileOriginIndex]) {
    Object.assign(baseStyle, {
      backgroundImage: `url(${imageTiles[tileOriginIndex]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    });
  }

  return (
    <div
      className={`
        flex items-center justify-center select-none
        ${changed ? 'tile-enter' : ''}
        ${isSolved ? 'win-glow' : ''}
      `}
      style={baseStyle}
      onClick={() => canMove && !isAnimating && onMove(index)}
      onMouseEnter={e => {
        if (canMove) {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.6)';
          e.currentTarget.style.filter = 'brightness(1.1)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.filter = '';
      }}
    >
      {/* Number overlay for original numbers mode */}
      {!imageTiles && (
        <span className="text-3xl md:text-5xl font-black text-white/95 drop-shadow-md">
          {value}
        </span>
      )}
      
      {/* Small number badge when using image */}
      {imageTiles && (
        <span
          className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 
                     text-[10px] md:text-xs font-bold text-white/90
                     bg-black/50 backdrop-blur-md rounded px-1.5 py-0.5 leading-none shadow-sm"
        >
          {value}
        </span>
      )}
      
      {/* Move indicator ring */}
      {canMove && !imageTiles && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-violet-400/50 ring-inset pointer-events-none" />
      )}
    </div>
  );
}
