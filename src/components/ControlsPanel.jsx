import React, { useRef, useState } from 'react';

export default function ControlsPanel({
  onUpload, onShuffle, onReset, onSolve,
  onStepForward, onStepBackward,
  isSolving, isAnimating, isSolved,
  solutionPath, currentStep,
  heuristic, onHeuristicChange,
  imageSrc, presets, activePreset, onSelectPreset,
  tileHue, onHueChange, showAiGuide, onCloseAiGuide
}) {
  const fileRef = useRef(null);
  const [showImageDetails, setShowImageDetails] = useState(true);

  const totalSteps = solutionPath ? solutionPath.length - 1 : 0;
  const atEnd   = solutionPath && currentStep >= totalSteps;
  const atStart = currentStep === 0;

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── Setup ── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3 shadow-md shadow-black/20">
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2 border-b border-white/5 pb-2">Theme Selection</h3>

        <div className="flex flex-col gap-2.5">
          {/* Presets Grid */}
          <div className="grid grid-cols-2 gap-2 mb-1">
            {presets && presets.map(p => {
              const isActive = activePreset?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectPreset(p);
                    // Open the image details automatically if they switch to a character
                    if (p.id !== 'original') setShowImageDetails(true);
                  }}
                  title={p.info}
                  className={`py-2 px-1 text-[10px] md:text-[11px] uppercase font-bold tracking-wider rounded-lg transition-all duration-300 overflow-hidden text-ellipsis whitespace-nowrap border
                    ${isActive 
                      ? `${p.themeClass} border-transparent scale-[1.02]` 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'}`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              if (e.target.files[0]) {
                onUpload(e.target.files[0]);
                setShowImageDetails(true);
              }
            }}
          />
          <button
            onClick={() => fileRef.current.click()}
            className="w-full py-2.5 px-4 rounded-xl border border-violet-500/50
                       bg-violet-500/10 text-violet-300 text-xs md:text-sm font-semibold tracking-wide
                       hover:bg-violet-500/20 hover:border-violet-400 transition-all duration-200 shadow-inner shadow-violet-500/10"
          >
            {imageSrc && activePreset?.id === 'custom' ? 'Change Custom Image' : 'Upload Custom Image'}
          </button>

          {/* Color Slider (Shows only for original numbers) */}
          {activePreset?.id === 'original' && (
            <div className="mt-1 p-3 bg-black/30 rounded-xl border border-white/10 shadow-inner">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold pb-1">Tile Main Hue</span>
                <span className="text-[10px] text-white/90 font-mono w-8 text-right bg-white/10 px-1 py-0.5 rounded">{tileHue}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={tileHue}
                onChange={(e) => onHueChange(Number(e.target.value))}
                className="w-full mt-1 hue-slider"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 75%, 58%), hsl(60, 75%, 58%), 
                    hsl(120, 75%, 58%), hsl(180, 75%, 58%), 
                    hsl(240, 75%, 58%), hsl(300, 75%, 58%), hsl(360, 75%, 58%))`
                }}
              />
            </div>
          )}

          {/* Reference Image Details (Collapsible) */}
          {imageSrc && activePreset?.id !== 'original' && (
            <div className="mt-1">
              <button 
                onClick={() => setShowImageDetails(!showImageDetails)}
                className="w-full py-2 flex items-center justify-between px-4 text-[10px] md:text-xs font-bold text-white/60 bg-black/20 hover:bg-black/40 rounded-xl transition-colors border border-white/5 uppercase tracking-widest"
              >
                <span>{showImageDetails ? 'Hide' : 'View'} Target Image</span>
                <span className={`transform transition-transform duration-300 ${showImageDetails ? 'rotate-180 text-violet-400' : ''}`}>
                  ▼
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden
                  ${showImageDetails ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
              >
                <div className="bg-black/20 rounded-xl border border-white/5 flex flex-col items-center justify-center p-3 relative group">
                  <div 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden ring-2 ring-violet-500/50 shadow-[0_4px_30px_rgba(139,92,246,0.4)] bg-black/60 z-10
                               group-hover:scale-[1.03] group-hover:ring-violet-400/80 transition-all duration-500"
                    title="Target Solution"
                  >
                    <img src={imageSrc} alt="preview" className="w-full h-full object-cover" />
                  </div>

                  {/* Character Details */}
                  {activePreset?.desc && (
                    <div className="mt-3 text-center z-10 px-1">
                      <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                        {activePreset.desc}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Heuristic toggle */}
        <div className="pt-2">
          <p className="text-[10px] md:text-xs text-white/40 mb-2 font-bold uppercase tracking-widest border-t border-white/5 pt-3">Heuristic</p>
          <div className="flex rounded-xl overflow-hidden border border-white/10 p-0.5 bg-black/30">
            {['manhattan', 'hamming'].map(h => (
              <button
                key={h}
                onClick={() => onHeuristicChange(h)}
                className={`flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-bold capitalize transition-all duration-300 rounded-lg
                  ${heuristic === h
                    ? 'bg-sky-600/90 text-white shadow-md'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
              >
                {h}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-white/30 mt-1.5 leading-relaxed text-center font-medium">
            {heuristic === 'manhattan'
              ? 'Manhattan: Fast & precise absolute distance.'
              : 'Hamming: Explores wider via misplaced tiles.'}
          </p>
        </div>
      </div>

      {/* ── Game Controls ── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2.5 shadow-md shadow-black/20">
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2 border-b border-white/5 pb-2">Game Controls</h3>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={onShuffle}
            disabled={isAnimating}
            className="py-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30
                       text-sky-300 text-xs md:text-sm font-bold shadow-inner shadow-sky-400/10
                       hover:bg-sky-500/25 hover:border-sky-400 transition-all duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            Shuffle
          </button>

          <button
            onClick={onReset}
            disabled={isAnimating}
            className="py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30
                       text-amber-300 text-xs md:text-sm font-bold shadow-inner shadow-amber-400/10
                       hover:bg-amber-500/25 hover:border-amber-400 transition-all duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            Reset
          </button>
        </div>

        {/* Solve button */}
        <div className="relative mt-2">
          {/* AI Helper Tooltip */}
          {showAiGuide && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[240px] p-3.5 rounded-2xl bg-pink-900/95 border border-pink-400/50 shadow-[0_10px_40px_rgba(219,39,119,0.7)] animate-float z-50">
              <button 
                onClick={onCloseAiGuide}
                className="absolute top-1.5 right-2.5 px-1 text-pink-300 hover:text-white text-lg leading-none"
              >×</button>
              <p className="text-[11px] text-white/90 leading-relaxed pr-3 font-semibold tracking-wide text-center">
                Struggling? Use the AI algorithm to magically find the optimal solution path for you!
              </p>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-pink-900 border-b border-r border-pink-400/50 transform rotate-45"></div>
            </div>
          )}

          <button
            onClick={onSolve}
            disabled={isSolved || isAnimating || isSolving}
            className={`w-full py-3.5 rounded-xl text-white text-sm md:text-base font-black tracking-widest uppercase
                       transition-transform duration-200 flex items-center justify-center gap-2
                       disabled:opacity-40 disabled:cursor-not-allowed
                       ${!isSolved && !isAnimating && !isSolving
                         ? 'btn-shimmer border-none shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:scale-[1.02] active:scale-[0.98]'
                         : 'bg-violet-700/40 border border-violet-500/30 shadow-none scale-100'
                       }`}
          >
            {isSolving ? (
              <><span className="animate-spin text-xl leading-none px-1">◌</span> COMPUTING…</>
            ) : (
              <><span>🧠</span> SOLVE WITH A*</>
            )}
          </button>
        </div>

        {/* Step navigation */}
        {solutionPath && solutionPath.length > 1 && (
          <div className="space-y-3 pt-3 border-t border-white/5 mt-3">
            <p className="text-[10px] md:text-[11px] text-white/50 text-center font-mono font-bold tracking-widest">
              STEP {currentStep} / {totalSteps}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onStepBackward}
                disabled={atStart || isAnimating}
                className="flex-1 py-1.5 rounded-lg bg-black/40 border border-white/10
                           text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-wider
                           hover:bg-white/10 hover:border-white/20 transition-all duration-200
                           disabled:opacity-30 disabled:cursor-not-allowed shadow-inner shadow-white/5"
              >
                Prev
              </button>
              <button
                onClick={onStepForward}
                disabled={atEnd || isAnimating}
                className="flex-1 py-1.5 rounded-lg bg-black/40 border border-white/10
                           text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-wider
                           hover:bg-white/10 hover:border-white/20 transition-all duration-200
                           disabled:opacity-30 disabled:cursor-not-allowed shadow-inner shadow-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
