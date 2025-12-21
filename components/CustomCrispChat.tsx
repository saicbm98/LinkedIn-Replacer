import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, MessageCircle } from 'lucide-react';

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

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

export const CustomCrispChat: React.FC<CustomCrispChatProps> = ({ isOpen, onClose, profileName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  // Load messages and visitor info from localStorage on mount
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
        console.error('Failed to parse saved messages');
      }
    }
    
    if (savedVisitorInfo) {
      try {
        const { name, email } = JSON.parse(savedVisitorInfo);
        setVisitorName(name || '');
        setVisitorEmail(email || '');
        if (name || email) {
          setHasStarted(true);
        }
      } catch (e) {
        console.error('Failed to parse visitor info');
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Poll Crisp for new messages
  useEffect(() => {
    if (!hasStarted || !window.$crisp) return;

    const checkForNewMessages = () => {
      try {
        // Try to get messages from Crisp's session
        window.$crisp.push(['on', 'message:received', (msg: any) => {
          console.log('📨 Message received from Crisp:', msg);
          
          if (msg && msg.content) {
            const newMsg: Message = {
              text: msg.content,
              from: 'operator',
              timestamp: Date.now()
            };
            
            setMessages(prev => {
              // Check if message already exists
              const exists = prev.some(m => 
                m.text === newMsg.text && 
                m.from === 'operator' && 
                Math.abs(m.timestamp - newMsg.timestamp) < 5000
              );
              
              if (exists) return prev;
              
              console.log('✅ Adding new operator message');
              return [...prev, newMsg];
            });
            
            if (isMinimized) {
              setUnreadCount(prev => prev + 1);
            }
          }
        }]);

        // Also listen for message:compose:sent
        window.$crisp.push(['on', 'message:compose:sent', (msg: any) => {
          console.log('📤 Message sent event:', msg);
        }]);

      } catch (error) {
        console.error('Error checking messages:', error);
      }
    };

    // Initial check
    checkForNewMessages();

    // Poll every 2 seconds
    pollingIntervalRef.current = window.setInterval(checkForNewMessages, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [hasStarted, isMinimized]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Reset unread count when maximized
  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0);
    }
  }, [isMinimized]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (!hasStarted) {
      // First message - save and set visitor info
      const visitorInfo = {
        name: visitorName,
        email: visitorEmail
      };
      localStorage.setItem(VISITOR_INFO_KEY, JSON.stringify(visitorInfo));
      
      if (visitorName.trim()) {
        window.$crisp.push(['set', 'user:nickname', [visitorName]]);
      }
      if (visitorEmail.trim()) {
        window.$crisp.push(['set', 'user:email', [visitorEmail]]);
      }
      setHasStarted(true);
    }

    // Add message to local state immediately
    const newMsg: Message = {
      text: newMessage,
      from: 'visitor',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMsg]);

    // Send message to Crisp
    console.log('📤 Sending message to Crisp:', newMessage);
    window.$crisp.push(['do', 'message:send', ['text', newMessage]]);

    // Clear input
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleCloseChat = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[100] animate-fade-in">
        <button
          onClick={handleMaximize}
          className="bg-[#0A66C2] text-white px-4 py-3 rounded-full shadow-2xl hover:bg-[#004182] transition-all hover:scale-105 relative flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium text-sm">
            {visitorName || 'Chat'}
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Maximized state
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-xl md:rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#0A66C2] text-white rounded-t-xl">
          <div>
            <h3 className="font-semibold">Chat with {profileName}</h3>
            {visitorName && (
              <p className="text-xs opacity-80">Chatting as {visitorName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleMinimize} 
              className="hover:bg-white/20 rounded p-1 transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleCloseChat} 
              className="hover:bg-white/20 rounded p-1 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {!hasStarted && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">Enter your details to start chatting</p>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#0A66C2] outline-none"
                placeholder="Your Name (Optional)"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
              />
              <input
                type="email"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#0A66C2] outline-none"
                placeholder="Your Email (Optional)"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
              />
            </div>
          )}

          {messages.length === 0 && hasStarted && (
            <p className="text-sm text-gray-500 text-center">No messages yet. Start a conversation!</p>
          )}

          {messages.map((msg, idx) => (
            <div
              key={`${msg.timestamp}-${idx}`}
              className={`flex ${msg.from === 'visitor' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.from === 'visitor'
                    ? 'bg-[#0A66C2] text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                {msg.from === 'operator' && (
                  <p className="text-xs font-semibold mb-1 opacity-70">{profileName}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
          <div className="flex gap-2">
            <textarea
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent outline-none resize-none"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-[#0A66C2] text-white px-4 rounded-md hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};