import React, { useState } from 'react';
import { evaluateSOC } from '../services/geminiService.ts';
import { SOCResult } from '../types.ts';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';

const SOCEvaluator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SOCResult | null>(null);
  const [error, setError] = useState('');

  const handleEvaluate = async () => {
    if (!title || !description) return;
    setLoading(true);
    setError('');
    setResult(null);

    const data = await evaluateSOC(title, description);
    
    if (data) {
        setResult(data);
    } else {
        setError('Failed to evaluate. Please check your AI Key or try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    <Brain className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">SOC 2020 Evaluator</h1>
                    <p className="text-sm text-gray-500">AI-powered job classification assistance</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md p-2 focus:border-[#0A66C2] outline-none"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-md p-2 h-40 focus:border-[#0A66C2] outline-none"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                    />
                </div>
                
                <button 
                    onClick={handleEvaluate}
                    disabled={loading || !title || !description}
                    className="w-full bg-[#0A66C2] text-white font-bold py-3 rounded-md hover:bg-[#004182] transition-colors disabled:opacity-50"
                >
                    {loading ? 'Analyzing...' : 'Find SOC Code'}
                </button>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            {result && (
                <div className="mt-8 border-t border-gray-200 pt-6 animate-fade-in">
                    <div className="flex justify-between items-start mb-4">
                         <div>
                             <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Recommended SOC Code</span>
                             <div className="text-3xl font-bold text-[#1A1A1A] mt-1">{result.code}</div>
                             <div className="text-lg text-gray-700 font-medium">{result.title}</div>
                         </div>
                         <div className="text-right">
                             <div className="text-2xl font-bold text-green-600">{result.confidence}%</div>
                             <div className="text-xs text-gray-500">Confidence</div>
                         </div>
                    </div>

                    <div className="bg-gray-50 rounded p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Reasoning</h3>
                        <ul className="space-y-2">
                            {result.reasoning.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <p className="text-[10px] text-gray-400 mt-4 text-center">
                        Disclaimer: This is an AI-generated estimation and does not constitute legal advice.
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default SOCEvaluator;