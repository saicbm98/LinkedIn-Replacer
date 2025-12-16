import React, { useState } from 'react';
import { useStore } from '../store';
import { answerProfileQuestion } from '../services/geminiService';
import { Sparkles, MessageSquare } from 'lucide-react';

const AIChatWidget: React.FC = () => {
  const { profile } = useStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "What is Sai's tech stack?",
    "Tell me about the Migreats role",
    "Does Sai know Python?",
    "What are Sai's core skills?"
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
    <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-sm text-[#1A1A1A]">Ask about {profile.name}</h3>
      </div>
      
      {!answer ? (
          <>
            <p className="text-xs text-gray-500 mb-3">
                I'm an AI assistant trained on {profile.name.split(' ')[0]}'s profile. Ask me anything!
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
                {suggestedQuestions.map((q, i) => (
                    <button 
                        key={i}
                        onClick={() => handleAsk(q)}
                        disabled={loading}
                        className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 hover:bg-purple-100 transition-colors text-left"
                    >
                        {q}
                    </button>
                ))}
            </div>

            <textarea 
                className="w-full bg-[#F3F2EF] rounded p-2 text-xs mb-2 border-none outline-none focus:ring-1 focus:ring-purple-400 resize-none h-16 text-gray-900"
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
                className="w-full bg-black text-white rounded py-1.5 text-xs font-semibold disabled:opacity-50 hover:bg-gray-800 transition-colors"
            >
                {loading ? 'Thinking...' : 'Ask AI'}
            </button>
          </>
      ) : (
          <div className="animate-fade-in">
             <div className="bg-[#F3F2EF] p-3 rounded text-xs text-[#1A1A1A] mb-3 leading-relaxed">
                <span className="font-semibold text-purple-700 block mb-1">Q: {question}</span>
                {answer}
             </div>
             <button 
                onClick={() => { setAnswer(''); setQuestion(''); }}
                className="text-xs text-[#0A66C2] font-semibold hover:underline"
             >
                Ask another question
             </button>
          </div>
      )}
    </div>
  );
};

export default AIChatWidget;