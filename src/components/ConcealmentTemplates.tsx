import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  FileText, 
  Presentation, 
  Palette, 
  Layout, 
  Search, 
  Grid3X3, 
  Type, 
  Image as ImageIcon,
  Shapes, 
  MousePointer2,
  Share2,
  Download,
  Settings as SettingsIcon,
  ChevronRight,
  Maximize,
  Layers,
  ArrowUpRight,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  PenTool,
  MessageSquare,
  X
} from 'lucide-react';
interface TemplateProps {
  onSecretTrigger: (pos?: { x: number, y: number }) => void;
  onOpenTemplateSelector: () => void;
}

const TopLeftTrigger = ({ onOpenTemplateSelector, onSecretTrigger }: TemplateProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // 2s for template selector
    timerRef.current = setTimeout(() => {
       onOpenTemplateSelector();
    }, 2000);

    // 5s for emergency TV trigger (failsafe)
    // Actually the user didn't ask for this but it's good for hidden apps
  };

  const handleEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div 
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      className="cursor-pointer select-none"
    >
      <GraduationCap className="w-8 h-8" />
    </div>
  );
};

const CopyrightTrigger = ({ onSecretTrigger }: { onSecretTrigger: (pos?: { x: number, y: number }) => void }) => {
  return (
    <div 
      onClick={(e) => onSecretTrigger({ x: e.clientX, y: e.clientY })}
      className="absolute bottom-4 left-4 text-[10px] opacity-20 hover:opacity-100 cursor-pointer transition-all font-mono z-[100] tracking-tighter"
    >
      made by zgy
    </div>
  );
};

// 1. Chess Template
export const ChessTemplate = ({ onOpenTemplateSelector, onSecretTrigger }: TemplateProps) => {
  const [board, setBoard] = useState<(string | null)[]>(() => {
    const b = Array(64).fill(null);
    for (let i = 8; i < 16; i++) b[i] = '♟';
    for (let i = 48; i < 56; i++) b[i] = '♙';
    b[0] = b[7] = '♜'; b[56] = b[63] = '♖';
    b[1] = b[6] = '♞'; b[57] = b[62] = '♘';
    b[2] = b[5] = '♝'; b[58] = b[61] = '♗';
    b[3] = '♛'; b[59] = '♕';
    b[4] = '♚'; b[60] = '♔';
    return b;
  });
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>(['1. e4 e5', '2. Nf3 Nc6', '3. Bb5 a6']);

  const handleSquareClick = (i: number) => {
    if (selectedSquare === null) {
      if (board[i]) setSelectedSquare(i);
    } else {
      const newBoard = [...board];
      newBoard[i] = board[selectedSquare];
      newBoard[selectedSquare] = null;
      setBoard(newBoard);
      setSelectedSquare(null);
      const ranks = ['a','b','c','d','e','f','g','h'];
      const file = ranks[i % 8];
      const rank = 8 - Math.floor(i / 8);
      setHistory(h => [...h, `${Math.floor(h.length / 2) + 1}. ${file}${rank}`]);
    }
  };
  
  return (
    <div className="w-full h-full bg-[#312e2b] text-[#bababa] flex font-sans select-none overflow-hidden">
      <div className="w-64 bg-[#262421] flex flex-col border-r border-[#3a3734]">
        <div className="p-4 flex items-center gap-3 border-b border-[#3a3734] mb-4">
          <div className="text-green-600">
             <TopLeftTrigger onOpenTemplateSelector={onOpenTemplateSelector} onSecretTrigger={onSecretTrigger} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ChessWorld</span>
        </div>
        <div className="px-2 space-y-1">
          {['Play', 'Puzzles', 'Learn', 'Watch', 'News', 'Social'].map(item => (
            <div key={item} className="flex items-center gap-3 px-4 py-2 hover:bg-[#3a3734] rounded cursor-pointer transition-colors">
              <div className="w-5 h-5 opacity-70" />
              <span className="font-medium text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-6">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-[#262421] px-4 py-2 rounded border border-[#3a3734]">
                  <span className="text-sm font-bold text-green-500">Live Games:</span>
                  <span className="text-sm">42,591</span>
               </div>
               <div className="flex items-center gap-2 bg-[#262421] px-4 py-2 rounded border border-[#3a3734]">
                  <span className="text-sm font-bold text-blue-500">Players:</span>
                  <span className="text-sm">118,203</span>
               </div>
            </div>
            <div className="h-10 w-48 bg-[#262421] rounded border border-[#3a3734] flex items-center px-3 gap-2">
               <Search className="w-4 h-4 opacity-40" />
               <span className="text-xs opacity-30 italic">Search players...</span>
            </div>
         </div>
  
         <div className="flex gap-8">
            <div className="aspect-square w-[550px] bg-[#262421] grid grid-cols-8 grid-rows-8 border-4 border-[#3a3734] shadow-2xl overflow-hidden cursor-pointer">
               {board.map((piece, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isDark = (row + col) % 2 === 1;
                  const isSelected = selectedSquare === i;
                  
                  return (
                    <div 
                      key={i} 
                      onClick={() => handleSquareClick(i)}
                      className={`flex items-center justify-center text-4xl relative transition-colors ${
                        isSelected ? 'bg-yellow-200/40' : isDark ? 'bg-[#769656]' : 'bg-[#eeeed2]'
                      } ${piece ? 'hover:scale-110 active:scale-95' : ''} transition-all`}
                    >
                      {piece && <span className="opacity-90 grayscale drop-shadow-sm">{piece}</span>}
                    </div>
                  )
               })}
            </div>
            
            <div className="flex-1 space-y-6">
               <div className="bg-[#262421] p-5 rounded border border-[#3a3734] space-y-4">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gray-600" />
                        <span className="font-bold text-white text-sm">Grandmaster_DeepBlue</span>
                        <span className="text-xs bg-[#3a3734] px-1.5 rounded">2841</span>
                     </div>
                     <span className="font-mono text-xl font-bold bg-black px-3 py-1 rounded text-white">04:12</span>
                  </div>
                  <div className="h-[200px] bg-black/20 rounded overflow-y-auto p-3 font-mono text-xs space-y-1">
                     {history.map((m, idx) => (
                       <div key={idx} className={idx === history.length - 1 ? 'text-yellow-500' : ''}>{m}</div>
                     ))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-indigo-600" />
                        <span className="font-bold text-white text-sm">Alpha_Predictor</span>
                        <span className="text-xs bg-[#3a3734] px-1.5 rounded">2795</span>
                     </div>
                     <span className="font-mono text-xl font-bold bg-black px-3 py-1 rounded text-white">03:45</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                     <button className="flex-1 bg-[#3a3734] hover:bg-[#4a4744] py-2 rounded text-sm font-bold transition-colors">Resign</button>
                     <button className="flex-1 bg-[#3a3734] hover:bg-[#4a4744] py-2 rounded text-sm font-bold transition-colors">Draw</button>
                  </div>
               </div>
  
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#262421] p-4 rounded border border-[#3a3734] flex flex-col items-center justify-center gap-2">
                     <span className="text-xs opacity-60">Accuracy</span>
                     <span className="text-2xl font-bold text-green-500">92.4%</span>
                  </div>
                  <div className="bg-[#262421] p-4 rounded border border-[#3a3734] flex flex-col items-center justify-center gap-2">
                     <span className="text-xs opacity-60">Avg. Move Time</span>
                     <span className="text-2xl font-bold text-blue-400">1.8s</span>
                  </div>
               </div>
            </div>
         </div>
       </div>
       <CopyrightTrigger onSecretTrigger={onSecretTrigger} />
    </div>
  );
};

// 2. PPT Template
export const PPTTemplate = ({ onOpenTemplateSelector, onSecretTrigger }: TemplateProps) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [slides, setSlides] = useState<Record<number, { title: string, subtitle: string }>>({
    1: { title: 'QUARTERLY PERFORMANCE', subtitle: 'Global Sales Strategy & Execution' },
    2: { title: 'MARKET TRENDS 2026', subtitle: 'Analyzing shifting consumer behaviors' },
    3: { title: 'REVENUE PROJECTIONS', subtitle: 'Targeting 15% growth in NA region' },
    4: { title: 'TEAM COLLABORATION', subtitle: 'Optimizing cross-functional workflows' },
    5: { title: 'Q&A SESSION', subtitle: 'Addressing stakeholder concerns' },
  });
  
  const [isSlideshow, setIsSlideshow] = useState(false);
  
  const updateSlide = (key: 'title' | 'subtitle', val: string) => {
    setSlides(prev => ({
      ...prev,
      [currentSlide]: { ...prev[currentSlide], [key]: val }
    }));
  };
  
  return (
    <div className="w-full h-full bg-[#f3f3f3] flex flex-col font-sans overflow-hidden select-none">
       {/* Ribbon */}
       <div className="h-28 bg-[#f3f3f3] border-b border-[#dadada] flex flex-col">
          <div className="h-8 flex items-center px-4 gap-6 text-[11px] font-medium text-[#444]">
             <div className="text-orange-600 scale-75 -ml-2">
                <TopLeftTrigger onOpenTemplateSelector={onOpenTemplateSelector} onSecretTrigger={onSecretTrigger} />
             </div>
             <span className="text-orange-600 border-b-2 border-orange-600 pt-1 pb-1">Home</span>
             <span>Insert</span>
             <span>Draw</span>
             <span>Design</span>
             <span>Transitions</span>
             <span>Animations</span>
             <span onClick={() => setIsSlideshow(true)} className="hover:text-orange-600 cursor-pointer transition-colors">Slide Show</span>
             <span>Review</span>
             <span>View</span>
          </div>
          <div className="flex-1 bg-white flex items-center px-4 gap-8">
             <div className="flex items-center gap-2 border-r pr-8 group">
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                   <div className="w-8 h-8 bg-orange-50 rounded hover:bg-orange-100 flex items-center justify-center border border-orange-200">
                      <Grid3X3 className="w-5 h-5 text-orange-600" />
                   </div>
                   <span className="text-[10px] text-gray-500">New Slide</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                   <div className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-200">
                      <Layout className="w-5 h-5 text-gray-500" />
                   </div>
                   <span className="text-[10px] text-gray-500">Layout</span>
                </div>
             </div>
             <div className="flex items-center gap-4 group">
                <div className="flex flex-col items-center gap-1">
                   <Type className="w-6 h-6 text-gray-600" />
                   <span className="text-[10px] text-gray-400">Font</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <div className="w-32 h-6 bg-gray-50 border border-gray-200 rounded text-[11px] px-2 flex items-center cursor-default">Inter</div>
                   <div className="w-16 h-6 bg-gray-50 border border-gray-200 rounded text-[11px] px-2 flex items-center cursor-default">24 pt</div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                 <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer"><ImageIcon className="w-5 h-5 text-gray-500" /></div>
                 <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer"><BarChart3 className="w-5 h-5 text-gray-500" /></div>
                 <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer"><Palette className="w-5 h-5 text-gray-500" /></div>
             </div>
          </div>
       </div>
  
       <div className="flex-1 flex overflow-hidden">
          {/* Thumbnails */}
          <div className="w-48 bg-[#eeeeee] border-r border-[#dadada] p-4 space-y-4 overflow-y-auto">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} onClick={() => setCurrentSlide(i)} className={`flex items-start gap-2 group cursor-pointer animate-in fade-in slide-in-from-left duration-300`}>
                  <span className="text-[10px] font-bold text-gray-400 mt-1">{i}</span>
                  <div className={`aspect-video w-full rounded border-2 ${i === currentSlide ? 'border-orange-500' : 'border-[#dadada]'} bg-white flex flex-col items-center justify-center shadow-sm relative overflow-hidden`}>
                     <div className="w-2/3 h-1 bg-gray-200 rounded mb-1" />
                     <div className="w-1/2 h-1 bg-gray-100 rounded" />
                     {i === currentSlide && <div className="absolute inset-0 bg-orange-50/20" />}
                  </div>
               </div>
             ))}
          </div>
  
          {/* Workspace */}
          <div className="flex-1 bg-[#d8d8d8] flex items-center justify-center p-12 overflow-hidden relative">
             <motion.div 
               key={currentSlide}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="aspect-video w-full max-w-4xl bg-white shadow-2xl relative p-12 flex flex-col items-center justify-center border"
             >
                <div className="w-full border-2 border-dashed border-gray-100 p-8 flex items-center justify-center group hover:border-orange-300 transition-colors cursor-pointer">
                   <input 
                      type="text"
                      spellCheck={false}
                      value={slides[currentSlide].title}
                      onChange={(e) => updateSlide('title', e.target.value)}
                      className="text-6xl font-bold text-gray-800 uppercase tracking-tighter text-center bg-transparent border-none outline-none w-full cursor-text"
                   />
                </div>
                <div className="w-2/3 border-2 border-dashed border-gray-100 p-6 mt-8 flex items-center justify-center group hover:border-orange-300 transition-colors cursor-pointer">
                   <input 
                      type="text"
                      spellCheck={false}
                      value={slides[currentSlide].subtitle}
                      onChange={(e) => updateSlide('subtitle', e.target.value)}
                      className="text-xl text-gray-400 uppercase tracking-widest text-center bg-transparent border-none outline-none w-full cursor-text"
                   />
                </div>
                <div className="absolute top-4 left-4 text-[10px] text-gray-300 font-mono italic whitespace-nowrap">Slide {currentSlide} of 5</div>
             </motion.div>
          </div>
       </div>
  
       {/* Slideshow Overlay */}
       {isSlideshow && (
         <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-20 cursor-none animate-in fade-in duration-500">
           <button 
             onClick={() => setIsSlideshow(false)} 
             className="absolute top-8 right-8 p-4 hover:bg-gray-100 rounded-full text-gray-300 hover:text-gray-600 transition-all z-10"
           >
             <X className="w-8 h-8" />
           </button>
           <motion.div 
             key={currentSlide}
             initial={{ opacity: 0, x: 100 }}
             animate={{ opacity: 1, x: 0 }}
             className="w-full max-w-6xl aspect-video flex flex-col items-center justify-center text-center"
           >
              <h1 className="text-[120px] font-bold text-gray-900 leading-none mb-4">{slides[currentSlide].title}</h1>
              <p className="text-4xl text-gray-400 tracking-[0.4em] uppercase">{slides[currentSlide].subtitle}</p>
           </motion.div>
           <div className="absolute bottom-12 flex gap-4">
              <button disabled={currentSlide === 1} onClick={() => setCurrentSlide(s => s - 1)} className="p-3 bg-gray-50 rounded-full disabled:opacity-30"><ChevronRight className="w-6 h-6 rotate-180" /></button>
              <button disabled={currentSlide === 5} onClick={() => setCurrentSlide(s => s + 1)} className="p-3 bg-gray-50 rounded-full disabled:opacity-30"><ChevronRight className="w-6 h-6" /></button>
           </div>
         </div>
       )}
  
       {/* Status Bar */}
       <div className="h-6 bg-[#f3f3f3] border-t border-[#dadada] flex items-center justify-between px-4 text-[10px] text-gray-500">
          <div className="flex items-center gap-4">
             <span>Slide {currentSlide} of 5</span>
             <span>English (United States)</span>
             <span>Accessibility: Investigate</span>
          </div>
          <div className="flex items-center gap-4">
             <span>Notes</span>
             <span>Comments</span>
             <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-[#888]" />
             </div>
             <span>85%</span>
          </div>
       </div>
       <CopyrightTrigger onSecretTrigger={onSecretTrigger} />
    </div>
  );
};

// 3. Word Template
export const WordTemplate = ({ onOpenTemplateSelector, onSecretTrigger }: TemplateProps) => {
  const [content, setContent] = useState('This document outlines the core architectural principles and implementation strategies for the upcoming enterprise resource planning system.');
  const [isSaving, setIsSaving] = useState(false);

  const simulateSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  const formatText = (cmd: string) => {
    document.execCommand(cmd, false);
  };

  return (
    <div className="w-full h-full bg-[#f9fbfd] flex flex-col font-sans overflow-hidden select-none">
       {/* Toolbar */}
       <div className="h-32 bg-white border-b border-[#dadada] flex flex-col shadow-sm">
          <div className="h-8 flex items-center px-6 gap-6 text-[12px] font-medium text-[#444]">
             <div className="text-blue-600 scale-75 -ml-2">
                <TopLeftTrigger onOpenTemplateSelector={onOpenTemplateSelector} onSecretTrigger={onSecretTrigger} />
             </div>
             <span className="text-blue-600 border-b-2 border-blue-600 pt-1 pb-1 cursor-pointer">File</span>
             <span className="cursor-pointer">Edit</span>
             <span className="cursor-pointer">View</span>
             <span className="cursor-pointer">Insert</span>
             <span className="cursor-pointer">Format</span>
             <span className="cursor-pointer">Tools</span>
             <span className="cursor-pointer">Extensions</span>
             <span className="cursor-pointer">Help</span>
          </div>
          <div className="flex-1 bg-[#f0f4f9] mx-6 my-2 rounded-full flex items-center px-4 gap-4">
             <div className="flex items-center gap-1 border-r border-gray-300 pr-4">
                <MousePointer2 className="w-4 h-4 text-gray-600 cursor-pointer" />
                <Share2 className="w-4 h-4 text-gray-600 cursor-pointer" />
                <Download className="w-4 h-4 text-gray-600 cursor-pointer" />
             </div>
             <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded text-sm min-w-[120px] justify-between cursor-pointer">
                <span>Normal Text</span>
                <ChevronRight className="w-3 h-3 rotate-90 opacity-50" />
             </div>
             <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded text-sm min-w-[150px] justify-between cursor-pointer">
                <span>Arial</span>
                <ChevronRight className="w-3 h-3 rotate-90 opacity-50" />
             </div>
             <div className="flex items-center gap-2 border-x border-gray-300 px-4">
                <button onClick={() => formatText('bold')} className="font-bold w-6 hover:bg-gray-200 rounded">B</button>
                <button onClick={() => formatText('italic')} className="italic w-6 font-serif hover:bg-gray-200 rounded">I</button>
                <button onClick={() => formatText('underline')} className="underline w-6 hover:bg-gray-200 rounded">U</button>
             </div>
             <div className="flex items-center gap-3">
                <Layout className="w-4 h-4 text-gray-600 cursor-pointer" />
                <BarChart3 className="w-4 h-4 text-gray-600 cursor-pointer" />
             </div>
             <div 
               onClick={simulateSave}
               className="ml-auto bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-2 hover:bg-blue-200 transition-colors cursor-pointer"
             >
                <Share2 className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Share'}
             </div>
          </div>
       </div>
  
       <div className="flex-1 bg-[#f9fbfd] flex items-center justify-center p-8 overflow-y-auto">
          <div className="w-[816px] min-h-[1056px] bg-white shadow-lg p-[96px] flex flex-col gap-6 text-[#222]">
             <h1 className="text-4xl font-bold mb-4 outline-none border-b-2 border-transparent focus:border-blue-100" contentEditable suppressContentEditableWarning={true} spellCheck={false}>Project Analysis Report</h1>
             <div 
               className="leading-relaxed outline-none focus:ring-2 focus:ring-blue-100 rounded p-2 transition-all" 
               contentEditable
               onBlur={(e) => setContent(e.currentTarget.textContent || '')}
               suppressContentEditableWarning={true}
               spellCheck={false}
             >
               {content}
             </div>
             <h2 className="text-2xl font-bold mt-4 border-b pb-1 outline-none" contentEditable suppressContentEditableWarning={true} spellCheck={false}>1. Strategic Objectives</h2>
             <p className="leading-relaxed outline-none p-2 focus:bg-blue-50/30 rounded" contentEditable suppressContentEditableWarning={true} spellCheck={false}>
               Our primary goals include the reduction of operational overhead by 15% through the automation of manual data reconciliation tasks and the improvement of cross-departmental transparency.
             </p>
             <ul className="list-disc pl-8 space-y-2 outline-none" contentEditable suppressContentEditableWarning={true} spellCheck={false}>
                <li>Integration with legacy POS systems</li>
                <li>Real-time synchronization across 24 regional hubs</li>
                <li>Encrypted data-at-rest using AES-256 standards</li>
             </ul>
             <div className="aspect-[2/1] w-full bg-gray-50 rounded border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group hover:border-blue-200 transition-all cursor-pointer">
                <BarChart3 className="w-12 h-12 text-gray-200 mb-2 group-hover:text-blue-300 transition-colors" />
                <span className="text-sm text-gray-400 font-medium font-mono uppercase tracking-widest">[ Metrics Visualizer ]</span>
                <span className="text-xs text-gray-300 mt-1">Double click to insert spreadsheet</span>
             </div>
          </div>
       </div>
  
       {/* Status Bar */}
       <div className="h-6 bg-white border-t border-[#dadada] flex items-center justify-between px-6 text-[11px] text-gray-400 font-medium whitespace-nowrap">
          <div className="flex items-center gap-6">
             <span>Page 1 of 3</span>
             <span>{Math.floor(content.length / 5)} words</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 group cursor-pointer hover:text-gray-600">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isSaving ? 'text-blue-400 animate-pulse' : 'text-green-500'}`} />
                {isSaving ? 'Saving to cloud...' : 'Document saved locally'}
             </div>
             <div className="h-4 w-[1px] bg-gray-200" />
             <Maximize className="w-3.5 h-3.5 cursor-pointer" />
          </div>
       </div>
       <CopyrightTrigger onSecretTrigger={onSecretTrigger} />
    </div>
  );
};

// 4. Drawing Template
export const DrawingTemplate = ({ onOpenTemplateSelector, onSecretTrigger }: TemplateProps) => {
  const [shapes, setShapes] = useState([
     { id: 1, x: 200, y: 150, color: 'bg-indigo-600', text: 'HERO MODULE', width: 200, height: 100 },
     { id: 2, x: 50, y: 50, color: 'bg-emerald-500', text: 'LOGOMARK', width: 80, height: 80 }
  ]);

  const [showProjection, setShowProjection] = useState(false);

  const addShape = () => {
    setShapes(prev => [...prev, {
      id: Date.now(),
      x: 100,
      y: 100,
      color: 'bg-orange-500',
      text: 'NEW ELEMENT',
      width: 120,
      height: 60
    }]);
  };

  return (
    <div className="w-full h-full bg-[#2c2c2c] flex flex-col font-sans overflow-hidden select-none text-[#cccccc]">
       {/* App Bar */}
       <div className="h-12 bg-[#1e1e1e] border-b border-[#000000] flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
             <div className="text-[#f24e1e] scale-75 -ml-2">
                <TopLeftTrigger onOpenTemplateSelector={onOpenTemplateSelector} onSecretTrigger={onSecretTrigger} />
             </div>
             <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-white bg-[#3e3e3e] px-2 py-1 rounded">Drafts / Project_Visuals_v2</span>
                <span>100%</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#1e1e1e]" />
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#1e1e1e]" />
                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-[#1e1e1e] flex items-center justify-center text-[8px] font-bold">+2</div>
             </div>
             <button onClick={() => setShowProjection(true)} className="bg-[#18a0fb] text-white px-3 py-1 rounded text-xs font-bold shadow-sm">Play</button>
             <button className="bg-[#3e3e3e] text-white px-3 py-1 rounded text-xs font-bold shadow-sm border border-[#505050]">Share</button>
          </div>
       </div>
  
       {/* Tools */}
       <div className="h-10 bg-[#1e1e1e] border-b border-[#000000] flex items-center px-4 gap-2">
          <div className="p-2 bg-[#18a0fb] text-white rounded cursor-pointer"><MousePointer2 className="w-4 h-4" /></div>
          <div onClick={addShape} className="p-2 hover:bg-[#3e3e3e] rounded transition-colors cursor-pointer text-white/60 hover:text-white"><Layout className="w-4 h-4" /></div>
          <div className="p-2 hover:bg-[#3e3e3e] rounded transition-colors cursor-pointer text-white/60 hover:text-white"><Layers className="w-4 h-4" /></div>
          <div className="p-2 hover:bg-[#3e3e3e] rounded transition-colors cursor-pointer text-white/60 hover:text-white"><Type className="w-4 h-4" /></div>
          <div className="p-2 hover:bg-[#3e3e3e] rounded transition-colors cursor-pointer text-white/60 hover:text-white"><PenTool className="w-4 h-4" /></div>
       </div>
  
       <div className="flex-1 flex overflow-hidden">
          {/* Layers & Pages */}
          <div className="w-60 bg-[#1e1e1e] border-r border-[#000000] flex flex-col shrink-0">
             <div className="h-10 flex items-center px-4 border-b border-[#000000] justify-between group">
                <span className="text-[11px] font-bold uppercase tracking-widest">Layers</span>
                <ChevronRight className="w-3 h-3 rotate-90" />
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {['Background_Mesh', 'Hero_Section', 'Header_Nav', 'Illustration_Group', 'Text_Block_01', 'CTA_Button'].map((layer, i) => (
                  <div key={layer} className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-pointer text-xs ${i === 2 ? 'bg-[#18a0fb]/10 text-[#18a0fb]' : 'hover:bg-[#3e3e3e]'}`}>
                     <Layers className={`w-3.5 h-3.5 ${i === 2 ? 'text-[#18a0fb]' : 'opacity-40'}`} />
                     <span>{layer}</span>
                  </div>
                ))}
             </div>
          </div>
  
          {/* Canvas */}
          <div className="flex-1 bg-[#1e1e1e] p-20 overflow-hidden relative flex items-center justify-center cursor-crosshair">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
             
             <div className="w-full h-full border border-black/50 bg-[#1e1e1e] shadow-2xl relative flex items-center justify-center">
                <div className="w-[80%] aspect-video bg-white overflow-hidden relative shadow-inner">
                   {/* Draggable items simulator */}
                   {shapes.map(s => (
                      <motion.div 
                        key={s.id} 
                        drag 
                        dragMomentum={false}
                        className={`absolute p-4 rounded-xl shadow-lg border cursor-move z-10 ${s.color}`}
                        style={{ left: s.x, top: s.y }}
                      >
                         <div className="text-xs font-bold text-gray-800">{s.text}</div>
                      </motion.div>
                   ))}
  
                   <div className="absolute top-0 w-full h-16 bg-gray-50 border-b flex items-center px-8 justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-full bg-indigo-600" />
                         <div className="space-y-1">
                            <div className="w-32 h-2 bg-gray-200 rounded" />
                            <div className="w-20 h-1.5 bg-gray-100 rounded" />
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="w-12 h-4 bg-gray-100 rounded" />
                         <div className="w-12 h-4 bg-gray-100 rounded" />
                      </div>
                   </div>
                   <div className="mt-40 px-20">
                      <div className="text-4xl font-bold text-gray-800 tracking-tighter mb-4">Designing the Future <br/> of Interface Logic.</div>
                      <div className="w-2/3 h-4 bg-gray-100 rounded mb-8" />
                      <div className="flex gap-4">
                         <div className="w-32 h-10 bg-indigo-600 rounded shadow-lg" />
                         <div className="w-32 h-10 border-2 border-indigo-100 rounded" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
  
          {/* Inspect/Styles */}
          <div className="w-60 bg-[#1e1e1e] border-l border-[#000000] flex flex-col shrink-0">
             <div className="h-10 flex items-center px-4 border-b border-[#000000] gap-4">
                <span className="text-[11px] font-bold border-b-2 border-white pb-3 pt-3">Design</span>
                <span className="text-[11px] font-bold opacity-30">Prototype</span>
                <span className="text-[11px] font-bold opacity-30">Inspect</span>
             </div>
             <div className="p-4 space-y-6">
                <div className="space-y-3">
                   <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Layout</span>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#3e3e3e] p-2 rounded text-[10px]">X: 1240</div>
                      <div className="bg-[#3e3e3e] p-2 rounded text-[10px]">Y: 650</div>
                      <div className="bg-[#3e3e3e] p-2 rounded text-[10px]">W: 1440</div>
                      <div className="bg-[#3e3e3e] p-2 rounded text-[10px]">H: 900</div>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Fill</span>
                      <ArrowUpRight className="w-3 h-3 opacity-40" />
                   </div>
                   <div className="flex items-center gap-3 bg-[#3e3e3e] p-2 rounded group cursor-pointer hover:bg-[#4a4a4a]">
                      <div className="w-5 h-5 rounded bg-white" />
                      <span className="text-[10px] font-mono">#FFFFFF</span>
                      <span className="ml-auto text-[10px] opacity-40">100%</span>
                   </div>
                </div>
                <div className="space-y-3 pt-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Effects</span>
                   <div className="flex items-center gap-2 text-[10px] opacity-40">
                      <Grid3X3 className="w-3 h-3" />
                      <span>Drop Shadow</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
  
       <CopyrightTrigger onSecretTrigger={onSecretTrigger} />
       {showProjection && <ProjectionOverlay onClose={() => setShowProjection(false)} shapes={shapes} />}
    </div>
  );
};

export const ProjectionOverlay = ({ onClose, shapes }: { onClose: () => void, shapes: any[] }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in zoom-in duration-300">
       <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white p-2">
         <X className="w-8 h-8" />
       </button>
       <div className="flex-1 flex items-center justify-center">
          <div className="w-[90%] aspect-video bg-white shadow-2xl relative overflow-hidden">
             {shapes.map(s => (
               <div key={s.id} className={`absolute p-4 rounded-xl shadow-lg border ${s.color}`} style={{ left: s.x, top: s.y }}>
                  <div className="text-xs font-bold text-gray-800">{s.text}</div>
               </div>
             ))}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 rounded-full border-4 border-indigo-600 animate-ping opacity-20" />
             </div>
          </div>
       </div>
       <div className="h-16 bg-white/5 border-t border-white/10 flex items-center px-12 justify-between">
          <div className="text-white/40 text-xs font-mono">PROTOTYPE MODE: Active</div>
          <div className="flex gap-4">
             <div className="w-10 h-1 bg-white/20 rounded" />
             <div className="w-10 h-1 bg-white/20 rounded" />
             <div className="w-10 h-1 bg-white/10 rounded" />
          </div>
       </div>
    </div>
  );
};

// 5. Study Website Template
export const StudyTemplate = ({ onOpenTemplateSelector, onSecretTrigger }: TemplateProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLesson, setActiveLesson] = useState(2);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmitQuiz = () => {
    if (quizAnswer === 1) { // B is correct
      setQuizFeedback({ type: 'success', message: 'Correct! You have mastered the Cook-Levin complexity reduction logic.' });
      setTimeout(() => {
        setShowQuiz(false);
        setQuizFeedback(null);
        setQuizAnswer(null);
      }, 3000);
    } else {
      setQuizFeedback({ type: 'error', message: 'Incorrect. Hint: Review the definition of "reduction" between NP problems.' });
    }
  };

  const lessons = [
    { title: 'Intro to P vs NP', done: true },
    { title: 'Polynomial Reductions', done: true },
    { title: 'Cook-Levin Theorem', done: false },
    { title: '3-SAT Problem Analysis', done: false },
    { title: 'Hamiltonian Paths', done: false },
  ];

  return (
    <div className="w-full h-full bg-[#f6f8fa] flex flex-col font-sans overflow-hidden select-none">
       <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-10">
             <div className="flex items-center gap-2">
                <TopLeftTrigger onOpenTemplateSelector={onOpenTemplateSelector} onSecretTrigger={onSecretTrigger} />
                <span className="text-xl font-bold tracking-tight text-gray-800">EduSystem LXP</span>
             </div>
             <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
                <span className="text-green-600 cursor-pointer">Catalog</span>
                <span className="cursor-pointer">Assessments</span>
                <span className="cursor-pointer">Notebook</span>
             </nav>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-10 w-64 bg-gray-50 rounded-lg flex items-center px-4 gap-2 border border-gray-200 focus-within:bg-white focus-within:border-green-400 transition-all">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Find topic..." 
                  className="bg-transparent border-none outline-none text-sm text-gray-600 w-full"
                />
             </div>
             <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shadow-lg shadow-green-200">JD</div>
          </div>
       </header>
  
       <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto py-12 px-8">
             <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-widest mb-4">
                <span>Advanced CS</span>
                <ChevronRight className="w-3 h-3" />
                <span>Algorithms</span>
             </div>
             <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Complexity Theory & Dynamic Optimization</h1>
             
             <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-10">
                   <div 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="aspect-video w-full bg-slate-900 rounded-3xl flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-2xl border border-white/5"
                   >
                      {!isPlaying ? (
                        <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
                           <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center ring-4 ring-white/20 group-hover:ring-white/40 group-hover:scale-110 transition-all">
                              <PlayCircle className="w-12 h-12 text-white" />
                           </div>
                           <span className="text-white/60 font-medium tracking-widest text-xs uppercase">Resume Lesson 3</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                           <div className="w-2/3 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                              <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 120, repeat: Infinity }} className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                           </div>
                           <span className="text-white text-xs font-mono tracking-widest opacity-60">STREAMING CONTENT...</span>
                        </div>
                      )}
                      
                      <div className="absolute bottom-6 left-8 flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 ring-2 ring-white/20 shadow-xl" />
                         <div className="flex flex-col">
                            <span className="text-white font-bold text-lg">Dr. Elena Kostic</span>
                            <span className="text-white/50 text-xs font-medium">Head of Theoretical Logic</span>
                         </div>
                      </div>
                   </div>
  
                   <div className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-green-500 pl-4">Conceptual Overview</h2>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        Today we analyze the relationship between complexity classes <strong>P</strong> and <strong>NP</strong>. Is every problem whose solution can be verified quickly also solvable quickly? We investigate the <em>Cook-Levin Theorem</em> to prove that satisfiability is NP-complete.
                      </p>
                      <div className="flex gap-4 pt-4">
                         <button 
                           onClick={() => setShowQuiz(true)}
                           className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                         >
                            Attempt Module Quiz
                         </button>
                         <button className="bg-slate-50 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Lesson Deck (PDF)
                         </button>
                      </div>
                   </div>
                </div>
  
                <div className="col-span-4 space-y-6">
                   <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="font-extrabold text-gray-800 text-sm italic uppercase tracking-wider">Module Milestone</h3>
                         <span className="text-green-600 font-black">65%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" />
                      </div>
                      <div className="space-y-3">
                         {lessons.map((item, i) => (
                           <div 
                             key={i} 
                             onClick={() => setActiveLesson(i)} 
                             className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${i === activeLesson ? 'bg-green-50 border-green-200 ring-2 ring-green-100' : 'border-transparent hover:bg-gray-50'}`}
                           >
                              {item.done ? (
                                <div className="bg-green-100 p-1.5 rounded-lg"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
                              ) : (
                                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center font-mono text-[10px] font-bold ${i === activeLesson ? 'border-green-600 bg-white text-green-600 animate-pulse' : 'border-gray-200 text-gray-400'}`}>0{i+1}</div>
                              )}
                              <span className={`text-sm font-semibold truncate ${i === activeLesson ? 'text-green-900' : item.done ? 'text-gray-400 underline decoration-gray-200' : 'text-gray-700'}`}>{item.title}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Quiz Modal */}
       {showQuiz && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 overflow-hidden relative">
              <button 
                onClick={() => setShowQuiz(false)}
                className="absolute top-6 right-6 p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
              <h4 className="text-xs font-black text-green-600 uppercase tracking-[0.2em] mb-4 text-center">In-Lecture Verification</h4>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-8 leading-tight">If a problem is NP-Complete, which of the following is true?</h3>
              <div className="space-y-3">
                 {[
                   'It can be solved in polynomial time by a deterministic TM.',
                   'It is in NP and every other problem in NP reduces to it.',
                   'It cannot be verified in polynomial time.',
                   'It requires exponential memory space regardless of time.'
                 ].map((opt, i) => (
                   <button 
                     key={i}
                     onClick={() => setQuizAnswer(i)}
                     className={`w-full text-left p-6 rounded-2xl border-2 transition-all group ${quizAnswer === i ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200 hover:bg-green-50/10'}`}
                   >
                     <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center font-bold text-xs ${quizAnswer === i ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200 text-gray-300 group-hover:border-green-300'}`}>
                           {String.fromCharCode(65 + i)}
                        </div>
                        <span className={`text-sm font-medium leading-normal ${quizAnswer === i ? 'text-green-900' : 'text-gray-600'}`}>{opt}</span>
                     </div>
                   </button>
                 ))}
              </div>
              <button 
                disabled={quizAnswer === null || quizFeedback?.type === 'success'}
                onClick={handleSubmitQuiz}
                className="w-full mt-8 bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {quizFeedback?.type === 'success' ? 'Verified!' : 'Submit Answer'}
              </button>
              {quizFeedback && (
                <div className={`mt-4 p-4 rounded-xl text-center text-sm font-bold animate-in slide-in-from-top-2 duration-300 ${quizFeedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {quizFeedback.message}
                </div>
              )}
           </motion.div>
         </div>
       )}
       <CopyrightTrigger onSecretTrigger={onSecretTrigger} />
    </div>
  );
};
