import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CrispPreChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
}

export const CrispPreChatModal: React.FC<CrispPreChatModalProps> = ({ isOpen, onClose, profileName }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSend = () => {
    if (!message.trim()) return;

    if (window.$crisp) {
      if (name.trim()) {
        window.$crisp.push(['set', 'user:nickname', [name]]);
      }
      
      if (email.trim()) {
        window.$crisp.push(['set', 'user:email', [email]]);
      }
      
      // Send message via Crisp API
      window.$crisp.push(['do', 'message:send', ['text', message]]);
      
      // Note: We don't call chat:open because we have our own UI
    }

    onClose();
    setName('');
    setEmail('');
    setMessage('');
    
    // Smooth transition to the messaging dashboard
    setTimeout(() => {
        navigate('/messages');
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end md:items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-[#F3F2EF]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#0A66C2] rounded-full flex items-center justify-center text-white font-bold text-xs">
                {profileName.charAt(0)}
             </div>
             <h3 className="font-bold text-gray-800">New Message to {profileName}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6 bg-blue-50 p-4 rounded-xl text-xs text-blue-800 leading-relaxed border border-blue-100">
             Your message will be sent securely to <b>{profileName}</b>. Once sent, we'll take you to the Messaging dashboard to continue the conversation in real-time.
          </div>

          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Your Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2] outline-none transition-all"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2] outline-none transition-all"
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
              </div>

              <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Message</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-4 h-40 focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2] outline-none resize-none transition-all text-sm"
                    placeholder="Hi Sai, I'd love to chat about your background in automation..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-[#0A66C2] text-white px-8 py-2 rounded-full font-bold hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 text-sm active:scale-95"
          >
            <Send className="w-4 h-4" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrispPreChatModal;
