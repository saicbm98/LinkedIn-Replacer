import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, MessageCircle } from 'lucide-react';

interface Message {
  text: string;
  from: 'visitor' | 'operator';
  timestamp: number;
}

interface CustomCrispChatProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
}

const STORAGE_KEY = 'crisp_chat_messages';
const VISITOR_INFO_KEY = 'crisp_visitor_info';

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

export const CustomCrispChat: React.FC<CustomCrispChatProps> = ({ isOpen, onClose, profileName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [emailError, setEmailError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pushPermissionRequested = useRef(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    const savedVisitorInfo = localStorage.getItem(VISITOR_INFO_KEY);
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
        if (parsed.length > 0) {
          setHasStarted(true);
        }
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }

    if (savedVisitorInfo) {
      try {
        const { name, email } = JSON.parse(savedVisitorInfo);
        setVisitorName(name || '');
        setVisitorEmail(email || '');
        if (name && email) {
          setHasStarted(true);
        }
      } catch (e) {
        console.error('Failed to parse visitor info:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (visitorName || visitorEmail) {
      localStorage.setItem(VISITOR_INFO_KEY, JSON.stringify({ 
        name: visitorName, 
        email: visitorEmail 
      }));
    }
  }, [visitorName, visitorEmail]);

  useEffect(() => {
    if (hasStarted && window.$crisp) {
      const visitorInfo = localStorage.getItem(VISITOR_INFO_KEY);
      if (visitorInfo) {
        const { name, email } = JSON.parse(visitorInfo);
        if (name) {
          window.$crisp.push(['set', 'user:nickname', name]);
        }
        if (email) {
          window.$crisp.push(['set', 'user:email', email]);
        }
      }
      window.$crisp.push(['do', 'chat:open']);
    }
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted || !window.$crisp) return;

    const checkForNewMessages = () => {
      window.$crisp.push(['on', 'message:received', (msg: any) => {
        const newMsg: Message = {
          text: msg.content,
          from: 'operator',
          timestamp: Date.now()
        };
        
        setMessages(prev => {
          const exists = prev.some(m => 
            m.text === newMsg.text && 
            m.from === 'operator' && 
            Math.abs(m.timestamp - newMsg.timestamp) < 5000
          );
          if (exists) return prev;
          return [...prev, newMsg];
        });

        if (isMinimized) {
          setUnreadCount(prev => prev + 1);
        }
      }]);
    };

    checkForNewMessages();
    pollingIntervalRef.current = setInterval(checkForNewMessages, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [hasStarted, isMinimized]);

  useEffect(() => {
    if (!hasStarted || !window.$crisp) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && window.$crisp) {
        window.$crisp.push(['on', 'message:received', (msg: any) => {
          const newMsg: Message = {
            text: msg.content,
            from: 'operator',
            timestamp: Date.now()
          };
          
          setMessages(prev => {
            const exists = prev.some(m => 
              m.text === newMsg.text && 
              m.from === 'operator' && 
              Math.abs(m.timestamp - newMsg.timestamp) < 5000
            );
            if (exists) return prev;
            return [...prev, newMsg];
          });
          
          if (isMinimized) {
            setUnreadCount(prev => prev + 1);
          }
        }]);

        window.$crisp.push(['do', 'session:reset']);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasStarted, isMinimized]);

  const requestPushPermission = () => {
    if ('Notification' in window && Notification.permission === 'default' && !pushPermissionRequested.current) {
      pushPermissionRequested.current = true;
      setTimeout(() => {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Push notifications enabled');
          }
        });
      }, 2000);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0);
    }
  }, [isMinimized]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleStart = () => {
    if (!visitorName.trim()) {
      setEmailError('Please enter your name');
      return;
    }

    if (!visitorEmail.trim()) {
      setEmailError('Email is required so you can get the reply even if you close the site');
      return;
    }

    if (!validateEmail(visitorEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setHasStarted(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      text: newMessage,
      from: 'visitor',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, msg]);

    if (window.$crisp) {
      window.$crisp.push(['do', 'message:send', ['text', newMessage]]);
    }

    setNewMessage('');

    if (messages.length === 0) {
      requestPushPermission();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsMinimized(false);
    onClose();
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div 
        onClick={handleMaximize}
        className="fixed bottom-6 right-6 bg-[#0A66C2] text-white rounded-full p-4 shadow-2xl cursor-pointer hover:bg-[#004182] transition-all z-50 flex items-center gap-3"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="flex flex-col items-start">
          <span className="font-semibold text-sm">
            {visitorName || 'Chat'}
          </span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[600px]">
        <div className="p-4 bg-[#0A66C2] text-white flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">
              {hasStarted ? `Chatting as ${visitorName}` : `Message ${profileName}`}
            </h3>
            <p className="text-sm text-blue-100">
              {hasStarted ? 'We typically reply within minutes' : 'Start a conversation'}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleMinimize} 
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleClose} 
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!hasStarted ? (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => {
                  setVisitorName(e.target.value);
                  setEmailError('');
                }}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={visitorEmail}
                onChange={(e) => {
                  setVisitorEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-600 mt-1">
                Required so we can reply even if you close this page
              </p>
              {emailError && (
                <p className="text-xs text-red-600 mt-1 font-semibold">
                  {emailError}
                </p>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Or reach me directly:</p>
              <div className="flex gap-2">
                <a
                  href="https://wa.me/447436950058"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="mailto:medicherlasaicharan@gmail.com"
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-[#0A66C2] text-white py-3 rounded-lg font-semibold hover:bg-[#004182] transition-colors mt-4"
            >
              Start Chat
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.from === 'visitor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      msg.from === 'visitor'
                        ? 'bg-[#0A66C2] text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    {msg.from === 'operator' && (
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        {profileName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-[#0A66C2] text-white p-3 rounded-full hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
