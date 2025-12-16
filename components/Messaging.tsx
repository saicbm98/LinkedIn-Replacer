import React, { useState } from 'react';
import { useStore } from '../store';
import { MessageStatus } from '../types';
import { Search, MoreVertical, Send, ShieldAlert, Archive } from 'lucide-react';

const Messaging: React.FC = () => {
  const { conversations, currentUser, markAsRead, sendMessage, visitorToken } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filter conversations based on view
  const visibleConversations = currentUser === 'owner' 
    ? conversations 
    : conversations.filter(c => c.visitorToken === visitorToken);

  const activeConversation = visibleConversations.find(c => c.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (currentUser === 'owner') {
      markAsRead(id);
    }
  };

  const handleSend = async () => {
    if (!selectedId || !replyText.trim()) return;
    await sendMessage(selectedId, replyText, currentUser);
    setReplyText('');
  };

  // If visitor has no messages
  if (currentUser === 'visitor' && visibleConversations.length === 0) {
      return (
          <div className="max-w-7xl mx-auto p-8 text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
              <p>Start a conversation from the profile page.</p>
          </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4 py-6 h-[calc(100vh-60px)]">
      <div className="bg-white rounded-lg border border-[#E6E6E6] shadow-sm grid grid-cols-1 md:grid-cols-3 h-full overflow-hidden">
        
        {/* Left List */}
        <div className={`border-r border-[#E6E6E6] flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 border-b border-[#E6E6E6]">
            <div className="relative">
                <Search className="absolute left-3 top-2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search messages" 
                    className="w-full bg-[#EDF3F8] pl-10 pr-4 py-1.5 rounded text-sm outline-none focus:border-[#0A66C2] border border-transparent"
                />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {visibleConversations.map(conv => {
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                <div 
                    key={conv.id} 
                    onClick={() => handleSelect(conv.id)}
                    className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedId === conv.id ? 'bg-[#EDF3F8] border-[#0A66C2]' : 'border-transparent'
                    } ${conv.unreadCount > 0 && currentUser === 'owner' ? 'bg-blue-50/50' : ''}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`font-semibold text-sm ${conv.unreadCount > 0 ? 'text-black' : 'text-gray-700'}`}>
                            {conv.visitorName}
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date(conv.updatedAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-black font-medium' : 'text-gray-500'}`}>
                        {lastMsg?.senderType === currentUser ? 'You: ' : ''}{conv.lastMessageSnippet}
                    </p>
                    {conv.status === MessageStatus.SPAM && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-100 text-red-800 text-[10px] rounded">Spam Detected</span>
                    )}
                </div>
            )})}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className={`col-span-1 md:col-span-2 flex flex-col ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
            {activeConversation ? (
                <>
                    {/* Header */}
                    <div className="p-3 border-b border-[#E6E6E6] flex justify-between items-center bg-white z-10">
                        <div className="flex items-center gap-3">
                            <button className="md:hidden mr-2" onClick={() => setSelectedId(null)}>←</button>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-sm text-[#1A1A1A]">{activeConversation.visitorName}</h3>
                                {currentUser === 'owner' && (
                                     <span className="text-xs text-gray-500">Visitor Token: {activeConversation.visitorToken.substr(0,8)}...</span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 text-gray-500">
                             <MoreVertical className="w-5 h-5 cursor-pointer hover:text-black" />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F3F2EF]">
                        {activeConversation.messages.map(msg => {
                            const isMe = msg.senderType === currentUser;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[75%] rounded-lg p-3 text-sm shadow-sm ${
                                        isMe ? 'bg-[#0A66C2] text-white rounded-br-none' : 'bg-white text-[#1A1A1A] rounded-bl-none'
                                    }`}>
                                        {msg.body}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {currentUser === 'owner' && msg.flags?.includes('spam') && (
                                         <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                            <ShieldAlert className="w-3 h-3" /> Potential Spam
                                         </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-[#E6E6E6]">
                        <div className="relative">
                            <textarea 
                                className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm focus:ring-1 focus:ring-[#0A66C2] outline-none resize-none h-24"
                                placeholder="Write a message..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                <button 
                                    onClick={handleSend}
                                    disabled={!replyText.trim()}
                                    className="bg-[#0A66C2] text-white p-2 rounded-full hover:bg-[#004182] disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Send className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="text-lg">Select a conversation</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;