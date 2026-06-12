import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Calendar, 
  Library, 
  LayoutDashboard, 
  CheckCircle2, 
  MoreHorizontal,
  PlayCircle,
  Globe,
  HelpCircle,
  X,
  Calculator as CalcIcon,
  Table as TableIcon,
  PenTool,
  Timer,
  Scale,
  BookTemplate,
  Settings,
  Search,
  MessageSquare,
  ListTodo
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  MiniSpreadsheet, 
  Scratchpad, 
  StudyTimer, 
  Flashcard, 
  QuizModule, 
  UnitConverter, 
  FormulaSheet,
  TodoList,
  Dictionary,
  WrongQuestionBox
} from './StudyTools';
import SettingsModal from './SettingsModal';
import ExamQuestions from './ExamQuestions';
import { useSettings } from '../SettingsContext';

const KNOWLEDGE_POINTS = [
  "微积分基本定理：F(b) - F(a) = ∫[a,b] f(x)dx",
  "《离骚》是中国文学史上第一部长篇抒情诗。",
  "牛顿第二定律：F = ma",
  "能量守恒定律：在一个封闭系统中，能量的总量保持不变。",
  "语义上的歧义性往往是导致翻译偏差的核心原因。",
  "勾股定理：a² + b² = c²",
];

interface StudyModeProps {
  onSecretTrigger: (pos?: { x: number, y: number }) => void;
  onSecretClose: () => void;
  isTvOpen: boolean;
}

export default function StudyMode({ onSecretTrigger, onSecretClose, isTvOpen }: StudyModeProps) {
  const { settings } = useSettings();
  const [clickCount, setClickCount] = useState(0);
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const [activeTab, setActiveTab] = useState('platform');
  const [showTips, setShowTips] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [studyProgress, setStudyProgress] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(1250);
  const [knowledgePoint, setKnowledgePoint] = useState<string | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });

  // Online users fluctuation
  useEffect(() => {
     const int = setInterval(() => {
        setOnlineUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5));
     }, 3000);
     return () => clearInterval(int);
  }, []);

  // Tab visibility
  useEffect(() => {
     const handlePanic = () => {
        if (isTvOpen && settings.panicOnBlur) {
           // Only panic if the tab is actually hidden (visibilitychange)
           // Blur is too sensitive (triggers on iframe clicks, browser clicks, etc.)
           if (document.hidden) {
              onSecretClose();
              setClickCount(0);
           }
        }
     };
     const handleVisibility = () => {
        if (document.hidden) handlePanic();
     };
     document.addEventListener('visibilitychange', handleVisibility);
     // Removed window.blur event listener as it's too aggressive
     return () => {
        document.removeEventListener('visibilitychange', handleVisibility);
     };
  }, [settings.panicOnBlur, isTvOpen, onSecretClose]);

  // Resize detection
  useEffect(() => {
     const handleResize = () => {
        const isTooSmall = window.innerWidth < 200 || window.innerHeight < 200;
        if ((settings.panicOnResize || isTooSmall) && isTvOpen) {
           onSecretClose();
           setClickCount(0);
        }
     };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, [settings.panicOnResize, isTvOpen, onSecretClose]);

  // Knowledge popup
  useEffect(() => {
     if (!settings.showKnowledgePopups) return;
     const int = setInterval(() => {
        const point = KNOWLEDGE_POINTS[Math.floor(Math.random() * KNOWLEDGE_POINTS.length)];
        setKnowledgePoint(point);
        setTimeout(() => setKnowledgePoint(null), 5000);
     }, settings.knowledgeInterval * 60000);
     return () => clearInterval(int);
  }, [settings.showKnowledgePopups, settings.knowledgeInterval]);

  // Auto moving progress bar
  useEffect(() => {
    const int = setInterval(() => {
      setStudyProgress(p => p >= 100 ? 100 : p + 0.1);
    }, 5000);
    return () => clearInterval(int);
  }, []);

  // Keyboard trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isActivationKey = e.ctrlKey && e.key.toLowerCase() === 'k';
      const isMacActivationKey = e.metaKey && e.key.toLowerCase() === 'k';
      
      if (settings.tvTriggerMethod === 'keyboard' && (isActivationKey || isMacActivationKey)) {
        e.preventDefault();
        onSecretTrigger({ x: lastMousePos.current.x, y: lastMousePos.current.y });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.tvTriggerMethod, onSecretTrigger]);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const startLongPress = (e?: React.MouseEvent | React.TouchEvent, isSettings = false) => {
    if (isSettings) {
       longPressTimer.current = setTimeout(() => {
          setShowSettings(true);
       }, 5000);
       return;
    }
    
    let pos: {x: number, y: number} | undefined;
    if (e) {
      if ('clientX' in e) {
        pos = { x: e.clientX, y: e.clientY };
      } else if ('touches' in e && e.touches.length > 0) {
        pos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }

    // Logo long press always works as a master secret if not explicitly longpress method
    // But if method IS longpress, it works faster
    const delay = settings.tvTriggerMethod === 'longpress' ? 1000 : 3000;
    
    longPressTimer.current = setTimeout(() => {
      onSecretTrigger(pos);
    }, delay); 
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const onSelectionChange = () => {
     if (settings.tvTriggerMethod !== 'selection') return;
     const selectedText = window.getSelection()?.toString();
     if (selectedText && selectedText.includes(settings.tvTriggerText)) {
        if (clickCount >= settings.tvTriggerCount - 1) {
           setClickCount(0);
           onSecretTrigger({ x: lastMousePos.current.x, y: lastMousePos.current.y });
        } else {
           setClickCount(prev => prev + 1);
        }
     }
  };

  // Auto reading scroller
  useEffect(() => {
    let scrollInt: NodeJS.Timeout;
    if (activeTab === 'platform') {
      scrollInt = setInterval(() => {
        if (readingRef.current) {
           readingRef.current.scrollTop += 0.5;
        }
      }, 100);
    }
    return () => clearInterval(scrollInt);
  }, [activeTab]);

  const handleSecretClick = (e: React.MouseEvent) => {
     if (settings.tvTriggerMethod !== 'click') return;
     setClickCount(prev => prev + 1);
     if (clickCount >= settings.tvTriggerCount - 1) {
        setClickCount(0);
        onSecretTrigger({ x: e.clientX, y: e.clientY });
     }
  };

  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
     if (settings.tvTriggerMethod === 'header') {
        onSecretTrigger({ x: e.clientX, y: e.clientY });
     }
  };

  const navItems = [
    { id: 'platform', icon: LayoutDashboard, label: lang === 'en' ? 'Study Dashboard' : '学习主页' },
    { id: 'math', icon: CalcIcon, label: lang === 'en' ? 'Mathematics' : '数学分析' },
    { id: 'physics', icon: Globe, label: lang === 'en' ? 'Physics' : '理论物理' },
    { id: 'literature', icon: BookOpen, label: lang === 'en' ? 'Literature' : '人文素养' },
    { id: 'resources', icon: Library, label: lang === 'en' ? 'Library' : '资料库' }
  ];

  const themes: Record<string, { bg: string, text: string, sidebarBg: string, border: string }> = {
    light: { bg: 'bg-[#f3f5f7]', text: 'text-[#1f2937]', sidebarBg: 'bg-white', border: 'border-[#e5e7eb]' },
    dark: { bg: 'bg-gray-900', text: 'text-gray-100', sidebarBg: 'bg-gray-800', border: 'border-gray-700' },
    sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#5b4636]', sidebarBg: 'bg-[#faf6eb]', border: 'border-[#e8dcc4]' },
    rose: { bg: 'bg-[#fff0f3]', text: 'text-[#590d22]', sidebarBg: 'bg-[#fff]', border: 'border-[#ffccd5]' },
    ocean: { bg: 'bg-[#f0f8ff]', text: 'text-[#003049]', sidebarBg: 'bg-[#fff]', border: 'border-[#bee1e6]' },
  };

  const currentTheme = themes[settings.studyTheme] || themes.light;

  return (
    <div 
      className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} flex font-sans selection:bg-indigo-200 transition-colors`}
      style={{ fontSize: `${settings.fontSize}%` }}
    >
      
      {/* Sidebar */}
      <aside className={`w-64 ${currentTheme.sidebarBg} border-r ${currentTheme.border} flex flex-col shrink-0 transition-colors`}>
        <div 
          onMouseDown={(e) => startLongPress(e)}
          onMouseUp={endLongPress}
          onMouseLeave={endLongPress}
          onDoubleClick={(e) => handleHeaderDoubleClick(e)}
          onTouchStart={(e) => startLongPress(e)}
          onTouchEnd={endLongPress}
          className={`h-16 flex items-center px-6 border-b ${currentTheme.border} transition-colors cursor-pointer select-none`}
        >
          <div className="flex items-center gap-2 text-indigo-700">
            <GraduationCap className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">EduSystem</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}

          <div className="pt-4 pb-2">
             <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'en' ? 'Study Suite' : '学习套件'}</span>
          </div>
          <div className="space-y-4 px-1">
             <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold text-gray-500"><ListTodo className="w-3 h-3" /> {lang === 'en' ? 'Tasks' : '待办事项'}</div>
                <TodoList />
             </div>
             <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold text-gray-500"><Search className="w-3 h-3" /> {lang === 'en' ? 'Dictionary' : '英汉查词'}</div>
                <Dictionary />
             </div>
             <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold text-gray-500"><MessageSquare className="w-3 h-3" /> {lang === 'en' ? 'Wrong Box' : '错题记录'}</div>
                <WrongQuestionBox />
             </div>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          {settings.showOnlineCount && (
             <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100 animate-pulse">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                   {onlineUsers} {lang === 'en' ? 'Studying Online' : '人正在学习'}
                </span>
             </div>
          )}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daily Goal</span>
                <span className="text-xs font-bold text-indigo-600">{Math.floor(studyProgress)}%</span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${studyProgress}%` }}></div>
             </div>
          </div>
          <button 
             onClick={(e) => handleSecretClick(e)}
             onMouseDown={() => startLongPress(undefined, true)}
             onMouseUp={endLongPress}
             onMouseLeave={endLongPress}
             className="w-full flex items-center gap-2 text-[10px] text-gray-400 hover:text-gray-600 transition-colors justify-center font-mono opacity-50 relative z-10 py-2"
             title="System Version Info (Long press for config)"
          >
             <span>Ver 2.1.0 © 2026 EduSystem</span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col h-screen overflow-hidden ${currentTheme.bg} transition-colors`}>
         <header 
            onDoubleClick={(e) => handleHeaderDoubleClick(e)}
            className={`h-16 ${currentTheme.sidebarBg} border-b ${currentTheme.border} flex items-center justify-between px-4 sm:px-8 shrink-0 transition-colors select-none`}
         >
            <div className="flex items-center gap-4">
               <h1 className={`font-bold ${currentTheme.text === 'text-gray-100' ? 'text-gray-100' : 'text-gray-800'} text-lg`}>
                 {lang === 'en' ? 'Learning Management System' : '在线学术资源共享与学习协作平台'}
               </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
               <button 
                  onClick={() => setShowTips(true)} 
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center justify-center relative"
                  title={lang === 'en' ? 'Shortcuts Tips' : '操作指南'}
               >
                  <HelpCircle className="w-5 h-5" />
               </button>
               <button 
                  onClick={() => setShowSettings(true)} 
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center justify-center relative"
                  title={lang === 'en' ? 'Settings' : '设置'}
               >
                  <Settings className="w-5 h-5" />
               </button>
               <button 
                 onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
                 className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors font-medium text-sm border border-transparent hover:border-gray-200 px-3"
               >
                 {lang === 'en' ? 'ZH' : 'EN'}
               </button>
               <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold overflow-hidden shadow-inner font-mono text-sm">
                 US
               </div>
            </div>
         </header>

         <div 
            className="flex-1 overflow-y-auto p-4 sm:p-8"
            onMouseUp={onSelectionChange}
         >
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
               
               {/* Center Column: Study Material & Content */}
               <div className="xl:col-span-8 space-y-6">
                 
                 {activeTab === 'platform' ? (
                   <>
                     {/* Current Reading Material with auto-scroll */}
                     <div className={`${currentTheme.sidebarBg} border ${currentTheme.border} shadow-sm rounded-2xl flex flex-col h-[500px] overflow-hidden transition-colors`}>
                        <div className={`px-6 py-4 border-b ${currentTheme.border} flex justify-between items-center ${currentTheme.sidebarBg} shrink-0 transition-colors`}>
                           <h3 className={`font-bold ${currentTheme.text === 'text-gray-100' ? 'text-gray-100' : 'text-gray-800'} text-lg flex items-center gap-2`}>
                             <BookOpen className="w-5 h-5 text-indigo-600" />
                             {lang === 'en' ? 'Chapter 4: Advanced Principles' : '第四章：高级数理推导原理'}
                           </h3>
                           <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest border border-gray-200">
                             Reading
                           </div>
                        </div>
                        <div ref={readingRef} className={`p-8 overflow-y-auto ${currentTheme.text} leading-relaxed space-y-6 text-[15px] scroll-smooth`}>
                           <p className="first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-indigo-600">
                             {lang === 'en' ? 
                             "The fundamental theorem of calculus is a theorem that links the concept of differentiating a function with the concept of integrating a function. The first part of the theorem, sometimes called the first fundamental theorem of calculus, states that one of the antiderivatives (also known as indefinite integral) of a function f is obtained as the integral of f with a variable bound of integration." : 
                             "微积分基本定理（Fundamental Theorem of Calculus），有时亦称为微积分第一基本定理，是联系积分学与微分学这两个原本互相独立概念的核心定理。这一定理精确地描述了积分和微分的互逆关系。在学习这部分内容时，务必注意定积分的几何意义与导数的物理意义之间的内在契合。"
                             }
                           </p>
                           <p className="selection:bg-yellow-200 selection:text-black">
                             {lang === 'en' ? 
                             "Try selecting this text to simulate taking a highlight note. The system allows you to easily mark important passages for later review. Notice the subtle background color applied to your selection." : 
                             "尝试用鼠标拖拽选中这段文本，以模拟阅读中的「记笔记划重点」操作。良好的阅读系统应当让用户可以轻松标记核心论点。选中文本时，将自动呈现出如同记号笔一般的黄色高亮效果。"
                             }
                           </p>
                           <div className={`border-l-4 border-indigo-500 p-4 rounded-r my-6 text-sm shadow-sm ${currentTheme.text === 'text-gray-100' ? 'bg-indigo-900/30 text-indigo-200' : 'bg-indigo-50 text-indigo-900'}`}>
                             <strong>{lang === 'en' ? "Important Definition:" : "核心定义："}</strong> 
                             {lang === 'en' ? " For every continuously differentiable function, there exists a unique..." : " 对于每一个在特定区间内连续可导的函数而言，始终存在一个唯一的..."}
                           </div>
                           <p>
                             在深入探究上述定理时，我们还需要结合实际高考题型来分析其出题思路。无论是选填题还是解答题，对微积分基本原理的考查都往往与函数的极值、最值、单调区间等综合性质相结合。因此，考生在复习时不仅要掌握公式本身的推导，熟练运用各类求导法则和积分技巧更是不可或缺的基本功。
                           </p>
                           <div className={`h-64 flex items-center justify-center border-2 border-dashed ${currentTheme.border} rounded-xl font-mono text-sm ${currentTheme.text === 'text-gray-100' ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>
                              [ Figure 4.1: Mathematical Graph Area ]
                           </div>
                        </div>
                     </div>
    
                     {/* Interactive Quiz */}
                     <QuizModule />
                   </>
                 ) : (
                   <ExamQuestions subject={activeTab} lang={lang} currentTheme={currentTheme} />
                 )}
               </div>

               {/* Right Sidebar */}
               <div className="xl:col-span-4 space-y-6 pb-20">
                  <StudyTimer />
                  <Flashcard />

                  <div className={`${currentTheme.sidebarBg} p-5 rounded-2xl border ${currentTheme.border} shadow-sm transition-colors`}>
                     <h4 className={`font-bold ${currentTheme.text === 'text-gray-100' ? 'text-gray-200' : 'text-gray-800'} text-sm mb-3 flex items-center gap-2 uppercase tracking-wide`}><BookTemplate className="w-4 h-4 text-rose-500" /> Formulas</h4>
                     <FormulaSheet onSecretTrigger={settings.tvTriggerMethod === 'formula' ? onSecretTrigger : undefined} />
                  </div>

                  <div className={`${currentTheme.sidebarBg} p-5 rounded-2xl border ${currentTheme.border} shadow-sm transition-colors`}>
                     <h4 className={`font-bold ${currentTheme.text === 'text-gray-100' ? 'text-gray-200' : 'text-gray-800'} text-sm mb-3 flex items-center gap-2 uppercase tracking-wide`}><Scale className="w-4 h-4 text-amber-500" /> Conversions</h4>
                     <UnitConverter />
                  </div>

                  <div className={`${currentTheme.sidebarBg} p-5 rounded-2xl border ${currentTheme.border} shadow-sm transition-colors`}>
                     <h4 className={`font-bold ${currentTheme.text === 'text-gray-100' ? 'text-gray-200' : 'text-gray-800'} text-sm mb-3 flex items-center gap-2 uppercase tracking-wide`}><TableIcon className="w-4 h-4 text-emerald-500" /> Data Lab</h4>
                     <MiniSpreadsheet />
                  </div>
               </div>

               {/* Full Width Footer Section */}
               <div className="xl:col-span-12 space-y-8 pb-10">
                  <div className={`${currentTheme.sidebarBg} p-5 rounded-2xl border ${currentTheme.border} shadow-sm transition-colors`}>
                     <h4 className={`font-bold ${currentTheme.text === 'text-gray-100' ? 'text-gray-200' : 'text-gray-800'} text-sm mb-3 flex items-center gap-2 uppercase tracking-wide`}><PenTool className="w-4 h-4 text-purple-500" /> Draft Paper</h4>
                     <Scratchpad />
                  </div>

                  <div className={`${currentTheme.sidebarBg} p-5 rounded-2xl border ${currentTheme.border} shadow-sm transition-colors`}>
                     <h4 className={`font-bold ${currentTheme.text === 'text-gray-100' ? 'text-gray-200' : 'text-gray-800'} text-sm mb-3 flex items-center gap-2 uppercase tracking-wide`}><CalcIcon className="w-4 h-4 text-blue-500" /> Advanced Scientific Calculator</h4>
                     <Calculator 
                       onSecretTrigger={settings.tvTriggerMethod === 'calculator' ? onSecretTrigger : undefined} 
                       secretCode={settings.tvTriggerCode} 
                     />
                  </div>
               </div>
            </div>
         </div>
      </main>

      {/* Knowledge Popup */}
      <AnimatePresence>
         {knowledgePoint && (
            <motion.div
               initial={{ x: 300, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: 300, opacity: 0 }}
               className="fixed bottom-6 right-6 z-[100] max-w-xs bg-white/90 backdrop-blur border-l-4 border-indigo-600 shadow-xl p-4 rounded-xl"
            >
               <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                     <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">系统推送：每日知识点</p>
                     <p className="text-xs text-gray-800 font-medium leading-relaxed">{knowledgePoint}</p>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showTips && (
          <motion.div 
            initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" 
             onClick={() => setShowTips(false)}
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" 
               onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                     <HelpCircle className="w-6 h-6 text-indigo-600" />
                     {lang === 'en' ? 'Keyboard Shortcuts' : '按键操作贴士'}
                  </h3>
                  <button onClick={() => setShowTips(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
                     <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded w-fit">{lang === 'en' ? 'Activation' : '激活电视'}</span>
                     <span className="text-gray-600 font-medium">{lang === 'en' ? 'Methods: Click version 5x, Calc code, Ctrl+K, Selection, Long press logo' : '方式：连续点版本号、计算器密码、Ctrl+K、选中文段、长按Logo'}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
                     <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded w-fit">Esc / ` (Backquote)</span>
                     <span className="text-gray-600 font-medium">{lang === 'en' ? 'Panic Screen (Blackout & exit)' : '极速息屏（整个电脑界面变黑并退出电视）- 再按解除'}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
                     <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit">Backspace / Delete / Triple Click</span>
                     <span className="text-gray-600 font-medium">{lang === 'en' ? 'Exit TV Mode / Hide border' : '常规退出电视 / 三击边框快速隐藏'}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
                     <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit">[ / ] (Square Brackets)</span>
                     <span className="text-gray-600 font-medium">{lang === 'en' ? 'Zoom TV window scale' : '整体缩放电视窗口尺寸 (配合停靠边缘)'}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
                     <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit">+ / - (Plus/Minus)</span>
                     <span className="text-gray-600 font-medium">{lang === 'en' ? 'Zoom internal content' : '缩放电视内部页面比例'}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
                     <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit">M / B</span>
                     <span className="text-gray-600 font-medium">{lang === 'en' ? 'Mute / Darken screen' : '一键静音 / 一键断电(黑屏伪装)'}</span>
                  </div>
                  <div className="flex flex-col gap-1 pb-1">
                     <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded w-fit">{lang === 'en' ? 'Stealth Guard' : '安全保卫'}</span>
                     <span className="text-gray-600 font-medium">{lang === 'en' ? 'Auto-hide on blur or resize' : '失焦、缩放窗口均会自动隐藏电视'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} lang={lang} />
        )}
      </AnimatePresence>
    </div>
  );
}
