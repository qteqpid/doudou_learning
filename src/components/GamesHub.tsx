import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- GAME 1: Snake ---
function SnakeGame() {
  const [snake, setSnake] = useState([{x: 10, y: 10}]);
  const [food, setFood] = useState({x: 15, y: 15});
  const [dir, setDir] = useState({x: 1, y: 0});
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const dirRef = useRef(dir);

  useEffect(() => {
    dirRef.current = dir;
  }, [dir]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
         e.preventDefault();
      }
      const currentDir = dirRef.current;
      switch (e.key) {
        case 'ArrowUp': if (currentDir.y === 0) setDir({x: 0, y: -1}); break;
        case 'ArrowDown': if (currentDir.y === 0) setDir({x: 0, y: 1}); break;
        case 'ArrowLeft': if (currentDir.x === 0) setDir({x: -1, y: 0}); break;
        case 'ArrowRight': if (currentDir.x === 0) setDir({x: 1, y: 0}); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    
    const moveSnake = () => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
          setGameOver(true);
          return prev;
        }
        if (prev.some(seg => seg.x === head.x && seg.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [dir, food, gameOver]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a1a0f] text-emerald-500 font-mono pointer-events-auto p-4">
      <div className="mb-4 text-xl flex justify-between w-full max-w-[400px]">
        <span className="bg-emerald-950 px-2 rounded">SNAKE</span>
        <span className="bg-emerald-950 px-2 rounded">SCORE: {score}</span>
      </div>
      <div className="relative aspect-square w-full max-w-[400px] border-4 border-emerald-800 bg-[#050a08] rounded shadow-[0_0_20px_rgba(16,185,129,0.1)] focus:outline-none overflow-hidden" tabIndex={0}>
        {/* Grid dots background */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 opacity-10">
           {Array.from({length: 400}).map((_, i) => <div key={i} className="border-[0.5px] border-emerald-500/20" />)}
        </div>
        {snake.map((seg, i) => (
          <div
            key={`${seg.x}-${seg.y}-${i}`} 
            className="absolute bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] z-10" 
            style={{
              left: `${seg.x * 5}%`,
              top: `${seg.y * 5}%`,
              width: '5%',
              height: '5%',
              borderRadius: i === 0 ? '4px' : '1px'
            }} 
          />
        ))}
        <div className="absolute bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]" style={{
          left: `${food.x * 5}%`,
          top: `${food.y * 5}%`,
          width: '5%',
          height: '5%'
        }} />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            <p className="text-4xl text-rose-500 mb-6 font-bold tracking-widest shadow-rose-500/50 drop-shadow-lg">GAME OVER</p>
            <button 
              className="px-6 py-3 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-colors font-bold tracking-widest"
              onClick={() => {
                setSnake([{x: 10, y: 10}]);
                setDir({x: 1, y: 0});
                setGameOver(false);
                setScore(0);
                setFood({x: 15, y: 15});
              }}
            >
              RESTART
            </button>
          </div>
        )}
      </div>
      <p className="mt-6 text-emerald-700/80 text-sm tracking-widest animate-pulse border border-emerald-800 px-4 py-2 rounded">USE ARROW KEYS</p>
    </div>
  );
}

// --- GAME 2: Tic Tac Toe ---
function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const checkWinner = (squares: string[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let line of lines) {
      if (squares[line[0]] && squares[line[0]] === squares[line[1]] && squares[line[0]] === squares[line[2]]) {
        return squares[line[0]];
      }
    }
    if (!squares.includes(null)) return 'Draw';
    return null;
  };

  const winner = checkWinner(board);

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white pointer-events-auto">
      <h2 className="text-2xl font-bold mb-4 font-mono">{winner ? (winner === 'Draw' ? 'DRAW!' : `WINNER: ${winner}`) : `NEXT: ${xIsNext ? 'X' : 'O'}`}</h2>
      <div className="grid grid-cols-3 gap-2 bg-zinc-700 p-2 rounded">
        {board.map((cell, i) => (
          <button 
            key={i} 
            onClick={() => handleClick(i)} 
            className="w-20 h-20 bg-zinc-800 text-4xl font-bold rounded flex items-center justify-center hover:bg-zinc-600 transition-colors"
          >
            <span className={cell === 'X' ? 'text-blue-400' : 'text-rose-400'}>{cell}</span>
          </button>
        ))}
      </div>
      <button className="mt-6 px-4 py-2 bg-white text-black font-bold rounded" onClick={() => { setBoard(Array(9).fill(null)); setXIsNext(true); }}>RESTART</button>
    </div>
  )
}

// --- GAME 3: Memory Match ---
function MemoryMatch() {
  const [cards, setCards] = useState<{id: number, val: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const emojis = ['🍇','🍉','🍊','🍋','🍌','🍍','🥭','🍎'];

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((val, id) => ({ id, val, isFlipped: false, isMatched: false }));
    setCards(deck);
    setFlippedIds([]);
  };

  const handleCardClick = (id: number) => {
    if (flippedIds.length >= 2 || flippedIds.includes(id) || cards[id].isMatched) return;
    
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setTimeout(() => {
        const [c1, c2] = newFlipped;
        if (cards[c1].val === cards[c2].val) {
          setCards(prev => prev.map(c => c.id === c1 || c.id === c2 ? { ...c, isMatched: true } : c));
        } else {
          setCards(prev => prev.map(c => c.id === c1 || c.id === c2 ? { ...c, isFlipped: false } : c));
        }
        setFlippedIds([]);
      }, 800);
    }
  };

  const isWon = cards.length > 0 && cards.every(c => c.isMatched);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1a2e] text-white pointer-events-auto">
      <h2 className="text-2xl font-bold mb-4 font-mono">{isWon ? 'YOU WON!' : 'MEMORY MATCH'}</h2>
      <div className="grid grid-cols-4 gap-2">
        {cards.map(c => (
          <div 
            key={c.id} 
            onClick={() => handleCardClick(c.id)}
            className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl rounded cursor-pointer transition-all duration-300 ${c.isFlipped || c.isMatched ? 'bg-indigo-500' : 'bg-indigo-900 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]'}`}
          >
            {c.isFlipped || c.isMatched ? c.val : '❓'}
          </div>
        ))}
      </div>
      <button className="mt-8 px-4 py-2 bg-indigo-500 font-bold rounded" onClick={initGame}>RESTART</button>
    </div>
  )
}

// --- GAME 4: 2048 (Animated) ---
interface Tile {
  id: number;
  val: number;
  r: number;
  c: number;
}

function Game2048() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const nextId = useRef(1);

  const spawn = (currentTiles: Tile[], count = 1) => {
    let newTiles = [...currentTiles];
    for (let i = 0; i < count; i++) {
        const emptyPositions = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (!newTiles.find(t => t.r === r && t.c === c)) {
                    emptyPositions.push({ r, c });
                }
            }
        }
        if (emptyPositions.length === 0) break;
        const { r, c } = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        newTiles.push({ id: nextId.current++, val: Math.random() < 0.9 ? 2 : 4, r, c });
    }
    return newTiles;
  };

  const initGame = () => {
    nextId.current = 1;
    setTiles(spawn([], 2));
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;
    let moved = false;
    let currentScore = score;
    const newTiles: Tile[] = [];
    const mergedIds = new Set<number>();

    const sortedTiles = [...tiles].sort((a, b) => {
        if (direction === 'up') return a.r - b.r;
        if (direction === 'down') return b.r - a.r;
        if (direction === 'left') return a.c - b.c;
        if (direction === 'right') return b.c - a.c;
        return 0;
    });

    const dr = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
    const dc = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;

    for (const tile of sortedTiles) {
        let lastR = tile.r;
        let lastC = tile.c;
        
        while (true) {
            const nextR = lastR + dr;
            const nextC = lastC + dc;
            if (nextR < 0 || nextR >= 4 || nextC < 0 || nextC >= 4) break;
            if (newTiles.find(t => t.r === nextR && t.c === nextC)) break;
            lastR = nextR;
            lastC = nextC;
        }

        const nextR = lastR + dr;
        const nextC = lastC + dc;
        let merged = false;

        if (nextR >= 0 && nextR < 4 && nextC >= 0 && nextC < 4) {
            const existingTarget = newTiles.find(t => t.r === nextR && t.c === nextC && !mergedIds.has(t.id));
            if (existingTarget && existingTarget.val === tile.val) {
                existingTarget.val *= 2;
                currentScore += existingTarget.val;
                mergedIds.add(existingTarget.id);
                merged = true;
                moved = true;
            }
        }

        if (!merged) {
            if (lastR !== tile.r || lastC !== tile.c) moved = true;
            newTiles.push({ ...tile, r: lastR, c: lastC });
        }
    }

    if (moved) {
        const withSpawn = spawn(newTiles);
        setTiles(withSpawn);
        setScore(currentScore);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT' || gameOver) return;
        if (e.key === "ArrowLeft") { e.preventDefault(); handleMove('left'); }
        else if (e.key === "ArrowRight") { e.preventDefault(); handleMove('right'); }
        else if (e.key === "ArrowUp") { e.preventDefault(); handleMove('up'); }
        else if (e.key === "ArrowDown") { e.preventDefault(); handleMove('down'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, score, gameOver]);

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-amber-100 text-amber-900 border-amber-200';
      case 4: return 'bg-amber-200 text-amber-900 border-amber-300';
      case 8: return 'bg-orange-300 text-white border-orange-400';
      case 16: return 'bg-orange-400 text-white border-orange-500';
      case 32: return 'bg-rose-400 text-white border-rose-500';
      case 64: return 'bg-rose-500 text-white border-rose-600';
      case 128: return 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/50 scale-105';
      case 256: return 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50 scale-105 ring-2 ring-yellow-400';
      case 512: return 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/50 scale-105 ring-2 ring-yellow-400';
      case 1024: return 'bg-yellow-700 text-white shadow-xl shadow-yellow-700/50 scale-110 ring-4 ring-yellow-300';
      case 2048: return 'bg-yellow-800 text-white shadow-2xl shadow-yellow-800/80 scale-110 ring-4 ring-white animate-pulse';
      default: return 'bg-amber-900 text-white';
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 pointer-events-auto select-none overflow-hidden">
      <div className="mb-4 flex gap-6 items-end text-amber-900">
        <h2 className="text-4xl font-black font-serif tracking-tight">2048</h2>
        <div className="bg-amber-900/10 px-4 py-1.5 rounded-lg border border-amber-900/10 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-0.5">Score</p>
          <p className="font-bold text-xl leading-none">{score}</p>
        </div>
      </div>
      <div className="bg-amber-800/90 p-2 rounded-xl relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] shadow-2xl border-[6px] border-amber-900/10">
        <div className="grid grid-cols-4 gap-2 w-full h-full absolute inset-0 p-2">
           {Array.from({length: 16}).map((_, i) => (
             <div key={i} className="bg-amber-50/10 rounded-lg" />
           ))}
        </div>
        <AnimatePresence>
          {tiles.map((tile) => (
            <motion.div 
              key={tile.id}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 450, layout: { duration: 0.15 } }}
              className={`absolute flex items-center justify-center text-2xl font-bold rounded-lg shadow-md ${getTileColor(tile.val)} transition-colors`}
              style={{
                width: 'calc((100% - 16px - 24px) / 4)',
                height: 'calc((100% - 16px - 24px) / 4)',
                left: `calc(${tile.c} * (100% - 16px) / 4 + ${tile.c * 8 + 8}px)`,
                top: `calc(${tile.r} * (100% - 16px) / 4 + ${tile.r * 8 + 8}px)`,
              }}
            >
              {tile.val}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-10 flex flex-col items-center gap-4">
        <button 
          className="px-8 py-3 bg-amber-900 text-white font-black rounded-full hover:bg-amber-800 active:scale-95 transition-all shadow-xl text-xs tracking-widest uppercase" 
          onClick={initGame}
        >
          New Game
        </button>
        <p className="text-[10px] text-amber-900/30 font-black tracking-widest uppercase">Use Arrow Keys</p>
      </div>
    </div>
  );
}

// --- GAME 5: Reaction Time ---
function ReactionTime() {
  const [state, setState] = useState<'idle' | 'waiting' | 'ready' | 'done'>('idle');
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    setState('waiting');
    const delay = Math.random() * 3000 + 1500;
    timeoutRef.current = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleAreaClick = () => {
    if (state === 'idle' || state === 'done') {
      start();
    } else if (state === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState('done');
      setTime(-1); // Too early
    } else if (state === 'ready') {
      const reaction = Date.now() - startTime;
      setTime(reaction);
      setState('done');
    }
  };

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900 pointer-events-auto overflow-hidden">
      <div 
        className={`flex-1 flex flex-col items-center justify-center text-white cursor-pointer transition-colors duration-100 ${state === 'idle' ? 'bg-blue-600' : state === 'waiting' ? 'bg-rose-600' : state === 'ready' ? 'bg-emerald-600' : 'bg-cyan-700'}`}
        onClick={handleAreaClick}
      >
         <h1 className="text-4xl font-black mb-4">REACTION TEST</h1>
         {state === 'idle' && <p className="text-xl">Click anywhere to start</p>}
         {state === 'waiting' && <p className="text-xl">Wait for green...</p>}
         {state === 'ready' && <p className="text-xl font-bold animate-pulse">CLICK TICK TICK!</p>}
         {state === 'done' && (
           <div className="text-center">
             {time < 0 ? (
               <p className="text-2xl text-yellow-300">Too early! Click to try again.</p>
             ) : (
               <p className="text-3xl"><span className="font-bold text-4xl">{time}</span> ms<br/><span className="text-base mt-2 inline-block">Click to try again</span></p>
             )}
           </div>
         )}
      </div>
    </div>
  )
}

// --- GAME 6: Catch the Dot ---
function CatchDot() {
    const [score, setScore] = useState(0);
    const [pos, setPos] = useState({top: 50, left: 50});
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        setScore(0);
        setTimeLeft(15);
        moveDot();
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            moveDot();
        }, 800);
    };

    const moveDot = () => {
        setPos({
            top: 10 + Math.random() * 80,
            left: 10 + Math.random() * 80
        });
    };

    const handleDotClick = () => {
        if (timeLeft <= 0) return;
        setScore(s => s + 1);
        moveDot();
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div className="w-full h-full relative bg-[#ffd166] text-[#073b4c] pointer-events-auto overflow-hidden font-bold">
            <div className="absolute top-4 left-4 text-2xl bg-white/50 px-4 py-2 rounded">
                SCORE: {score}
            </div>
            <div className="absolute top-4 right-4 text-2xl bg-white/50 px-4 py-2 rounded">
                TIME: {timeLeft}s
            </div>

            {timeLeft > 0 ? (
                <div 
                    onClick={handleDotClick}
                    className="absolute w-16 h-16 bg-[#ef476f] rounded-full cursor-pointer shadow-xl border-4 border-white transition-all duration-300"
                    style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <h2 className="text-4xl mb-4">{score > 0 ? `Final Score: ${score}` : 'CATCH THE DOT'}</h2>
                    <button onClick={startGame} className="px-8 py-4 bg-[#118ab2] text-white rounded-full text-xl shadow-lg hover:bg-[#073b4c] transition-colors">
                        START
                    </button>
                </div>
            )}
        </div>
    )
}

// --- GAME 8: Marble Shooter ---
function MarbleGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [targets, setTargets] = useState<{id: number, x: number, y: number, active: boolean}[]>(() => {
        const t = [];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 10; j++) t.push({id: i * 10 + j, x: 5 + j * 9, y: 5 + i * 8, active: true});
        return t;
    });
    const [projectile, setProjectile] = useState({x: 50, y: 90, vx: 0, vy: 0, active: false});
    const [aimAngle, setAimAngle] = useState(0);
    const [isAiming, setIsAiming] = useState(false);

    useEffect(() => {
        let frame: number;
        const loop = () => {
            if (projectile.active) {
                setProjectile(p => {
                    let {x, y, vx, vy} = p;
                    x += vx;
                    y += vy;
                    
                    // Bounce off walls
                    if (x < 2 || x > 98) vx *= -1;
                    if (y < 2) vy *= -1;

                    // Hit ground or reset
                    if (y > 98) return {x: 50, y: 90, vx: 0, vy: 0, active: false};

                    // Hit target (simple collision)
                    let hit = false;
                    setTargets(ts => ts.map(t => {
                        if (t.active && Math.abs(t.x - x) < 3 && Math.abs(t.y - y) < 3) {
                            hit = true;
                            return {...t, active: false};
                        }
                        return t;
                    }));
                    if (hit) vy *= -1;

                    return {x, y, vx, vy, active: true};
                });
            }
            frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frame);
    }, [projectile.active]);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isAiming || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dx = e.clientX - rect.left - rect.width / 2;
        const dy = e.clientY - rect.top - rect.height * 0.9;
        setAimAngle(Math.atan2(dx, -dy) * 180 / Math.PI);
    };

    const handlePointerUp = () => {
        if (!isAiming) return;
        setIsAiming(false);
        const speed = 2;
        setProjectile({
            x: 50, 
            y: 90, 
            vx: Math.sin(aimAngle * Math.PI / 180) * speed, 
            vy: -Math.cos(aimAngle * Math.PI / 180) * speed, 
            active: true
        });
    };

    return (
        <div 
            ref={containerRef}
            className="w-full h-full relative bg-zinc-950 pointer-events-auto touch-none"
            onPointerDown={() => setIsAiming(true)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {targets.map(t => t.active && (
                <div key={t.id} className="absolute w-[6%] h-[6%] rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{left: `${t.x}%`, top: `${t.y}%`}} />
            ))}
            
            {/* Shooter (Arrow) */}
            <div className="absolute bottom-[5%] left-1/2 w-4 h-4 bg-white rounded-full translate-x-[-50%]" />
            {isAiming && (
                <div className="absolute bottom-[5%] left-1/2 h-24 w-1 bg-white origin-bottom translate-x-[-50%]" style={{transform: `rotate(${aimAngle}deg)`}} />
            )}

            {/* Projectile */}
            {projectile.active && (
                <div className="absolute w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{left: `${projectile.x}%`, top: `${projectile.y}%`}} />
            )}
        </div>
    )
}
import { Chess } from 'chess.js';

// --- GAME 7: Chess ---
function ChessGame() {
    const [game, setGame] = useState(new Chess());
    const [board, setBoard] = useState(game.board());
    const [selected, setSelected] = useState<string | null>(null);
    const [legalMoves, setLegalMoves] = useState<string[]>([]);

    useEffect(() => {
        if (game.turn() === 'b' && !game.isGameOver()) {
            const timer = setTimeout(() => {
                const possibleMoves = game.moves({ verbose: true });
                if (possibleMoves.length > 0) {
                    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    game.move(randomMove);
                    setBoard(game.board());
                    setGame(new Chess(game.fen()));
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [game, board]);

    function makeMove(from: string, to: string) {
        try {
            const move = game.move({ from, to, promotion: 'q' });
            if (move) {
                setBoard(game.board());
                setGame(new Chess(game.fen()));
                setLegalMoves([]);
                setSelected(null);
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    const handleClick = (square: string) => {
        if (selected) {
            if (legalMoves.includes(square)) {
                makeMove(selected, square);
            } else {
                setSelected(null);
                setLegalMoves([]);
            }
        } else {
            const piece = game.get(square as any);
            if (piece && piece.color === game.turn()) {
                setSelected(square);
                const moves = game.moves({ square: square as any, verbose: true });
                setLegalMoves(moves.map(m => m.to));
            }
        }
    }

    const pieceSymbols: Record<string, string> = {
        wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
        bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚'
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 pointer-events-auto p-4">
            <h2 className="text-white font-bold mb-4">{game.isCheck() ? 'CHECK!' : game.turn() === 'w' ? 'WHITE TURN' : 'BLACK TURN'}</h2>
            <div className="grid grid-cols-8 gap-0 border-4 border-zinc-900 w-full max-w-[400px] aspect-square">
                {board.flat().map((piece, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    const square = `${String.fromCharCode(97 + col)}${8 - row}`;
                    const isSelected = selected === square;
                    const isLegal = legalMoves.includes(square);
                    
                    return (
                        <button 
                            key={square}
                            onClick={() => handleClick(square)}
                            className={`w-full h-full flex items-center justify-center text-2xl 
                                ${(row + col) % 2 === 0 ? 'bg-zinc-200' : 'bg-zinc-500'}
                                ${isSelected ? 'ring-4 ring-orange-400' : ''}
                                ${isLegal ? 'ring-4 ring-emerald-400' : ''}`}
                        >
                            {piece ? pieceSymbols[`${piece.color}${piece.type}`] : ''}
                        </button>
                    )
                })}
            </div>
            <button className="mt-4 px-4 py-2 bg-zinc-600 text-white font-bold rounded" onClick={() => {
                const newGame = new Chess();
                setGame(newGame);
                setBoard(newGame.board());
                setSelected(null);
                setLegalMoves([]);
            }}>RESET</button>
        </div>
    )
}


export default function GamesHub() {
  const [activeGame, setActiveGame] = useState<number | null>(null);

  const games = [
    { id: 1, name: 'SNAKE', color: 'bg-emerald-600', comp: SnakeGame },
    { id: 2, name: 'TIC TAC TOE', color: 'bg-blue-600', comp: TicTacToe },
    { id: 3, name: 'MEMORY MATCH', color: 'bg-indigo-600', comp: MemoryMatch },
    { id: 4, name: '2048', color: 'bg-amber-600', comp: Game2048 },
    { id: 5, name: 'REACTION TEST', color: 'bg-rose-600', comp: ReactionTime },
    { id: 6, name: 'CATCH DOT', color: 'bg-pink-600', comp: CatchDot },
    { id: 7, name: 'CHESS', color: 'bg-zinc-600', comp: ChessGame },
    { id: 8, name: 'MARBLE DROP', color: 'bg-blue-600', comp: MarbleGame },
  ];


  const ActiveComp = games.find(g => g.id === activeGame)?.comp;

  return (
    <div className="w-full h-full bg-zinc-900 border border-zinc-700 pointer-events-auto text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="h-12 bg-black border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
        <h1 className="font-black tracking-widest text-emerald-500">RETRO GAMES HUB</h1>
        {activeGame !== null && (
          <button 
            onClick={() => setActiveGame(null)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-zinc-300"
          >
            ← MENU
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {activeGame === null ? (
          <div className="absolute inset-0 p-6 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
            {games.map(g => (
              <button 
                key={g.id}
                onClick={() => setActiveGame(g.id)}
                className={`${g.color} rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-white/20`}
              >
                <div className="w-16 h-16 bg-black/20 rounded-lg shadow-inner mb-2 flex items-center justify-center text-3xl">
                   {g.id === 1 && '🐍'}
                   {g.id === 2 && '❌'}
                   {g.id === 3 && '❓'}
                   {g.id === 4 && '🔢'}
                   {g.id === 5 && '⚡'}
                   {g.id === 6 && '🔴'}
                   {g.id === 7 && '♟️'}
                   {g.id === 8 && '🔵'}
                </div>
                <span className="font-bold tracking-widest text-sm text-center">{g.name}</span>
              </button>
            ))}
          </div>
         ) : (
             <div className="absolute inset-0">
               {ActiveComp && <ActiveComp />}
             </div>
         )}
      </div>
    </div>
  );
}
