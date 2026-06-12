import React from 'react';
import { motion } from 'motion/react';
import { X, Palette, Monitor, KeyRound, Shield, Zap, Settings, Type, BookOpen, Clock } from 'lucide-react';
import { useSettings } from '../SettingsContext';

interface SettingsModalProps {
  onClose: () => void;
  lang: 'en' | 'zh';
}

export default function SettingsModal({ onClose, lang }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();

  const studyThemes = [
    { id: 'light', name: lang === 'en' ? 'Light mode' : '明亮模式' },
    { id: 'dark', name: lang === 'en' ? 'Dark mode' : '暗夜模式' },
    { id: 'sepia', name: lang === 'en' ? 'Sepia' : '护眼黄' },
    { id: 'rose', name: lang === 'en' ? 'Rose' : '玫瑰红' },
    { id: 'ocean', name: lang === 'en' ? 'Ocean' : '深海蓝' },
  ];

  const tvBorders = [
    { id: 'classic', name: lang === 'en' ? 'Classic Black' : '经典黑框' },
    { id: 'wood', name: lang === 'en' ? 'Vintage Wood' : '复古木纹' },
    { id: 'modern', name: lang === 'en' ? 'Modern Silver' : '现代银边' },
    { id: 'neon', name: lang === 'en' ? 'Cyber Neon' : '赛博霓虹' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 backdrop-blur-[2px]" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#f8f9fa] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col border border-gray-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Clean Grey */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-gray-900 leading-none">
                  {lang === 'en' ? 'System Configuration' : '学习系统参数配置'}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-mono">Kernel v2.1.0-Admin</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full border border-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-10">
          
          {/* Section 1: Window Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
               <Monitor className="w-4 h-4 text-gray-400" />
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{lang === 'en' ? 'Window Controls' : '电视窗口全局设置'}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100">
               <div className="space-y-4">
                  <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">{lang === 'en' ? 'Default Opacity' : '窗口默认透明度'}</label>
                        <span className="text-xs font-bold text-indigo-600">{Math.round(settings.tvOpacity * 100)}%</span>
                     </div>
                     <input type="range" min="0.1" max="1" step="0.05" value={settings.tvOpacity} onChange={e => updateSettings({ tvOpacity: parseFloat(e.target.value) })} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                  <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">{lang === 'en' ? 'Idle Opacity' : '鼠标离开时透明度'}</label>
                        <span className="text-xs font-bold text-indigo-600">{Math.round(settings.tvIdleOpacity * 100)}%</span>
                     </div>
                     <input type="range" min="0" max="1" step="0.05" value={settings.tvIdleOpacity} onChange={e => updateSettings({ tvIdleOpacity: parseFloat(e.target.value) })} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                     <span className="text-sm font-medium text-gray-700">{lang === 'en' ? 'Window Memory' : '窗口位置记忆'}</span>
                     <button onClick={() => updateSettings({ rememberTvPosition: !settings.rememberTvPosition })} className={`w-10 h-5 rounded-full transition-colors relative ${settings.rememberTvPosition ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.rememberTvPosition ? 'translate-x-5' : ''}`} />
                     </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                     <span className="text-sm font-medium text-gray-700">{lang === 'en' ? 'Transition FX' : '窗口动画音效'}</span>
                     <button onClick={() => updateSettings({ tvAnimationEnabled: !settings.tvAnimationEnabled })} className={`w-10 h-5 rounded-full transition-colors relative ${settings.tvAnimationEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.tvAnimationEnabled ? 'translate-x-5' : ''}`} />
                     </button>
                  </div>
               </div>
            </div>
          </section>

          {/* Section 2: Trigger Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
               <Zap className="w-4 h-4 text-gray-400" />
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{lang === 'en' ? 'Trigger Mechanisms' : '触发机制设置'}</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-6">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'click', name: lang === 'en' ? 'Click' : '点击', icon: Zap },
                    { id: 'calculator', name: lang === 'en' ? 'Code' : '密码', icon: Zap },
                    { id: 'keyboard', name: lang === 'en' ? 'Key' : '快键', icon: Zap },
                    { id: 'formula', name: lang === 'en' ? 'Double' : '双击', icon: Zap },
                    { id: 'longpress', name: lang === 'en' ? 'Long' : '长按', icon: Zap },
                    { id: 'selection', name: lang === 'en' ? 'Text' : '文本', icon: Zap },
                    { id: 'header', name: lang === 'en' ? 'Header' : '标题', icon: Zap },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => updateSettings({ tvTriggerMethod: method.id as any })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        settings.tvTriggerMethod === method.id 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-indigo-300'
                      }`}
                    >
                      {method.name}
                    </button>
                  ))}
               </div>

               <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.tvTriggerMethod === 'click' && (
                     <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{lang === 'en' ? 'Click Count' : '点击激活次数'}</label>
                        <div className="flex items-center gap-3">
                           <input type="range" min="3" max="10" step="1" value={settings.tvTriggerCount} onChange={e => updateSettings({ tvTriggerCount: parseInt(e.target.value) })} className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none accent-indigo-600" />
                           <span className="text-sm font-bold text-indigo-600">{settings.tvTriggerCount}</span>
                        </div>
                     </div>
                  )}
                  {settings.tvTriggerMethod === 'selection' && (
                     <div className="col-span-1 md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{lang === 'en' ? 'Target Text Segment' : '触发文段内容'}</label>
                        <input type="text" value={settings.tvTriggerText} onChange={e => updateSettings({ tvTriggerText: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                        <p className="text-[10px] text-gray-400 mt-1 italic">Selecting this specific text will register towards the activation count.</p>
                     </div>
                  )}
                  {settings.tvTriggerMethod === 'calculator' && (
                     <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{lang === 'en' ? 'Calculator Code' : '计算器密码'}</label>
                        <input type="text" value={settings.tvTriggerCode} onChange={e => updateSettings({ tvTriggerCode: e.target.value.replace(/\D/g,'') })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono" />
                     </div>
                  )}
               </div>
            </div>
          </section>

          {/* Section 3: Anti-Inspection */}
          <section>
            <div className="flex items-center gap-2 mb-4">
               <Shield className="w-4 h-4 text-gray-400" />
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{lang === 'en' ? 'Anti-Context Guard' : '自动防查岗设置'}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {[
                 { id: 'panicOnBlur', name: lang === 'en' ? 'Auto-Hide on Unfocus' : '页面失焦自动隐藏', icon: Zap },
                 { id: 'panicOnResize', name: lang === 'en' ? 'Auto-Hide on Resize' : '窗口变动自动隐藏', icon: Zap },
               ].map(item => (
                  <button
                     key={item.id}
                     onClick={() => updateSettings({ [item.id]: !settings[item.id as keyof typeof settings] })}
                     className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        settings[item.id as keyof typeof settings]
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-500'
                     }`}
                  >
                     <span className="text-sm font-medium">{item.name}</span>
                     <div className={`w-8 h-4 rounded-full relative ${settings[item.id as keyof typeof settings] ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings[item.id as keyof typeof settings] ? 'translate-x-4' : ''}`} />
                     </div>
                  </button>
               ))}
            </div>
          </section>

          {/* Section 4: Study Environment */}
          <section>
            <div className="flex items-center gap-2 mb-4">
               <Palette className="w-4 h-4 text-gray-400" />
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{lang === 'en' ? 'Study Environment' : '主页学习工具配置'}</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2"><Type className="w-3 h-3 inline mr-1" /> {lang === 'en' ? 'Global Font Size' : '全局文字字号'}</label>
                     <div className="flex items-center gap-3">
                        <input type="range" min="80" max="150" value={settings.fontSize} onChange={e => updateSettings({ fontSize: parseInt(e.target.value) })} className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none accent-indigo-600" />
                        <span className="text-xs font-bold text-gray-600 whitespace-nowrap">{settings.fontSize}%</span>
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2"><Palette className="w-3 h-3 inline mr-1" /> {lang === 'en' ? 'Background Theme' : '视觉风格'}</label>
                     <select 
                        value={settings.studyTheme} 
                        onChange={e => updateSettings({ studyTheme: e.target.value as any })}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                     >
                        {studyThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                     { id: 'showKnowledgePopups', name: lang === 'en' ? 'Knowledge Tips' : '自动知识点弹窗', icon: BookOpen },
                     { id: 'showOnlineCount', name: lang === 'en' ? 'Online Status' : '显示在线人数', icon: Zap },
                     { id: 'showStudyTimer', name: lang === 'en' ? 'Study Timer' : '显示学习计时面板', icon: Clock },
                  ].map(tool => (
                     <button
                        key={tool.id}
                        onClick={() => updateSettings({ [tool.id]: !settings[tool.id as keyof typeof settings] })}
                        className={`p-3 rounded-xl border text-[10px] font-bold text-left flex flex-col gap-2 transition-all ${
                           settings[tool.id as keyof typeof settings] ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                     >
                        <tool.icon className="w-3.5 h-3.5" />
                        {tool.name}
                     </button>
                  ))}
               </div>

               {settings.showKnowledgePopups && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                     <div className="flex justify-between mb-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{lang === 'en' ? 'Tips Interval' : '知识点轮换间隔'}</label>
                        <span className="text-xs font-bold text-indigo-600">{settings.knowledgeInterval} min</span>
                     </div>
                     <input type="range" min="1" max="30" step="1" value={settings.knowledgeInterval} onChange={e => updateSettings({ knowledgeInterval: parseInt(e.target.value) })} className="w-full h-1 bg-gray-300 rounded-lg appearance-none accent-indigo-600" />
                  </div>
               )}
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 text-center shirnk-0">
           <p className="text-[9px] text-gray-400 font-medium italic">Administrative Access Authorized. All changes are persistent in local storage.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
