import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Maximize2, 
  Minimize2, 
  Activity, 
  Sparkles,
  MousePointer,
  Film,
  Gauge
} from 'lucide-react';

interface Hero3DCanvasProps {
  totalFrames?: number;
  framePathPrefix?: string;
  fps?: number;
  autoPlay?: boolean;
  className?: string;
  interactive?: boolean;
  showHUD?: boolean;
  onFrameChange?: (frame: number) => void;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({
  totalFrames = 240,
  framePathPrefix = '/frames/ezgif-frame-',
  fps = 30,
  autoPlay = true,
  className = '',
  interactive = true,
  showHUD = true,
  onFrameChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Cache of loaded images (HTMLImageElement or ImageBitmap)
  const imagesRef = useRef<(HTMLImageElement | ImageBitmap | null)[]>(new Array(totalFrames).fill(null));
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [mode, setMode] = useState<'loop' | 'interactive'>('loop');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [actualFps, setActualFps] = useState<number>(60);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Animation & Lerp physics refs
  const currentFrameFloatRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(autoPlay);
  const speedRef = useRef<number>(1);
  const modeRef = useRef<'loop' | 'interactive'>('loop');
  const lastTimeRef = useRef<number>(performance.now());
  const fpsCounterRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: performance.now() });
  
  // Dragging refs
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startFrameRef = useRef<number>(0);

  // Keep state refs in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Format frame number to 3 digits (001, 002, ..., 240)
  const getFrameUrl = useCallback((index: number) => {
    const padded = String(index + 1).padStart(3, '0');
    return `${framePathPrefix}${padded}.png`;
  }, [framePathPrefix]);

  // High-performance canvas draw
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (img) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Progressive background frame loader
  useEffect(() => {
    let isCancelled = false;
    let count = 0;

    // First load frame 0 for instant visual feedback
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    firstImg.onload = async () => {
      if (isCancelled) return;
      try {
        if ('createImageBitmap' in window) {
          const bitmap = await createImageBitmap(firstImg);
          imagesRef.current[0] = bitmap;
        } else {
          imagesRef.current[0] = firstImg;
        }
      } catch {
        imagesRef.current[0] = firstImg;
      }
      count++;
      setLoadedCount(count);
      drawFrame(0);

      // Concurrently batch preload remaining frames
      const batchSize = 16;
      let currentIndex = 1;

      const loadNextBatch = () => {
        if (isCancelled || currentIndex >= totalFrames) return;
        const currentBatch = [];
        const limit = Math.min(currentIndex + batchSize, totalFrames);

        for (let i = currentIndex; i < limit; i++) {
          const idx = i;
          const img = new Image();
          img.src = getFrameUrl(idx);
          const promise = new Promise<void>((resolve) => {
            img.onload = async () => {
              if (!isCancelled) {
                try {
                  if ('createImageBitmap' in window) {
                    const bitmap = await createImageBitmap(img);
                    imagesRef.current[idx] = bitmap;
                  } else {
                    imagesRef.current[idx] = img;
                  }
                } catch {
                  imagesRef.current[idx] = img;
                }
                count++;
                setLoadedCount(count);
                if (count >= 20) {
                  setIsLoading(false);
                }
              }
              resolve();
            };
            img.onerror = () => resolve();
          });
          currentBatch.push(promise);
        }

        currentIndex = limit;
        Promise.all(currentBatch).then(() => {
          if (!isCancelled && currentIndex < totalFrames) {
            loadNextBatch();
          } else if (count >= totalFrames) {
            setIsLoading(false);
          }
        });
      };

      loadNextBatch();
    };

    return () => {
      isCancelled = true;
    };
  }, [totalFrames, getFrameUrl, drawFrame]);

  // Main 60 FPS Render Loop with Smooth Physics Interpolation
  useEffect(() => {
    let animId: number;

    const renderLoop = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // FPS Calculation
      fpsCounterRef.current.count++;
      if (time - fpsCounterRef.current.lastTime >= 1000) {
        setActualFps(Math.round((fpsCounterRef.current.count * 1000) / (time - fpsCounterRef.current.lastTime)));
        fpsCounterRef.current.count = 0;
        fpsCounterRef.current.lastTime = time;
      }

      if (modeRef.current === 'loop' && isPlayingRef.current) {
        // Continuous smooth playback advancing by delta-time
        const frameAdvance = fps * speedRef.current * dt;
        currentFrameFloatRef.current = (currentFrameFloatRef.current + frameAdvance) % totalFrames;
        const nextInt = Math.floor(currentFrameFloatRef.current);
        
        drawFrame(nextInt);
        setCurrentFrame(nextInt);
        if (onFrameChange) onFrameChange(nextInt);
      } else if (modeRef.current === 'interactive') {
        // Smooth Lerp Damping towards targetFrame for silky momentum
        const diff = targetFrameRef.current - currentFrameFloatRef.current;
        if (Math.abs(diff) > 0.01) {
          currentFrameFloatRef.current += diff * 0.25;
          const nextInt = Math.floor((currentFrameFloatRef.current % totalFrames + totalFrames) % totalFrames);
          drawFrame(nextInt);
          setCurrentFrame(nextInt);
          if (onFrameChange) onFrameChange(nextInt);
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [fps, totalFrames, drawFrame, onFrameChange]);

  // Direct Frame Seek
  const seekToFrame = useCallback((frame: number) => {
    const clamped = Math.max(0, Math.min(totalFrames - 1, frame));
    targetFrameRef.current = clamped;
    currentFrameFloatRef.current = clamped;
    setCurrentFrame(clamped);
    drawFrame(clamped);
    if (onFrameChange) onFrameChange(clamped);
  }, [totalFrames, drawFrame, onFrameChange]);

  // Mouse / Touch handlers for fluid orbit scrubbing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startFrameRef.current = currentFrameFloatRef.current;
    if (mode === 'loop') {
      setIsPlaying(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (mode === 'interactive') {
      // Direct mouse tracking with lerp interpolation
      const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      targetFrameRef.current = Math.floor(progress * (totalFrames - 1));
    } else if (isDraggingRef.current) {
      // Drag scrubbing
      const deltaX = e.clientX - startXRef.current;
      const sensitivity = 0.45;
      let target = startFrameRef.current + deltaX * sensitivity;
      target = (target % totalFrames + totalFrames) % totalFrames;
      targetFrameRef.current = target;
      currentFrameFloatRef.current = target;
      const nextInt = Math.floor(target);
      setCurrentFrame(nextInt);
      drawFrame(nextInt);
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      if (mode === 'loop') {
        setIsPlaying(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const loadProgressPercent = Math.min(100, Math.round((loadedCount / totalFrames) * 100));

  return (
    <div 
      ref={containerRef}
      className={`relative group select-none overflow-hidden rounded-2xl sm:rounded-3xl border border-teal-500/30 bg-[#070c14] shadow-2xl transition-all duration-300 w-full max-w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseUp();
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          isDraggingRef.current = true;
          startXRef.current = e.touches[0].clientX;
          startFrameRef.current = currentFrameFloatRef.current;
        }
      }}
      onTouchMove={(e) => {
        if (isDraggingRef.current && e.touches.length > 0) {
          const deltaX = e.touches[0].clientX - startXRef.current;
          let target = startFrameRef.current + deltaX * 0.4;
          target = (target % totalFrames + totalFrames) % totalFrames;
          targetFrameRef.current = target;
          currentFrameFloatRef.current = target;
          const nextInt = Math.floor(target);
          setCurrentFrame(nextInt);
          drawFrame(nextInt);
        }
      }}
      onTouchEnd={() => {
        isDraggingRef.current = false;
      }}
    >
      {/* Dynamic Background Glow */}
      <div 
        className="absolute -inset-10 -z-10 rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(circle at ${((currentFrame / totalFrames) * 100).toFixed(0)}% 50%, rgba(45, 212, 191, 0.45), rgba(251, 113, 133, 0.35), transparent 75%)`
        }}
      />

      {/* Cyber Grid Corner Accents */}
      <div className="absolute top-3 left-3 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-teal-400/90 pointer-events-none z-20" />
      <div className="absolute top-3 right-3 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-teal-400/90 pointer-events-none z-20" />
      <div className="absolute bottom-3 left-3 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-teal-400/90 pointer-events-none z-20" />
      <div className="absolute bottom-3 right-3 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-teal-400/90 pointer-events-none z-20" />

      {/* High Performance 16:9 Canvas Stage */}
      <div className="relative w-full aspect-video flex items-center justify-center bg-gradient-to-b from-[#03060a] via-[#08101a] to-[#040810]">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
        />

        {/* Loading Overlay */}
        {isLoading && loadedCount < 18 && (
          <div className="absolute inset-0 bg-[#070c14]/95 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-4 z-30">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 absolute animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <div className="text-xs sm:text-sm font-mono font-bold tracking-wider text-teal-300 uppercase">
                DRON_AI 3D ENGINE
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Buffering frames {loadedCount} / {totalFrames} ({loadProgressPercent}%)
              </div>
            </div>
            <div className="w-40 sm:w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-rose-400 transition-all duration-150"
                style={{ width: `${loadProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* TOP HUD TELEMETRY BAR */}
      {showHUD && (
        <div className="absolute top-0 left-0 right-0 p-2.5 sm:p-4 flex items-center justify-between pointer-events-none z-20 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
          
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-black/80 border border-teal-500/30 text-teal-300 text-[10px] sm:text-xs font-mono font-semibold backdrop-blur-md shadow-lg shadow-teal-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="truncate">DRON_AI 3D CORE</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-mono">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>{actualFps} FPS</span>
            </span>
          </div>

          {/* Frame Counter & Telemetry */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-black/80 border border-teal-500/30 text-[10px] sm:text-[11px] font-mono text-teal-300 backdrop-blur-md">
              FRAME {String(currentFrame + 1).padStart(3, '0')}/{totalFrames}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-[11px] font-mono text-teal-300">
              <Sparkles className="w-3 h-3" />
              <span>240 HD FRAMES</span>
            </span>
          </div>
        </div>
      )}

      {/* BOTTOM FLOATING CONTROLS & TIMELINE SCRUBBER */}
      <div className={`absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 transition-all duration-300 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent ${isHovered || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-0'}`}>
        
        {/* Scrub Timeline Slider */}
        <div className="relative flex items-center mb-2 sm:mb-3 group/slider">
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            value={currentFrame}
            onChange={(e) => {
              seekToFrame(parseInt(e.target.value, 10));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:h-2 transition-all"
            style={{
              background: `linear-gradient(to right, #2dd4bf 0%, #fb7185 ${((currentFrame / (totalFrames - 1)) * 100).toFixed(1)}%, #1e293b ${((currentFrame / (totalFrames - 1)) * 100).toFixed(1)}%, #1e293b 100%)`
            }}
          />
        </div>

        {/* Control Buttons & Mode Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-xs">
          
          {/* Playback action group */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-r from-teal-400 via-teal-500 to-rose-400 text-black font-bold transition-all shadow-md shadow-teal-500/30 active:scale-95"
              title={isPlaying ? "Pause 3D Loop" : "Play 3D Loop"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />}
            </button>

            <button
              onClick={() => seekToFrame(0)}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/30 text-slate-300 transition-all active:scale-95"
              title="Reset Frame"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Speed toggle */}
            <div className="flex items-center bg-black/60 border border-teal-500/20 rounded-xl p-0.5">
              {[0.5, 1, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-semibold transition-all ${
                    playbackSpeed === spd 
                      ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Mode Selectors */}
          <div className="flex items-center gap-1 bg-black/60 border border-teal-500/20 p-0.5 sm:p-1 rounded-xl">
            <button
              onClick={() => {
                setMode('loop');
                setIsPlaying(true);
              }}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all ${
                mode === 'loop'
                  ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>3D Loop</span>
            </button>

            <button
              onClick={() => {
                setMode('interactive');
                setIsPlaying(false);
              }}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all ${
                mode === 'interactive'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MousePointer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Orbit (Move)</span>
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/30 text-slate-300 transition-all active:scale-95"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

        </div>

      </div>

    </div>
  );
};
