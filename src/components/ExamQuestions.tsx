import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';

const questionsData = {
  math: [
    {
      id: 1,
      title: "2023年全国高考数学I卷真题 (多选)",
      content: "已知函数 f(x) = sin(ωx + φ) (ω > 0, |φ| < π/2) 的部分图象如图所示，则下列结论正确的是？",
      options: [
        "f(x) 的最小正周期为 π",
        "f(x) 的图象关于直线 x = π/3 对称",
        "f(x) 在区间 [0, π/6] 上单调递增",
        "f(x) 的图象关于点 (π/6, 0) 对称"
      ],
      correct: [0, 2],
      analysis: "根据三角函数图像的对称性和周期性可得，该函数的解析式推导中，周期 T=π，代入特定点得 φ 值，从而验证各选项。由于缺乏具体图像给出详细解析，属于三角函数经典图象特征题。"
    },
    {
      id: 2,
      title: "2022年全国高考数学真题 (单选)",
      content: "已知集合 M = {x | 0 < x < 4}, N = {x | 1/3 ≤ x ≤ 5}，则 M ∩ N = ?",
      options: [
        "{x | 0 < x ≤ 1/3}",
        "{x | 1/3 ≤ x < 4}",
        "{x | 4 ≤ x < 5}",
        "{x | 0 < x ≤ 5}"
      ],
      correct: [1],
      analysis: "解不等式求交集：M区间为 (0, 4)，N区间为 [1/3, 5]。它们的公共部分即为 [1/3, 4)。选B。"
    }
  ],
  physics: [
    {
      id: 3,
      title: "2023年全国高考理科综合(物理)真题",
      content: "一质量为 m 的小球以初动能 E_k0 从地面竖直向上抛出，已知上升过程中受到的阻力 f 大小恒定，落地时动能为 E_k1。设重力加速度为 g，则小球上升的最大高度为？",
      options: [
        "(E_k0 + E_k1) / (2mg)",
        "(E_k0 - E_k1) / (2mg)",
        "(E_k0 + E_k1) / (mg)",
        "(E_k0 - E_k1) / (mg)"
      ],
      correct: [0],
      analysis: "利用动能定理。上升阶段：-(mg + f)h = 0 - E_k0；下落阶段：(mg - f)h = E_k1 - 0。两式相加得 2mgh = E_k0 + E_k1，所以 h = (E_k0 + E_k1)/(2mg)。"
    }
  ],
  literature: [
    {
      id: 4,
      title: "2023年高考语文真题 (诗文背诵)",
      content: "下列对《归去来兮辞》的理解，不正确的一项是？",
      options: [
        "“归去来兮，田园将芜胡不归”表达了作者对田园荒芜的深切忧惧和归心似箭的情感。",
        "“悟已往之不谏，知来者之可追”体现了作者对过去出仕的悔恨以及对未来生活充满信心。",
        "“舟遥遥以轻飏，风飘飘而吹衣”通过描写舟行之轻快，烘托了作者辞官归家时如释重负的愉快心情。",
        "全辞在抒情上主要是直接抒怀，几乎没有采用借景抒情的手法。"
      ],
      correct: [3],
      analysis: "《归去来兮辞》中运用了大量的借景抒情，如“木欣欣以向荣，泉涓涓而始流”，因此选项D的表述“几乎没有采用借景抒情”是不正确的。"
    }
  ]
};

export default function ExamQuestions({ subject = 'math', lang = 'zh', currentTheme }: { subject: string, lang: 'en'|'zh', currentTheme?: any }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});

  const toggleAnswer = (qId: number, oIdx: number, isMulti: boolean) => {
    setSelectedAnswers(prev => {
      const current = prev[qId] || [];
      if (!isMulti) {
        return { ...prev, [qId]: [oIdx] };
      }
      if (current.includes(oIdx)) {
        return { ...prev, [qId]: current.filter(i => i !== oIdx) };
      } else {
        return { ...prev, [qId]: [...current, oIdx] };
      }
    });
  };

  const checkAnswer = (qId: number) => {
    setShowResult(prev => ({ ...prev, [qId]: true }));
  };

  const questions = (questionsData as any)[subject] || questionsData.math;
  const themeCardBg = currentTheme?.sidebarBg || 'bg-white';
  const themeBorder = currentTheme?.border || 'border-gray-200';
  const themeText = currentTheme?.text === 'text-gray-100' ? 'text-gray-200' : 'text-gray-800';
  const headerBg = currentTheme?.text === 'text-gray-100' ? 'bg-indigo-900/40' : 'bg-indigo-50/30';
  const headerText = currentTheme?.text === 'text-gray-100' ? 'text-indigo-200' : 'text-indigo-900';

  return (
    <div className="space-y-6">
      {questions.map((q: any) => {
        const isMulti = q.correct.length > 1;
        const resultShown = showResult[q.id];
        const selected = selectedAnswers[q.id] || [];
        const isCorrect = selected.length === q.correct.length && selected.every(val => q.correct.includes(val));

        return (
          <div key={q.id} className={`${themeCardBg} border ${themeText} ${themeBorder} shadow-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md`}>
            <div className={`px-6 py-4 border-b ${themeBorder} flex justify-between items-center ${headerBg}`}>
              <h3 className={`font-bold ${headerText} text-lg flex items-center gap-2`}>
                <BookOpen className="w-5 h-5 text-indigo-600" />
                {q.title}
              </h3>
              <div className="text-xs font-bold text-indigo-500 bg-indigo-100 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-200">
                {isMulti ? (lang === 'en' ? 'Multiple Choice' : '多选题') : (lang === 'en' ? 'Single Choice' : '单选题')}
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-6 text-[15px]">
              <p className={`leading-relaxed font-medium ${themeText} text-base`}>
                {q.content}
              </p>
              
              <div className="space-y-3">
                {q.options.map((opt: string, idx: number) => {
                  const isSelected = selected.includes(idx);
                  const isThisCorrectOption = q.correct.includes(idx);
                  
                  let optionClass = `${themeBorder} hover:border-indigo-300 hover:bg-indigo-50/50`;
                  if (isSelected) optionClass = "border-indigo-500 bg-indigo-50 text-indigo-800";
                  if (resultShown) {
                    if (isThisCorrectOption) {
                      optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                    } else if (isSelected && !isThisCorrectOption) {
                      optionClass = "border-rose-300 bg-rose-50 text-rose-800";
                    } else {
                      optionClass = `${themeBorder} opacity-50`;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={resultShown}
                      onClick={() => toggleAnswer(q.id, idx, isMulti)}
                      className={`w-full text-left px-5 py-4 border rounded-xl transition-all duration-200 flex items-start gap-3 ${optionClass}`}
                    >
                      <div className={`mt-0.5 w-5 h-5 flex-shrink-0 border rounded flex flex-col items-center justify-center transition-colors
                        ${isMulti ? 'rounded-md' : 'rounded-full'}
                        ${isSelected ? (resultShown ? (isThisCorrectOption ? 'border-emerald-500 bg-emerald-500' : 'border-rose-500 bg-rose-500') : 'border-indigo-500 bg-indigo-500') : 'border-gray-300 bg-white'}
                      `}>
                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="flex-1 leading-normal">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {!resultShown && (
                <div className="pt-2 flex justify-end">
                   <button 
                     onClick={() => checkAnswer(q.id)}
                     disabled={selected.length === 0}
                     className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                   >
                     {lang === 'en' ? 'Check Answer' : '提交答案'}
                   </button>
                </div>
              )}

              {resultShown && (
                <div className={`mt-6 p-5 rounded-xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-500 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-bold ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {isCorrect ? (lang === 'en' ? 'Correct!' : '回答正确！') : (lang === 'en' ? 'Incorrect.' : '回答错误。')}
                      </h4>
                      <div className="mt-2 text-sm text-gray-700 leading-relaxed">
                        <span className="font-bold">{lang === 'en' ? 'Analysis: ' : '解析：'}</span>
                        {q.analysis}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
