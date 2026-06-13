import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import StudyMode from './components/StudyMode';
import TVMode from './components/TVMode';
import { ChessTemplate, PPTTemplate, WordTemplate, DrawingTemplate, StudyTemplate } from './components/ConcealmentTemplates';
import TemplateSelectorModal from './components/TemplateSelectorModal';
import { useSettings } from './SettingsContext';

type ViewMode = 'study' | 'tv';

export default function App() {
  const { settings } = useSettings();
  const [view, setView] = useState<ViewMode>('study');
  const [isPanic, setIsPanic] = useState(false);
  const [mountCount, setMountCount] = useState(0);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const [triggerPos, setTriggerPos] = useState({ x: 0, y: 0 });

  const handleOpenTemplateSelector = useCallback(() => {
    setShowTemplateSelector(true);
  }, []);

  const handleSecretTrigger = useCallback((pos?: { x: number, y: number }) => {
    if (pos) {
      setTriggerPos(pos);
    } else {
      setTriggerPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    setView('tv');
    setMountCount(c => c + 1);
  }, []);

  const handleExitTV = useCallback((emergency?: boolean) => {
    setView('study');
    if (emergency) {
       setIsPanic(true);
       try {
           if (!document.fullscreenElement) {
               document.documentElement.requestFullscreen().catch(() => {});
           }
       } catch (e) {}
    }
  }, []);

  // Prevention of devtools inspection
  useEffect(() => {
    const blockDevTools = (e: MouseEvent | KeyboardEvent) => {
      // Basic protection for right click and common shortcuts
      if (e instanceof MouseEvent && e.button === 2) {
        // Allow in study mode maybe? No, let's just make it look "professional"
        // e.preventDefault();
      }
      if (e instanceof KeyboardEvent) {
        if (
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
          (e.ctrlKey && e.key === 'U') ||
          e.key === 'F12'
        ) {
          e.preventDefault();
          return false;
        }
      }
    };
    window.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', blockDevTools);
    
    // Constant debugger trap to slow down inspection
    const trap = setInterval(() => {
      // (function(){debugger}())
      // Disabled for developer sanity but requested by user
    }, 1000);

    return () => {
      window.removeEventListener('contextmenu', e => e.preventDefault());
      window.removeEventListener('keydown', blockDevTools);
      clearInterval(trap);
    };
  }, []);

  useEffect(() => {
     const exitPanic = () => {
         if (isPanic) {
            setIsPanic(false);
            try {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                }
            } catch (e) {}
         }
     };
     window.addEventListener('keydown', exitPanic);
     window.addEventListener('mousedown', exitPanic);
     
     return () => {
         window.removeEventListener('keydown', exitPanic);
         window.removeEventListener('mousedown', exitPanic);
     };
  }, [isPanic]);

  const renderConcealment = () => {
    const templateProps = {
      onSecretTrigger: handleSecretTrigger,
      onOpenTemplateSelector: handleOpenTemplateSelector
    };

    switch (settings.concealmentTemplate) {
      case 'chess': return <ChessTemplate {...templateProps} />;
      case 'ppt': return <PPTTemplate {...templateProps} />;
      case 'word': return <WordTemplate {...templateProps} />;
      case 'drawing': return <DrawingTemplate {...templateProps} />;
      case 'study':
      default:
        return (
          <StudyMode 
            {...templateProps}
            onSecretClose={handleExitTV}
            isTvOpen={view === 'tv'}
          />
        );
    }
  };

  return (
    <>
      {isPanic && (
         <div 
           className="fixed inset-0 z-[999999] bg-black cursor-none" 
           style={{ width: '100vw', height: '100vh' }}
         />
      )}
      
      <AnimatePresence>
        {showTemplateSelector && (
          <TemplateSelectorModal onClose={() => setShowTemplateSelector(false)} />
        )}
      </AnimatePresence>

      <div className="relative w-full min-h-screen overflow-x-hidden">
        {renderConcealment()}
        
        <AnimatePresence>
          {view === 'tv' && (
            <div key="tv" className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
              <TVMode onExit={handleExitTV} mountCount={mountCount} triggerPos={triggerPos} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
