import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ProfileContent, Conversation, Message, MessageStatus } from './types';
import { INITIAL_PROFILE } from './constants';
import { checkSpam } from './services/geminiService';

interface StoreContextType {
  profile: ProfileContent;
  updateProfile: (newProfile: ProfileContent) => void;
  conversations: Conversation[];
  sendMessage: (conversationId: string | null, body: string, sender: 'visitor' | 'owner', visitorDetails?: { name?: string; email?: string }) => Promise<string>;
  markAsRead: (conversationId: string) => void;
  currentUser: 'visitor' | 'owner';
  setCurrentUser: (user: 'visitor' | 'owner') => void;
  visitorToken: string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy initialize state from localStorage to prevent overwriting with defaults on mount
  const [profile, setProfile] = useState<ProfileContent>(() => {
    try {
      const stored = localStorage.getItem('lr_profile');
      return stored ? JSON.parse(stored) : INITIAL_PROFILE;
    } catch (e) {
      console.error("Failed to load profile from storage", e);
      return INITIAL_PROFILE;
    }
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const stored = localStorage.getItem('lr_conversations');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load conversations from storage", e);
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<'visitor' | 'owner'>('visitor');
  
  // Initialize visitorToken from localStorage or create a new one
  const [visitorToken] = useState(() => {
    try {
      const stored = localStorage.getItem('lr_visitor_token');
      if (stored) return stored;
      const newToken = 'visitor-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('lr_visitor_token', newToken);
      return newToken;
    } catch (e) {
      return 'visitor-fallback-' + Date.now();
    }
  });

  // Ref to track if initial mount has happened to avoid double-saves in StrictMode if needed,
  // though lazy init solves the main overwrite issue.
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  // Listen for storage changes (simulating real-time sync between tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lr_conversations' && e.newValue) {
        setConversations(JSON.parse(e.newValue));
      }
      if (e.key === 'lr_profile' && e.newValue) {
        setProfile(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem('lr_profile', JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem('lr_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const updateProfile = (newProfile: ProfileContent) => {
    setProfile(newProfile);
    // Force immediate save for critical updates like images
    localStorage.setItem('lr_profile', JSON.stringify(newProfile));
  };

  const sendMessage = async (
    conversationId: string | null, 
    body: string, 
    sender: 'visitor' | 'owner',
    visitorDetails?: { name?: string; email?: string }
  ): Promise<string> => {
    // 1. Spam check for visitors
    let flags: string[] = [];
    if (sender === 'visitor') {
      const spamCheck = await checkSpam(body);
      if (spamCheck.isSpam) {
        flags.push('spam');
        if (spamCheck.reason) console.warn('Spam detected:', spamCheck.reason);
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: conversationId || '',
      senderType: sender,
      body,
      createdAt: Date.now(),
      flags
    };

    let targetConversationId = conversationId;
    let updatedConversations = [...conversations];

    if (!targetConversationId) {
      // Create new conversation
      targetConversationId = Date.now().toString();
      newMessage.conversationId = targetConversationId;
      
      const visitorName = visitorDetails?.name || 'Visitor';
      const emailSuffix = visitorDetails?.email ? ` (${visitorDetails.email})` : '';
      const displayName = sender === 'visitor' ? (visitorName + emailSuffix) : 'Unknown';

      const newConversation: Conversation = {
        id: targetConversationId,
        visitorName: displayName,
        visitorToken: visitorToken,
        lastMessageSnippet: body.substring(0, 30) + '...',
        updatedAt: Date.now(),
        unreadCount: 1,
        status: flags.includes('spam') ? MessageStatus.SPAM : MessageStatus.UNREAD,
        messages: [newMessage]
      };
      
      updatedConversations = [newConversation, ...updatedConversations];
    } else {
      // Update existing
      updatedConversations = updatedConversations.map(c => {
        if (c.id === targetConversationId) {
          return {
            ...c,
            lastMessageSnippet: body.substring(0, 30) + '...',
            updatedAt: Date.now(),
            unreadCount: sender === 'visitor' ? c.unreadCount + 1 : c.unreadCount,
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      });
    }
    
    setConversations(updatedConversations);
    localStorage.setItem('lr_conversations', JSON.stringify(updatedConversations));
    return targetConversationId;
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => {
        const updated = prev.map(c => 
            c.id === conversationId ? { ...c, unreadCount: 0, status: MessageStatus.READ } : c
        );
        localStorage.setItem('lr_conversations', JSON.stringify(updated));
        return updated;
    });
  };

  return (
    <StoreContext.Provider value={{
      profile,
      updateProfile,
      conversations,
      sendMessage,
      markAsRead,
      currentUser,
      setCurrentUser,
      visitorToken
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};