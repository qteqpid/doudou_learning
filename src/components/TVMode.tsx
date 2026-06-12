import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, useSpring } from 'motion/react';
import { Power, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import GamesHub from './GamesHub';
import { useSettings } from '../SettingsContext';

function MiniBrowser({ zoom }: { zoom: number }) {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) { setUrl(''); return; }
    let finalUrl = inputUrl;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    setUrl(finalUrl);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden pointer-events-auto text-black">
      <form onSubmit={handleSubmit} className="flex bg-gray-200 p-2 border-b border-gray-300 gap-2">
        <input 
          type="text" 
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="flex-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm outline-none font-sans"
          placeholder="Enter URL (Warning: Many sites block iframes)"
        />
        <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded text-sm font-sans hover:bg-blue-700">Go</button>
      </form>
      <div className="flex-1 relative overflow-hidden bg-white w-full">
        {url ? (
          <iframe 
            src={`/api/proxy/general?url=${encodeURIComponent(url)}`} 
            className="absolute top-0 left-0 border-0 bg-white" 
            style={{ width: `${100 / zoom}%`, height: `${100 / zoom}%`, transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-presentation" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-mono">No URL entered - No traces left</div>
        )}
      </div>
    </div>
  );
}

interface TVModeProps {
  onExit: (emergency?: boolean) => void;
  mountCount: number;
  triggerPos?: { x: number, y: number };
}

export default function TVMode({ onExit, mountCount, triggerPos }: TVModeProps) {
  const { settings, updateSettings } = useSettings();
  const [isOn, setIsOn] = useState(true);
  const [channel, setChannel] = useState(7);
  const [volume, setVolume] = useState(50);
  const [browserZoom, setBrowserZoom] = useState(0.8); // Slightly zoomed out for better fit
  
  const screenRef = useRef<HTMLDivElement>(null);

  // Focus screen on mount to capture keyboard events immediately
  useEffect(() => {
    if (isOn && screenRef.current) {
      screenRef.current.focus();
    }
  }, [isOn, channel]);

  // Interaction & Opacity states
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const xBase = useMotionValue(0);
  const yBase = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200, mass: 1 };
  const x = useSpring(xBase, springConfig);
  const y = useSpring(yBase, springConfig);
  const tvScale = useMotionValue(1);

  const handleDragEnd = () => {
    setIsDragging(false);
    if (settings.rememberTvPosition) {
       updateSettings({
          tvX: xBase.get(),
          tvY: yBase.get()
       });
    }
  };

  const initialPinchDistance = useRef<number | null>(null);
  const initialTvScale = useRef<number>(1);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
      initialTvScale.current = tvScale.get();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const zoomFactor = distance / initialPinchDistance.current;
      
      let newScale = initialTvScale.current * zoomFactor;
      newScale = Math.min(Math.max(newScale, 0.4), 2.5);
      tvScale.set(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialPinchDistance.current = null;
    }
  };

  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdle = () => {
     setIsIdle(false);
     if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
     idleTimeoutRef.current = setTimeout(() => setIsIdle(true), 5000);
  };

  const initialPosSet = useRef(false);
  useEffect(() => {
    if (initialPosSet.current) return;
    
    // Load initial position or center on triggerPos
    if (triggerPos && triggerPos.x !== 0) {
       // Offset by half dimensions of the TV (800x600 approximately)
       xBase.set(triggerPos.x - window.innerWidth / 2);
       yBase.set(triggerPos.y - window.innerHeight / 2);
       initialPosSet.current = true;
    } else if (settings.rememberTvPosition) {
       xBase.set(settings.tvX);
       yBase.set(settings.tvY);
       initialPosSet.current = true;
    }
  }, [triggerPos?.x, triggerPos?.y, xBase, yBase, settings.rememberTvPosition, settings.tvX, settings.tvY]);

  useEffect(() => {
    resetIdle();
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('mousedown', resetIdle);
    window.addEventListener('keydown', resetIdle);

    const handleScroll = () => {
       setIsScrolling(true);
       resetIdle();
       setTimeout(() => setIsScrolling(false), 500); // Wait for scroll stop
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
       window.removeEventListener('mousemove', resetIdle);
       window.removeEventListener('mousedown', resetIdle);
       window.removeEventListener('keydown', resetIdle);
       window.removeEventListener('scroll', handleScroll);
       if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [onExit]);

  // Turn on animation effect smoothly after entry
  useEffect(() => {
    // Already ON by default now, but can keep this for re-triggering if needed
    // or just remove the delay to make it instant as requested
    setIsOn(true);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === '`' || e.key === 'Esc') {
           e.preventDefault();
           onExit(true); 
           return;
        }

        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'IFRAME') {
           return;
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
           onExit();
        } else if (e.key === '[' || e.key === '【') {
           tvScale.set(Math.min(Math.round((tvScale.get() + 0.1)*10)/10, 2.5));
        } else if (e.key === ']' || e.key === '】') {
           tvScale.set(Math.max(Math.round((tvScale.get() - 0.1)*10)/10, 0.4));
        } else if (e.key === '=' || e.key === '+') {
           setBrowserZoom(z => Math.min(Math.round((z + 0.1)*10)/10, 3));
        } else if (e.key === '-') {
           setBrowserZoom(z => Math.max(Math.round((z - 0.1)*10)/10, 0.3));
        } else if (e.key.toLowerCase() === 'm') {
           setVolume(v => v > 0 ? 0 : 50);
        } else if (e.key.toLowerCase() === 'b') {
           setIsOn(false); 
        }
     };
     window.addEventListener('keydown', handleKeyDown);
     
     const handleMessage = (e: MessageEvent) => {
        if (e.data && e.data.type === 'iframeKeyDown') {
           const fakeEvent = new KeyboardEvent('keydown', { key: e.data.key, code: e.data.code, bubbles: true });
           handleKeyDown(fakeEvent as any);
        }
     };
     window.addEventListener('message', handleMessage);
     
     return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('message', handleMessage);
     };
  }, [onExit]);

  // Dynamically calculate opacity and scale
  const frequencyPenalty = Math.min(0.6, mountCount * 0.1); 
  const baseOpacity = settings.tvOpacity - frequencyPenalty;
  const idleOpacity = settings.tvIdleOpacity - frequencyPenalty;
  
  let currentOpacity = baseOpacity;
  if (!isHovered) currentOpacity = idleOpacity; 
  if (isDragging) currentOpacity = Math.max(0.1, currentOpacity - 0.2); 
  if (isIdle) currentOpacity = Math.max(0.05, currentOpacity - 0.3); 
  if (isScrolling) currentOpacity = Math.max(0.1, currentOpacity - 0.3); 

  // Ensure minimum visibility unless completely idle
  currentOpacity = Math.max(0.05, Math.min(1, currentOpacity));
  if (isHovered && !isDragging) currentOpacity = Math.max(Math.max(0.1, settings.tvOpacity - frequencyPenalty), currentOpacity);

  // Triple Click Border Logic
  const handleBorderClick = (e: React.MouseEvent) => {
     e.stopPropagation(); // Stop propagation to study mode
     // Detail 5 for extra safety against accidental exits
     if (e.detail === 5) {
        onExit();
     }
  };

  // Use transform to scale down near edges without triggering React renders
  const scale = 1;

  const channels = [
    { name: 'CH 01: STATIC', type: 'static' },
    { name: 'CH 02: CHINESE MOOC', type: 'study' },
    { name: 'CH 03: WIKIPEDIA', type: 'study' },
    { name: 'CH 04: MDN WEB DOCS', type: 'study' },
    { name: 'CH 05: GITHUB', type: 'study' },
    { name: 'CH 06: STACK OVERFLOW', type: 'study' },
    { name: 'CH 07: BILIBILI', type: 'bilibili' },
    { name: 'CH 08: BROWSER', type: 'browser' },
    { name: 'CH 09: GAME', type: 'game' },
  ];

  const borderStyles: Record<string, { outer: string, inner: string, controls: string }> = {
    classic: {
      outer: "bg-[#222222] border-zinc-700/50",
      inner: "border-[#333]",
      controls: "bg-[#282828] border-[#3a3a3a]"
    },
    wood: {
      outer: "bg-[#5c4033] border-[#3e2723]",
      inner: "border-[#2c1b12]",
      controls: "bg-[#4a3225] border-[#3e2723]"
    },
    modern: {
      outer: "bg-[#e0e0e0] border-[#bdbdbd]",
      inner: "border-[#9e9e9e]",
      controls: "bg-[#eeeeee] border-[#cccccc]"
    },
    neon: {
      outer: "bg-[#111111] border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]",
      inner: "border-cyan-400",
      controls: "bg-[#1a1a1a] border-cyan-400"
    }
  };
  const tvStyle = borderStyles[settings.tvBorder] || borderStyles.classic;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
    >
      <motion.div
         initial={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
         animate={{ scale: 1, opacity: currentOpacity, filter: 'blur(0px)' }}
         exit={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
         transition={{ duration: 1, ease: 'easeOut', opacity: { duration: isDragging ? 0.2 : 1 } }}
         className="pointer-events-auto"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
         onTouchCancel={handleTouchEnd}
      >
        <motion.div 
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ x, y, scale, cursor: isDragging ? 'move' : 'default' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleBorderClick}
          className={`tv-mode-container relative w-[800px] aspect-[4/3] rounded-[30px] p-4 border touch-none shadow-2xl transition-colors duration-500 ${tvStyle.outer}`}
        >
          {/* The Screen Container */}
        <div 
          ref={screenRef}
          tabIndex={0}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full h-full bg-black rounded-[20px] overflow-hidden shadow-inner border-[6px] transition-colors duration-500 outline-none ${tvStyle.inner}`}
        >
          {/* Actual Screen Content */}
          <div className={`w-full h-full overflow-hidden flex flex-col items-center justify-center ${isOn ? 'bg-black' : 'bg-zinc-900'}`}>
            <AnimatePresence mode="wait">
              {isOn ? (
                <motion.div 
                  key={channel}
                  initial={{ opacity: 0, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(2px)' }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="w-full h-full flex flex-col items-center justify-center relative bg-black"
                >
                  {channel === 1 && (
                     <div className="space-y-4">
                        <div className="w-24 h-24 border-4 border-zinc-800 rounded-full flex items-center justify-center animate-spin">
                          <div className="w-16 h-1 w-full bg-zinc-800" />
                        </div>
                        <p className="font-mono text-zinc-600 text-sm animate-pulse">NO SIGNAL DETECTED</p>
                     </div>
                  )}

                  {channel >= 2 && channel <= 6 && (
                    <div className="w-full h-full relative z-10 bg-white pointer-events-auto">
                        <iframe 
                          src={`/api/proxy/general?url=${encodeURIComponent(['https://www.icourse163.org/', 'https://zh.wikipedia.org/', 'https://developer.mozilla.org/zh-CN/', 'https://github.com/', 'https://stackoverflow.com/'][channel - 2])}`} 
                          className="absolute top-0 left-0 border-0 bg-white"
                          style={{ width: `${100 / browserZoom}%`, height: `${100 / browserZoom}%`, transform: `scale(${browserZoom})`, transformOrigin: 'top left' }}
                          sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
                        />
                    </div>
                  )}

                  {channel === 7 && (
                    <div className="w-full h-full relative z-10 bg-white pointer-events-auto">
                        <iframe 
                          src="https://www.bilibili.com"
                          className="absolute border-0 bg-white"
                          width="100%"
                          height="100%"
                          referrerPolicy="no-referrer"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          sandbox="allow-top-navigation-by-user-activation allow-same-origin allow-scripts allow-forms allow-presentation"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/50 p-1 rounded text-[8px] opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                            BILIBILI CH 07 - HOME
                        </div>
                    </div>
                  )}

                  {channel === 8 && (
                     <div className="w-full h-full relative z-10">
                        <MiniBrowser zoom={browserZoom} />
                     </div>
                  )}

                  {channel === 9 && (
                     <div className="w-full h-full relative z-10">
                        <GamesHub />
                     </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="off-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 relative overflow-hidden"
                >
                   <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full border-2 border-zinc-700 flex items-center justify-center">
                         <Power className="w-8 h-8 text-zinc-700" />
                      </div>
                      <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">Standby</p>
                   </div>
                   {/* Scanning line effect */}
                   <div className="absolute inset-x-0 h-[100px] bg-white/5 top-[-100px] animate-[scan_4s_linear_infinite]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Low Saturation Original Controls Side Strip */}
        <div 
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-1/2 -right-[48px] -translate-y-1/2 flex flex-col gap-3 p-2 rounded-r-2xl border-y border-r shadow-md pointer-events-auto transition-colors duration-500 ${tvStyle.controls}`}
        >
            <button 
                onClick={() => setIsOn(!isOn)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOn ? 'bg-[#353535] text-[#888]' : 'bg-[#222] text-[#555]'}`}
                title="Power"
            >
                <Power className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setChannel(prev => prev === 1 ? channels.length : prev - 1)}
              className="w-10 h-10 rounded-xl bg-[#2d2d2d] text-[#666] hover:bg-[#353535] active:bg-[#222] flex items-center justify-center transition-colors"
                title="Prev Channel"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setChannel(prev => prev === channels.length ? 1 : prev + 1)}
              className="w-10 h-10 rounded-xl bg-[#2d2d2d] text-[#666] hover:bg-[#353535] active:bg-[#222] flex items-center justify-center transition-colors"
                title="Next Channel"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
            <div className="h-[1px] w-full bg-[#3a3a3a] my-1" />
            <button 
              onClick={() => setBrowserZoom(z => Math.min(Math.round((z + 0.1)*10)/10, 3))}
              className="w-10 h-10 rounded-xl bg-[#2d2d2d] text-[#666] hover:bg-[#353535] active:bg-[#222] flex items-center justify-center transition-colors"
                title="Zoom In"
            >
                <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setBrowserZoom(z => Math.max(Math.round((z - 0.1)*10)/10, 0.3))}
              className="w-10 h-10 rounded-xl bg-[#2d2d2d] text-[#666] hover:bg-[#353535] active:bg-[#222] flex items-center justify-center transition-colors"
                title="Zoom Out"
            >
                <Minus className="w-5 h-5" />
            </button>
            <div className="h-[1px] w-full bg-[#3a3a3a] my-1" />
            <button 
                onClick={() => onExit()}
                className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-500 hover:bg-orange-600 hover:text-white flex items-center justify-center transition-all font-black text-[10px]"
                title="Exit TV Mode"
            >
                ESC
            </button>
        </div>
      </motion.div>
      </motion.div>
    </div>
  );
}
