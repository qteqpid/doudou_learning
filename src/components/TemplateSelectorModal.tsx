import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Grid3X3, 
  BookOpen, 
  Presentation, 
  FileText, 
  Palette,
  Shield,
  ShieldAlert,
  Ghost
} from 'lucide-react';
import { useSettings } from '../SettingsContext';

interface TemplateSelectorModalProps {
  onClose: () => void;
}

export default function TemplateSelectorModal({ onClose }: TemplateSelectorModalProps) {
  const { settings, updateSettings } = useSettings();

  const options = [
    { id: 'study', name: '默认学习 (Default)', icon: BookOpen, desc: 'EduSystem 学习平台主页', color: 'bg-indigo-500' },
    { id: 'chess', name: '下棋平台 (Chess)', icon: Grid3X3, desc: '仿 Lichess/Chess.com 在线对弈', color: 'bg-zinc-700' },
    { id: 'ppt', name: 'PPT 制作 (PowerPoint)', icon: Presentation, desc: '仿 PowerPoint/Google Slides 界面', color: 'bg-orange-500' },
    { id: 'word', name: 'Word 文档 (Docs)', icon: FileText, desc: '仿 Microsoft Word/Google Docs 编辑器', color: 'bg-blue-500' },
    { id: 'drawing', name: '专业绘图 (Design)', icon: Palette, desc: '仿 Figma/Adobe Illustrator 设计界面', color: 'bg-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#1c1c1e] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                 <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-white tracking-tight">隐蔽模版配置</h3>
                 <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Concealment Template Config</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  updateSettings({ concealmentTemplate: opt.id as any });
                  setTimeout(onClose, 200);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${
                  settings.concealmentTemplate === opt.id 
                    ? 'bg-white/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                    : 'bg-white/5 border-transparent hover:bg-white/[0.08]'
                }`}
              >
                <div className={`w-12 h-12 ${opt.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                   <opt.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                   <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{opt.name}</span>
                      {settings.concealmentTemplate === opt.id && (
                        <div className="bg-indigo-500 p-1 rounded-full">
                           <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                   </div>
                   <p className="text-xs text-white/50 mt-0.5">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
             <div className="flex items-center gap-3 text-white/30 text-[10px] leading-relaxed">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>提示：长按左上角图标 2 秒即可再次进入此设置界面。切换模版后，当您“紧急退出”电视模式时，系统将自动呈现选定的隐蔽模版以确保安全。</p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
