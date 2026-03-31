import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import PuzzleBoard from './components/PuzzleBoard';
import ControlsPanel from './components/ControlsPanel';
import StatsPanel from './components/StatsPanel';
import Leaderboard, { saveLeaderboard, getLeaderboard } from './components/Leaderboard';
import {
  generateSolvableState,
  isValidMove,
  applyMove,
  isGoal,
  GOAL_STATE,
  solveAStar,
} from './utils/solver';
import { splitImageIntoTiles } from './utils/imageUtils';

const CANVAS_TILE_RES = 400; // Better definition for scaling on hi-res devices
const AUTO_SOLVE_DELAY_MS = 350;

const PRESETS = [
  { 
    id: 'original', 
    name: 'Numbers', 
    src: null, 
    info: 'Classic sliding puzzle with numbers',
    desc: 'The classic 8-puzzle challenge! Adjust the slider to pick your favorite tile color.',
    themeClass: 'bg-violet-600 text-white shadow-violet-900/50 hover:bg-violet-500'
  },
  { 
    id: 'kitty', 
    name: 'Kitty', 
    src: '/Kitty.jpeg', 
    info: 'A cute little kitty cat',
    desc: 'A charming painted kitty surrounded by floral elements. Perfect for a relaxing and colorful experience.',
    themeClass: 'bg-rose-500 text-white shadow-rose-900/50 hover:bg-rose-400'
  },
  { 
    id: 'bambi', 
    name: 'Bambi', 
    src: '/Bambi.jpeg', 
    info: 'Bambi the deer from the woods',
    desc: 'The classic gentle fawn in a serene forest setting. A nostalgic and beautifully drawn challenge.',
    themeClass: 'bg-amber-600 text-white shadow-amber-900/50 hover:bg-amber-500'
  },
  { 
    id: 'dumbo', 
    name: 'Dumbo', 
    src: '/Dumbo.jpeg', 
    info: 'Dumbo the flying elephant',
    desc: 'Our favorite flying elephant soaring through the sky! Bright blues make this puzzle a joy to solve.',
    themeClass: 'bg-sky-500 text-white shadow-sky-900/50 hover:bg-sky-400'
  },
];

export default function App() {
  const [initialState] = useState(() => generateSolvableState());
  const [currentState, setCurrentState] = useState(initialState);
  const [savedInitial, setSavedInitial] = useState(initialState);

  const [userMoves, setUserMoves] = useState(0);
  const [startTime]  = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const [activePreset, setActivePreset] = useState(PRESETS[1]);
  const [imageSrc, setImageSrc]     = useState(PRESETS[1].src);
  const [imageTiles, setImageTiles] = useState(null);
  
  const [tileHue, setTileHue] = useState(250);

  const [heuristic, setHeuristic]     = useState('manhattan');
  const [aiResult, setAiResult]       = useState(null);
  const [solutionPath, setSolutionPath] = useState(null);
  const [currentStep, setCurrentStep]  = useState(0);
  const [isAnimating, setIsAnimating]  = useState(false);
  const [isSolving, setIsSolving]      = useState(false);
  const animTimerRef = useRef(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // Guide Dialogs
  const [showMusicGuide, setShowMusicGuide] = useState(true);
  const [showAiGuide, setShowAiGuide] = useState(false);

  const isSolved = isGoal(currentState);

  const loadPreset = useCallback((preset) => {
    setActivePreset(preset);
    setImageSrc(preset.src);
    if (!preset.src) {
      setImageTiles(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const tiles = splitImageIntoTiles(img, CANVAS_TILE_RES);
      setImageTiles(tiles);
    };
    img.src = preset.src;
  }, []);

  useEffect(() => {
    loadPreset(PRESETS[1]);
  }, [loadPreset]);

  // Handle Audio Playback
  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.warn("Audio play failed:", e));
      }
    }
  }, [isMuted]);

  // AI Help Tooltip logic
  useEffect(() => {
    if (userMoves === 15 && !isSolved && !isSolving && !isAnimating) {
      setShowAiGuide(true);
    } else if (isSolved || isSolving) {
      setShowAiGuide(false);
    }
  }, [userMoves, isSolved, isSolving, isAnimating]);

  useEffect(() => {
    if (isSolved) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [isSolved, startTime]);

  useEffect(() => {
    if (isSolved && userMoves > 0) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      const entry = {
        moves: userMoves,
        time: elapsed,
        heuristic,
        date: new Date().toLocaleDateString(),
      };
      const updated = [...getLeaderboard(), entry]
        .sort((a, b) => a.moves - b.moves || a.time - b.time)
        .slice(0, 10);
      saveLeaderboard(updated);
    }
  }, [isSolved]);

  const handleMove = useCallback((index) => {
    if (isAnimating || isSolving || isSolved) return;
    if (!isValidMove(currentState, index)) return;
    setCurrentState(prev => applyMove(prev, index));
    setUserMoves(m => m + 1);
    setSolutionPath(null);
    setCurrentStep(0);
    setAiResult(null);
  }, [currentState, isAnimating, isSolving, isSolved]);

  const handleShuffle = useCallback(() => {
    clearAnimTimer();
    const s = generateSolvableState();
    setCurrentState(s);
    setSavedInitial(s);
    setUserMoves(0);
    setElapsed(0);
    setSolutionPath(null);
    setCurrentStep(0);
    setAiResult(null);
    setIsAnimating(false);
    setShowAiGuide(false);
  }, []);

  const handleReset = useCallback(() => {
    clearAnimTimer();
    setCurrentState(savedInitial);
    setUserMoves(0);
    setElapsed(0);
    setSolutionPath(null);
    setCurrentStep(0);
    setAiResult(null);
    setIsAnimating(false);
    setShowAiGuide(false);
  }, [savedInitial]);

  const handleSolve = useCallback(() => {
    if (isSolving || isAnimating || isSolved) return;
    setIsSolving(true);
    setShowAiGuide(false);
    setAiResult(null);
    setSolutionPath(null);
    setCurrentStep(0);

    setTimeout(() => {
      const result = solveAStar(currentState, heuristic);
      setIsSolving(false);
      if (!result) {
        alert('No solution found (this should not happen for a valid puzzle). Try shuffling.');
        return;
      }
      setAiResult(result);
      setSolutionPath(result.path);
      setCurrentStep(0);
      autoAnimate(result.path);
    }, 50);
  }, [currentState, heuristic, isSolving, isAnimating, isSolved]);

  function clearAnimTimer() {
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
  }

  function autoAnimate(path) {
    setIsAnimating(true);
    let step = 0;
    const next = () => {
      step++;
      if (step >= path.length) {
        setCurrentStep(path.length - 1);
        setCurrentState(path[path.length - 1]);
        setIsAnimating(false);
        return;
      }
      setCurrentStep(step);
      setCurrentState(path[step]);
      animTimerRef.current = setTimeout(next, AUTO_SOLVE_DELAY_MS);
    };
    animTimerRef.current = setTimeout(next, AUTO_SOLVE_DELAY_MS);
  }

  const handleStepForward = useCallback(() => {
    if (!solutionPath || isAnimating) return;
    const next = Math.min(currentStep + 1, solutionPath.length - 1);
    setCurrentStep(next);
    setCurrentState(solutionPath[next]);
  }, [solutionPath, currentStep, isAnimating]);

  const handleStepBackward = useCallback(() => {
    if (!solutionPath || isAnimating) return;
    const prev = Math.max(currentStep - 1, 0);
    setCurrentStep(prev);
    setCurrentState(solutionPath[prev]);
  }, [solutionPath, currentStep, isAnimating]);

  const handleUpload = useCallback((file) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const tiles = splitImageIntoTiles(img, CANVAS_TILE_RES);
      setActivePreset({ 
        id: 'custom', 
        name: 'Custom', 
        src: url, 
        info: 'Your custom image',
        desc: 'A unique puzzle featuring your own custom uploaded image!',
        themeClass: 'bg-violet-600'
      });
      setImageSrc(url);
      setImageTiles(tiles);
    };
    img.src = url;
  }, []);

  const handleMusicToggle = () => {
    setIsMuted(m => !m);
    setShowMusicGuide(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <audio 
        ref={audioRef} 
        loop 
        src="/music.mp3" 
      />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-700/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-sky-700/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-pink-700/10 blur-[80px]" />
      </div>

      <header className="relative z-[90] flex items-center justify-between px-4 py-4 md:px-6 border-b border-white/8 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base md:text-lg font-black tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent leading-none">
              8-Puzzle AI Solver
            </h1>
            <p className="text-[10px] md:text-[11px] text-white/40 mt-1">A* Search · Manhattan · Hamming</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 z-[100]">
          {/* Mute/Play Button with Tooltip */}
          <div className="relative">
            <button
              onClick={handleMusicToggle}
              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:py-2 rounded-xl border text-[10px] md:text-xs font-bold transition-all duration-300
                ${!isMuted 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white/90'}`}
              title={isMuted ? "Unmute BGM" : "Mute BGM"}
            >
              <span className="text-sm">{isMuted ? '🔇' : '🎵'}</span>
              <span className="hidden sm:inline tracking-wide">{isMuted ? "Music Off" : "Music On"}</span>
            </button>
            
            {showMusicGuide && (
              <div className="absolute top-full right-0 mt-3 w-56 p-3 rounded-xl bg-violet-900/95 border border-violet-400/50 shadow-[0_10px_40px_rgba(139,92,246,0.6)] animate-float z-[110]">
                <button 
                  onClick={() => setShowMusicGuide(false)}
                  className="absolute top-1 right-2 px-1 text-violet-300 hover:text-white text-lg leading-none"
                >×</button>
                <p className="text-[11px] text-white/90 leading-relaxed pr-3 font-medium tracking-wide">
                  👋 Welcome! Turn on the music for a more relaxing puzzle experience!
                </p>
                <div className="absolute -top-1.5 right-6 w-3 h-3 bg-violet-900 border-t border-l border-violet-400/50 transform rotate-45"></div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-2 px-3 py-1.5 md:py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] md:text-xs font-bold hover:bg-amber-500/20 transition-all duration-200"
          >
            Leaderboard
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center xl:flex-row xl:items-start justify-center gap-8 p-4 md:p-6 w-full max-w-7xl mx-auto overflow-x-hidden">
        
        {/* Left: Controls */}
        <div className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-4">
          <ControlsPanel
            onUpload={handleUpload}
            onShuffle={handleShuffle}
            onReset={handleReset}
            onSolve={handleSolve}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            isSolving={isSolving}
            isAnimating={isAnimating}
            isSolved={isSolved}
            solutionPath={solutionPath}
            currentStep={currentStep}
            heuristic={heuristic}
            onHeuristicChange={setHeuristic}
            imageSrc={imageSrc}
            presets={PRESETS}
            activePreset={activePreset}
            onSelectPreset={loadPreset}
            tileHue={tileHue}
            onHueChange={setTileHue}
            showAiGuide={showAiGuide}
            onCloseAiGuide={() => setShowAiGuide(false)}
          />
        </div>

        {/* Center: Board */}
        <div className="w-full flex-1 flex flex-col items-center gap-4 xl:max-w-xl">
          <PuzzleBoard
            state={currentState}
            onMove={handleMove}
            imageTiles={imageTiles}
            isAnimating={isAnimating}
            isSolved={isSolved}
            fullImageSrc={imageSrc}
            tileHue={tileHue}
          />

          <div className="w-full max-w-md flex items-center justify-between px-4 md:px-6 py-3 rounded-2xl bg-white/5 border border-white/10 mt-2">
            <div className="text-center flex-1">
              <p className="text-xl md:text-2xl font-black text-sky-400">{userMoves}</p>
              <p className="text-[9px] md:text-[10px] text-white/50 uppercase tracking-widest mt-1">Your Moves</p>
            </div>
            <div className="w-px h-8 bg-white/10 opacity-50" />
            <div className="text-center flex-1">
              <p className="text-xl md:text-2xl font-black text-violet-400">
                {aiResult ? aiResult.path.length - 1 : '-'}
              </p>
              <p className="text-[9px] md:text-[10px] text-white/50 uppercase tracking-widest mt-1">Optimal</p>
            </div>
            <div className="w-px h-8 bg-white/10 opacity-50" />
            <div className="text-center flex-1">
              <p className={`text-xl md:text-2xl font-black ${isSolved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isSolved ? 'Done' : isAnimating ? 'Play' : 'Wait'}
              </p>
              <p className="text-[9px] md:text-[10px] text-white/50 uppercase tracking-widest mt-1">Status</p>
            </div>
          </div>

          {solutionPath && solutionPath.length > 1 && (
            <div className="w-full max-w-md space-y-2 mt-2">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / (solutionPath.length - 1)) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-white/40 text-center uppercase tracking-widest font-mono">
                SOLUTION: {Math.round((currentStep / (solutionPath.length - 1)) * 100)}%
              </p>
            </div>
          )}
        </div>

        {/* Right: Stats */}
        <div className="w-full xl:w-72 flex-shrink-0">
          <StatsPanel
            userMoves={userMoves}
            elapsedTime={elapsed}
            aiResult={aiResult}
            heuristic={heuristic}
            isSolved={isSolved}
          />
        </div>
      </main>

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}
