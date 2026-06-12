import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ChevronRight, X, Search } from 'lucide-react';

export function Calculator({ onSecretTrigger, secretCode }: { onSecretTrigger?: () => void, secretCode?: string }) {
  const [display, setDisplay] = useState('0');
  const handleCalc = (val: string) => {
    if (val === 'C') setDisplay('0');
    else if (val === 'DEL') setDisplay(d => d.length > 1 ? d.slice(0, -1).replace(/Err$/, '0') : '0');
    else if (val === '=') {
       if (secretCode && display === secretCode && onSecretTrigger) {
         onSecretTrigger();
         setDisplay('0');
         return;
       }
       try {
         let expr = display
           .replace(/x/g, '*')
           .replace(/÷/g, '/')
           .replace(/\^/g, '**')
           .replace(/sin\(/g, 'Math.sin(')
           .replace(/cos\(/g, 'Math.cos(')
           .replace(/tan\(/g, 'Math.tan(')
           .replace(/log\(/g, 'Math.log10(')
           .replace(/ln\(/g, 'Math.log(')
           .replace(/√\(/g, 'Math.sqrt(')
           .replace(/e/g, 'Math.E')
           .replace(/π/g, 'Math.PI');
         // Basic guard for empty parens or something
         setDisplay(eval(expr).toString());
       } catch(e) { setDisplay('Err'); }
    }
    else {
       setDisplay(d => d === '0' || d === 'Err' ? val : d + val);
    }
  }

  const advancedButtons = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', '√(', '^', 'π', 'e', '(', ')'];
  const basicButtons = ['7', '8', '9', '÷', '4', '5', '6', 'x', '1', '2', '3', '-', '0', '.', '+'];

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 w-full flex flex-col gap-4">
       <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="bg-white text-right p-5 rounded-xl font-mono text-3xl border border-gray-200 overflow-hidden text-gray-800 lg:w-1/4 min-h-[80px] flex items-center justify-end shadow-inner shrink-0">
            {display}
          </div>
          <div className="flex-1 grid grid-cols-6 sm:grid-cols-10 md:grid-cols-13 gap-1.5 p-1 bg-gray-100 rounded-xl">
             {advancedButtons.map(btn => (
               <button key={btn} onClick={() => handleCalc(btn)} className="h-10 text-[10px] sm:text-xs font-bold rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-sm uppercase">{btn.replace('(', '')}</button>
             ))}
             {basicButtons.map(btn => (
               <button key={btn} onClick={() => handleCalc(btn)} className={`h-10 text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm ${['÷','x','-','+'].includes(btn) ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-white text-gray-700 border border-gray-200'}`}>{btn}</button>
             ))}
             <button onClick={() => handleCalc('DEL')} className="h-10 text-xs font-bold rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 uppercase transition-all">DEL</button>
             <button onClick={() => handleCalc('C')} className="h-10 text-xs font-bold rounded-lg bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 uppercase transition-all">CLR</button>
             <button onClick={() => handleCalc('=')} className="h-10 text-xs font-bold rounded-lg bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 col-span-2 transition-all shadow-lg shadow-indigo-100">=</button>
          </div>
       </div>
    </div>
  );
}

export function MiniSpreadsheet() {
  const [cells, setCells] = useState<{ [key: string]: string }>({});
  const rows = [1,2,3];
  const cols = ['A','B','C'];
  return (
     <div className="border border-gray-300 rounded overflow-hidden text-xs bg-white">
       <div className="flex bg-gray-100 text-gray-500 font-bold border-b border-gray-300">
         <div className="w-8 border-r border-gray-300 text-center py-1"></div>
         {cols.map(c => <div key={c} className="flex-1 text-center py-1 border-r border-gray-300 last:border-0">{c}</div>)}
       </div>
       {rows.map(r => (
         <div key={r} className="flex border-b border-gray-200 last:border-0">
           <div className="w-8 bg-gray-100 border-r border-gray-300 text-center py-1 font-bold text-gray-500">{r}</div>
           {cols.map(c => (
              <input 
                key={`${c}${r}`} 
                value={cells[`${c}${r}`] || ''}
                onChange={e => setCells({...cells, [`${c}${r}`]: e.target.value})}
                className="flex-1 w-0 px-1 py-1 border-r border-gray-200 last:border-0 focus:outline-none focus:bg-indigo-50 text-center text-gray-700"
              />
           ))}
         </div>
       ))}
     </div>
  );
}

export function Scratchpad() {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const [isDrawing, setIsDrawing] = useState(false);
   const [color, setColor] = useState('#4f46e5');
   const [brushSize, setBrushSize] = useState(2);
   
   const resizeCanvas = () => {
     const canvas = canvasRef.current;
     const container = containerRef.current;
     if (!canvas || !container) return;
     
     // Save current drawing
     const tempImage = canvas.toDataURL();
     
     // Get true display size
     const rect = container.getBoundingClientRect();
     
     // Prevent redundant resizing if already correct
     if (canvas.width === rect.width && canvas.height === 250) return;
     
     const oldWidth = canvas.width;
     const oldHeight = canvas.height;
     
     canvas.width = rect.width;
     canvas.height = 250; 
     
     const ctx = canvas.getContext('2d');
     if (ctx) {
       ctx.fillStyle = '#ffffff';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       
       const img = new Image();
       img.onload = () => {
         // Scale the previous content to new dimensions
         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
       };
       img.src = tempImage;
     }
   };

   useEffect(() => {
     resizeCanvas();
     const observer = new ResizeObserver(() => {
        window.requestAnimationFrame(resizeCanvas);
     });
     if (containerRef.current) observer.observe(containerRef.current);
     return () => observer.disconnect();
   }, []);

   const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
     const canvas = canvasRef.current;
     if (!canvas) return { x: 0, y: 0 };
     
     const rect = canvas.getBoundingClientRect();
     const scaleX = canvas.width / rect.width;
     const scaleY = canvas.height / rect.height;
     
     let clientX, clientY;
     if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
     } else {
       clientX = e.clientX;
       clientY = e.clientY;
     }
     
     return {
       x: (clientX - rect.left) * scaleX,
       y: (clientY - rect.top) * scaleY
     };
   };

   const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
     if (!isDrawing) return;
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
     
     const { x, y } = getCoordinates(e);
     
     ctx.lineWidth = brushSize;
     ctx.lineCap = 'round';
     ctx.lineJoin = 'round';
     ctx.strokeStyle = color;
     ctx.lineTo(x, y);
     ctx.stroke();
   };

   const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if(canvas) {
         const ctx = canvas.getContext('2d');
         const { x, y } = getCoordinates(e);
         ctx?.beginPath();
         ctx?.moveTo(x, y);
      }
   };

   return (
      <div ref={containerRef} className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
         <div className="relative border border-gray-300 rounded-xl overflow-hidden bg-white flex-1 shadow-inner min-h-[200px]">
            <canvas 
               ref={canvasRef}
               className="w-full h-full cursor-crosshair touch-none"
               onMouseDown={startDrawing}
               onMouseMove={draw}
               onMouseUp={() => setIsDrawing(false)}
               onMouseOut={() => setIsDrawing(false)}
               onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }}
               onTouchMove={(e) => { e.preventDefault(); draw(e); }}
               onTouchEnd={() => setIsDrawing(false)}
            />
            <button 
              onClick={() => {
                 const canvas = canvasRef.current;
                 if (canvas) {
                   const ctx = canvas.getContext('2d');
                   ctx?.clearRect(0,0, canvas.width, canvas.height);
                   ctx!.fillStyle = '#ffffff';
                   ctx?.fillRect(0,0, canvas.width, canvas.height);
                 }
              }} 
              className="absolute top-2 right-2 text-xs bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-rose-600 border border-rose-200 font-bold shadow-sm transition-colors"
            >
               Clear
            </button>
         </div>

         <div className="flex md:flex-col gap-3 justify-center items-center md:w-32">
            <div className="flex md:grid md:grid-cols-2 gap-2">
               {['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
                 <button
                   key={c}
                   onClick={() => setColor(c)}
                   className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-400 scale-125' : 'border-transparent'}`}
                   style={{ backgroundColor: c }}
                 />
               ))}
            </div>
            <div className="h-px bg-gray-300 w-full hidden md:block"></div>
            <div className="flex flex-col gap-1 w-full text-[10px] text-gray-500 font-bold uppercase text-center">
               <span>Size</span>
               <input 
                 type="range" 
                 min="1" 
                 max="10" 
                 value={brushSize} 
                 onChange={(e) => setBrushSize(parseInt(e.target.value))}
                 className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
               />
            </div>
         </div>
      </div>
   );
}

export function StudyTimer() {
  const [time, setTime] = useState(new Date());
  const [timer, setTimer] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const int = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    let int: NodeJS.Timeout;
    if (isRunning && timer > 0) {
       int = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(int);
  }, [isRunning, timer]);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
       <div className="text-xl font-bold text-gray-800 mb-1 font-mono tracking-widest">{time.toLocaleTimeString()}</div>
       <div className="h-px w-full bg-gray-100 my-2"></div>
       <div className="text-3xl font-black text-indigo-600 my-2 font-mono">
         {Math.floor(timer/60).toString().padStart(2,'0')}:{(timer%60).toString().padStart(2,'0')}
       </div>
       <div className="flex gap-2 w-full">
         <button onClick={() => setIsRunning(!isRunning)} className="flex-1 py-1.5 bg-indigo-50 text-indigo-700 rounded text-sm font-bold hover:bg-indigo-100">{isRunning ? 'Pause' : 'Start Focus'}</button>
         <button onClick={() => {setIsRunning(false); setTimer(25*60);}} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200">Reset</button>
       </div>
    </div>
  )
}

export function Flashcard() {
   const [flipped, setFlipped] = useState(false);
   const [idx, setIdx] = useState(0);
   const cards = [
      { q: "What is the capital of France?", a: "Paris" },
      { q: "What is 12 x 12?", a: "144" },
      { q: "Define: Mitochondria", a: "Powerhouse of the cell" }
   ];

   return (
     <div className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer min-h-[120px] flex flex-col items-center justify-center relative text-center group hover:border-indigo-300" onClick={() => setFlipped(!flipped)}>
        <p className="text-xs text-gray-400 absolute top-2 left-3">Flashcard {idx+1}/{cards.length}</p>
        <div className="text-base font-medium text-gray-800 px-4 mt-2">
           {flipped ? <span className="text-indigo-600">{cards[idx].a}</span> : cards[idx].q}
        </div>
        <p className="text-[10px] text-gray-300 absolute bottom-2">Click to flip</p>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i > 0 ? i - 1 : cards.length - 1)); setFlipped(false); }} className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-xs text-gray-600">Prev</button>
           <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i < cards.length - 1 ? i + 1 : 0)); setFlipped(false); }} className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-xs text-gray-600">Next</button>
        </div>
     </div>
   )
}

export function QuizModule() {
   const [selected, setSelected] = useState<number | null>(null);
   const [qIdx, setQIdx] = useState(0);
   const qs = [
     { q: "Which of the following is NOT a fundamental data type in C++?", opts: ["int", "string", "float", "boolean"] },
     { q: "What is the time complexity of a binary search?", opts: ["O(n)", "O(n log n)", "O(log n)", "O(1)"] }
   ];
   return (
     <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mt-6">
       <div className="flex justify-between items-center mb-4">
         <h4 className="font-bold text-gray-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Quick Practice</h4>
         <div className="flex gap-1">
           {qs.map((_, i) => (
             <button key={i} onClick={() => {setQIdx(i); setSelected(null);}} className={`w-6 h-6 rounded-full text-xs font-bold ${qIdx === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{i+1}</button>
           ))}
         </div>
       </div>
       <p className="font-medium text-gray-900 mb-4 text-sm">{qs[qIdx].q}</p>
       <div className="space-y-2">
         {qs[qIdx].opts.map((opt, i) => (
           <button 
             key={i} 
             onClick={() => setSelected(i)}
             className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors focus:outline-none ${selected === i ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200 text-gray-700'}`}
           >
             <span className="inline-block w-6 text-gray-400 mr-2">{['A','B','C','D'][i]}.</span> {opt}
           </button>
         ))}
       </div>
     </div>
   )
}

export function UnitConverter() {
   return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-xs">
         <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200 font-bold text-gray-500">
            <div className="p-2 border-r border-gray-200">Length</div>
            <div className="p-2">Weight</div>
         </div>
         <div className="grid grid-cols-2 text-gray-600">
            <div className="p-2 border-r border-gray-200 flex flex-col gap-1">
               <div className="flex justify-between"><span>1 in</span><span>2.54 cm</span></div>
               <div className="flex justify-between"><span>1 ft</span><span>30.48 cm</span></div>
               <div className="flex justify-between"><span>1 mi</span><span>1.61 km</span></div>
            </div>
            <div className="p-2 flex flex-col gap-1">
               <div className="flex justify-between"><span>1 oz</span><span>28.35 g</span></div>
               <div className="flex justify-between"><span>1 lb</span><span>0.45 kg</span></div>
               <div className="flex justify-between"><span>1 kg</span><span>2.20 lb</span></div>
            </div>
         </div>
      </div>
   )
}

export function FormulaSheet({ onSecretTrigger }: { onSecretTrigger?: () => void }) {
   return (
      <div 
         onDoubleClick={onSecretTrigger}
         className="bg-white rounded-xl border border-gray-200 p-3 space-y-2 group cursor-default select-none"
      >
         <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-indigo-600 group-hover:text-indigo-700 font-serif overflow-hidden">E = mc²</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:rotate-90 transition-transform" />
         </div>
         <div className="text-xs text-gray-500 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300 overflow-hidden space-y-1">
            <p><strong>Mass-energy equivalence</strong></p>
            <p>Energy eq: E = m × c²</p>
            <p>c ≈ 3 × 10⁸ m/s</p>
         </div>
      </div>
   )
}

export function TodoList() {
   const [todos, setTodos] = useState<{id: number, text: string, done: boolean}[]>(() => {
      const saved = localStorage.getItem('study-todos');
      return saved ? JSON.parse(saved) : [
         { id: 1, text: 'Complete Math Exercise', done: false },
         { id: 2, text: 'Read Literature Chapter 4', done: true }
      ];
   });
   const [newTodo, setNewTodo] = useState('');

   useEffect(() => {
      localStorage.setItem('study-todos', JSON.stringify(todos));
   }, [todos]);

   const add = () => {
      if (!newTodo.trim()) return;
      setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
      setNewTodo('');
   };

   return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
         <div className="flex gap-2">
            <input 
               value={newTodo}
               onChange={e => setNewTodo(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && add()}
               placeholder="Add study task..."
               className="flex-1 text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button onClick={add} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">+</button>
         </div>
         <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {todos.map(t => (
               <div key={t.id} className="flex items-center gap-2 group">
                  <input 
                     type="checkbox" 
                     checked={t.done} 
                     onChange={() => setTodos(todos.map(td => td.id === t.id ? {...td, done: !td.done} : td))}
                     className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className={`text-xs flex-1 ${t.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{t.text}</span>
                  <button onClick={() => setTodos(todos.filter(td => td.id !== t.id))} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                     <X className="w-3 h-3" />
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
}

export function Dictionary() {
   const [word, setWord] = useState('');
   const [result, setResult] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);

   const lookup = () => {
      if (!word.trim()) return;
      setLoading(true);
      // Simulate API lookup
      setTimeout(() => {
         const dict: Record<string, string> = {
            'calculus': 'n. 微积分学',
            'fundamental': 'adj. 基本的，根本的；n. 基本原则',
            'theory': 'n. 理论，学说；意见',
            'study': 'n. 学习，研究；书房；v. 学习，研究',
         };
         setResult(dict[word.toLowerCase()] || 'Word not found in local cache. Refer to network dictionary.');
         setLoading(false);
      }, 500);
   };

   return (
      <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
         <div className="relative">
            <input 
               value={word}
               onChange={e => setWord(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && lookup()}
               placeholder="Search word..."
               className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none pr-8"
            />
            <button onClick={lookup} className="absolute right-2 top-1.5">
               <Search className="w-3.5 h-3.5 text-gray-400" />
            </button>
         </div>
         {loading && <div className="text-[10px] text-gray-400 animate-pulse">Searching...</div>}
         {result && <div className="text-xs p-2 bg-indigo-50 text-indigo-800 rounded border border-indigo-100">{result}</div>}
      </div>
   );
}

export function WrongQuestionBox() {
   const [questions, setQuestions] = useState<{id: number, text: string}[]>(() => {
      const saved = localStorage.getItem('wrong-questions');
      return saved ? JSON.parse(saved) : [];
   });
   const [editing, setEditing] = useState(false);
   const [newBox, setNewBox] = useState('');

   useEffect(() => {
      localStorage.setItem('wrong-questions', JSON.stringify(questions));
   }, [questions]);

   return (
      <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
         {editing ? (
            <div className="space-y-2">
               <textarea 
                  value={newBox}
                  onChange={e => setNewBox(e.target.value)}
                  placeholder="Paste wrong question content here..."
                  className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded min-h-[100px] focus:outline-none"
               />
               <div className="flex gap-1">
                  <button onClick={() => {
                     if(newBox.trim()) setQuestions([...questions, { id: Date.now(), text: newBox }]);
                     setNewBox('');
                     setEditing(false);
                  }} className="flex-1 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded">Save</button>
                  <button onClick={() => setEditing(false)} className="flex-1 py-1 bg-gray-100 text-gray-600 text-[10px] rounded">Cancel</button>
               </div>
            </div>
         ) : (
            <>
               <div className="space-y-2 max-h-40 overflow-y-auto">
                  {questions.length === 0 ? (
                     <div className="text-[10px] text-gray-400 text-center py-4">No records yet.</div>
                  ) : (
                     questions.map(q => (
                        <div key={q.id} className="p-2 bg-rose-50 border border-rose-100 rounded text-[10px] text-gray-700 relative">
                           {q.text.length > 50 ? q.text.slice(0,50)+'...' : q.text}
                           <button onClick={() => setQuestions(questions.filter(td => td.id !== q.id))} className="absolute top-1 right-1 text-rose-300 hover:text-rose-600">
                              <X className="w-3 h-3" />
                           </button>
                        </div>
                     ))
                  )}
               </div>
               <button onClick={() => setEditing(true)} className="w-full py-1 border border-dashed border-rose-200 text-rose-600 text-[10px] rounded hover:bg-rose-50">+ Add Wrong Question</button>
            </>
         )}
      </div>
   );
}
