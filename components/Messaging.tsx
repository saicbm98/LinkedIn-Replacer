import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store.tsx';
import { MessageStatus } from '../types.ts';
import { Search, MoreVertical, Send, PlusCircle, Inbox, User, CheckCheck, Smile, Paperclip, Image as ImageIcon } from 'lucide-react';

const Messaging: React.FC = () => {
  const { 
    conversations, 
    currentUser, 
    markAsRead, 
    sendMessage, 
    visitorToken, 
    createTestConversation, 
    profile,
    crispMessages,
    isCrispTyping,
    sendCrispMessage
  } = useStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine if we are in "Visitor Crisp Mode" or "Owner Dashboard Mode"
  const isVisitorMode = currentUser === 'visitor';

  // Conversations to show in the list
  const visibleConversations = !isVisitorMode 
    ? [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
    : []; // For visitor, we often just show the one active thread directly

  const activeConversation = !isVisitorMode 
    ? visibleConversations.find(c => c.id === selectedId)
    : null;

  // Auto-select for owner if list is small or first item
  useEffect(() => {
    if (!isVisitorMode && visibleConversations.length > 0 && !selectedId) {
      setSelectedId(visibleConversations[0].id);
    }
  }, [visibleConversations, isVisitorMode, selectedId]);

  // Handle Marking as Read
  useEffect(() => {
    if (selectedId && !isVisitorMode) {
      const current = visibleConversations.find(c => c.id === selectedId);
      if (current && current.unreadCount > 0) {
          markAsRead(selectedId);
      }
    }
  }, [selectedId, isVisitorMode, visibleConversations]);

  // Scroll to bottom
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, crispMessages, isCrispTyping]);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    
    if (isVisitorMode) {
      sendCrispMessage(replyText);
    } else if (selectedId) {
      await sendMessage(selectedId, replyText, currentUser);
    }
    setReplyText('');
  };

  // UI for Empty State
  if (!isVisitorMode && visibleConversations.length === 0) {
      return (
          <div className="max-w-7xl mx-auto p-20 text-center flex flex-col items-center justify-center">
              <Inbox className="w-16 h-16 text-gray-200 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Your inbox is empty</h2>
              <p className="text-gray-500 max-w-sm">When recruiters or visitors message you, they'll appear here.</p>
          </div>
      )
  }

  const messagesToRender = isVisitorMode ? crispMessages : (activeConversation?.messages || []);
  const titleToRender = isVisitorMode ? profile.name : (activeConversation?.visitorName || 'Conversation');

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4 py-4 h-[calc(100vh-64px)] flex flex-col md:flex-row gap-4 overflow-hidden">
      
      {/* Left Sidebar: Thread List (Hidden for Visitors who only have one live chat) */}
      {!isVisitorMode && (
        <div className={`w-full md:w-80 bg-white rounded-lg border border-[#E6E6E6] shadow-sm flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#E6E6E6] space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg text-gray-900">Messaging</h2>
                <button onClick={createTestConversation} className="p-1 hover:bg-gray-100 rounded-full text-[#0A66C2]" title="Simulate Message">
                    <PlusCircle className="w-5 h-5" />
                </button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search messages" 
                    className="w-full bg-[#EDF3F8] pl-10 pr-4 py-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#0A66C2] border border-transparent"
                />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {visibleConversations.map(conv => {
                const isUnread = conv.unreadCount > 0;
                const isActive = selectedId === conv.id;
                
                return (
                    <div 
                        key={conv.id} 
                        onClick={() => setSelectedId(conv.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-all border-l-4 ${
                            isActive ? 'bg-[#EDF3F8]/50 border-[#0A66C2]' : 'border-transparent'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-500 font-bold">
                                {conv.visitorName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className={`text-sm truncate pr-2 ${isUnread ? 'font-bold text-black' : 'font-semibold text-gray-700'}`}>
                                        {conv.visitorName}
                                    </span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${isUnread ? 'text-black font-semibold' : 'text-gray-500'}`}>
                                    {conv.lastMessageSnippet}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            })}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 bg-white rounded-lg border border-[#E6E6E6] shadow-sm flex flex-col overflow-hidden ${!selectedId && !isVisitorMode ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Chat Header */}
        <div className="px-4 h-16 border-b border-[#E6E6E6] flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            {!isVisitorMode && (
                <button className="md:hidden p-2 -ml-2 text-[#0A66C2]" onClick={() => setSelectedId(null)}>
                    <Inbox className="w-5 h-5 rotate-180" />
                </button>
            )}
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-[#0A66C2] border border-gray-200">
                {titleToRender.charAt(0)}
            </div>
            <div>
                <h3 className="font-bold text-sm text-[#1A1A1A]">{titleToRender}</h3>
                <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> {isVisitorMode ? 'Active Session' : 'Direct Message'}
                </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#F3F2EF]/20 custom-scrollbar">
            {messagesToRender.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                    <div className="w-16 h-16 bg-blue-50 text-[#0A66C2] rounded-full flex items-center justify-center">
                        <Inbox className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-700">Start the conversation</h4>
                        <p className="text-sm text-gray-500">Say hello to get things moving!</p>
                    </div>
                </div>
            ) : (
                messagesToRender.map((msg, idx) => {
                    const isMe = msg.senderType === currentUser;
                    const prevMsg = idx > 0 ? messagesToRender[idx - 1] : null;
                    const isSameSender = prevMsg?.senderType === msg.senderType;
                    
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSameSender ? '-mt-4' : ''}`}>
                            {!isSameSender && (
                                <span className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                    {isMe ? 'You' : titleToRender}
                                </span>
                            )}
                            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed transition-all hover:shadow-md ${
                                isMe 
                                    ? 'bg-[#0A66C2] text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                            }`}>
                                {msg.body}
                                {isMe && (
                                    <div className="flex justify-end mt-1">
                                        <CheckCheck className="w-3 h-3 text-blue-200" />
                                    </div>
                                )}
                            </div>
                            {(!isSameSender || idx === messagesToRender.length - 1) && (
                                <span className="text-[9px] text-gray-400 mt-1.5 font-medium">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            )}
                        </div>
                    )
                })
            )}

            {isCrispTyping && (
                <div className="flex items-center gap-2 text-gray-400 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <span className="text-[10px] font-medium ml-1">{profile.name} is typing...</span>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-[#E6E6E6]">
            <div className="flex items-center gap-2 mb-2 px-1">
                <button className="p-1.5 text-gray-500 hover:text-[#0A66C2] hover:bg-blue-50 rounded-full transition-all"><ImageIcon className="w-5 h-5" /></button>
                <button className="p-1.5 text-gray-500 hover:text-[#0A66C2] hover:bg-blue-50 rounded-full transition-all"><Paperclip className="w-5 h-5" /></button>
                <button className="p-1.5 text-gray-500 hover:text-[#0A66C2] hover:bg-blue-50 rounded-full transition-all"><Smile className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-2 items-end">
                <div className="flex-1 bg-[#F3F2EF] rounded-2xl px-4 py-3 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all shadow-inner focus-within:shadow-none">
                    <textarea 
                        className="w-full bg-transparent text-sm outline-none resize-none h-auto max-h-32 min-h-[20px] scrollbar-hide"
                        placeholder="Write a message..."
                        rows={1}
                        value={replyText}
                        onChange={(e) => {
                            setReplyText(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                                e.currentTarget.style.height = 'auto';
                            }
                        }}
                    />
                </div>
                <button 
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="bg-[#0A66C2] text-white p-3 rounded-full hover:bg-[#004182] disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <div className="flex justify-between items-center mt-3 px-1">
                <p className="text-[10px] text-gray-400">Professional networking works best with meaningful messages.</p>
                <button className="text-[11px] font-bold text-[#0A66C2] hover:underline">Messaging Tips</button>
            </div>
        </div>
      </div>

      {/* Right Sidebar: Context Panel (Desktop Only) */}
      <div className="hidden lg:flex w-64 bg-white rounded-lg border border-[#E6E6E6] shadow-sm flex-col p-6 items-center text-center">
        <div className="w-24 h-24 rounded-full border-4 border-[#F3F2EF] overflow-hidden mb-4 shadow-sm">
            <img src={isVisitorMode ? profile.avatarUrl : "https://ui-avatars.com/api/?name=V&background=random"} className="w-full h-full object-cover" alt="Profile" />
        </div>
        <h4 className="font-bold text-gray-900 mb-1">{isVisitorMode ? profile.name : (activeConversation?.visitorName || 'User')}</h4>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            {isVisitorMode ? profile.headline : 'Network Connection'}
        </p>
        
        <div className="w-full space-y-4 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Connection</span>
                <span className="text-xs font-semibold text-[#0A66C2]">1st Degree</span>
            </div>
            <div className="flex justify-between items-center text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Location</span>
                <span className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">{isVisitorMode ? profile.location : 'Global'}</span>
            </div>
            
            <button className="w-full py-2 border border-[#0A66C2] text-[#0A66C2] rounded-full font-bold text-xs hover:bg-blue-50 transition-colors">
                View Full Profile
            </button>
        </div>

        <div className="mt-auto pt-6 w-full text-center">
            <p className="text-[10px] text-gray-400">Secure end-to-end communication via LinkedIn Replacer.</p>
        </div>
      </div>
    </div>
  );
};

export default Messaging;