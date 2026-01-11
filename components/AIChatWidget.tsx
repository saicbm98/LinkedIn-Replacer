import React, { useState } from 'react';
import { useStore } from '../store.tsx';
import { answerProfileQuestion } from '../services/geminiService.ts';
import { Sparkles, MessageSquare } from 'lucide-react';

const AIChatWidget: React.FC = () => {
  const { profile } = useStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    `What is ${profile.name.split(' ')[0]}'s tech stack?`,
    "Tell me about the Migreats role",
    `Does ${profile.name.split(' ')[0]} know Python?`,
    `What are ${profile.name.split(' ')[0]}'s core skills?`
  ];

  const handleAsk = async (q: string) => {
    if (!q.trim()) return;
    setQuestion(q);
    setLoading(true);
    const response = await answerProfileQuestion(q, profile);
    setAnswer(response);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E6E6E6] p-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-[15px] text-[#1A1A1A]">Ask about {profile.name}</h3>
      </div>
      
      {!answer ? (
          <>
            <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">
                I'm an AI assistant trained on {profile.name.split(' ')[0]}'s profile. Ask me anything!
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {suggestedQuestions.map((q, i) => (
                    <button 
                        key={i}
                        onClick={() => handleAsk(q)}
                        disabled={loading}
                        className="text-[11px] bg-purple-50 text-purple-700 px-3 py-1.5 rounded-md border border-purple-100 hover:bg-purple-100 transition-colors text-left font-medium"
                    >
                        {q}
                    </button>
                ))}
            </div>

            <textarea 
                className="w-full bg-[#F3F2EF] rounded-lg p-3 text-[12px] mb-3 border-none outline-none focus:ring-2 focus:ring-purple-200 resize-none h-20 text-gray-900 placeholder:text-gray-400"
                placeholder="Type your own question..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAsk(question);
                    }
                }}
            />
            <button 
                onClick={() => handleAsk(question)}
                disabled={loading || !question.trim()}
                className="w-full bg-[#666666] text-white rounded-md py-2 text-[13px] font-bold disabled:opacity-50 hover:bg-[#333333] transition-colors shadow-sm"
            >
                {loading ? 'Thinking...' : 'Ask AI'}
            </button>
          </>
      ) : (
          <div className="animate-fade-in">
             <div className="bg-[#F3F2EF] p-4 rounded-lg text-[13px] text-[#1A1A1A] mb-4 leading-relaxed">
                <span className="font-bold text-purple-700 block mb-1">Q: {question}</span>
                {answer}
             </div>
             <button 
                onClick={() => { setAnswer(''); setQuestion(''); }}
                className="text-[13px] text-[#0A66C2] font-bold hover:underline"
             >
                Ask another question
             </button>
          </div>
      )}
    </div>
  );
};

export default AIChatWidget;