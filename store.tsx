
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ProfileContent, Conversation, Message, MessageStatus, FirebaseConfig } from './types';
import { INITIAL_PROFILE, ADMIN_PASSWORD } from './constants';
import { checkSpam } from './services/geminiService';
import { initFirebase, subscribeToConversations, saveConversationToFirestore, updateConversationInFirestore } from './services/firebaseService';

interface StoreContextType {
  profile: ProfileContent;
  updateProfile: (newProfile: ProfileContent) => void;
  conversations: Conversation[];
  sendMessage: (conversationId: string | null, body: string, sender: 'visitor' | 'owner', visitorDetails?: { name?: string; email?: string }) => Promise<string>;
  markAsRead: (conversationId: string) => void;
  currentUser: 'visitor' | 'owner';
  setCurrentUser: (user: 'visitor' | 'owner') => void;
  logout: () => void;
  visitorToken: string;
  verifyPassword: (password: string) => boolean;
  changePassword: (newPass: string) => void;
  simulateOwnerReply: (conversationId: string) => void;
  createTestConversation: () => void;
  firebaseConfig: FirebaseConfig | null;
  setFirebaseConfig: (config: FirebaseConfig | null) => void;
  isFirebaseConnected: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy initialize state from localStorage
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
  
  // Password State
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('lr_admin_password') || ADMIN_PASSWORD;
  });

  // Visitor Token
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

  // Firebase State
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfig | null>(() => {
      try {
          const stored = localStorage.getItem('lr_firebase_config');
          return stored ? JSON.parse(stored) : null;
      } catch (e) { return null; }
  });
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  const isMounted = useRef(false);

  // Initialize Firebase if config exists
  useEffect(() => {
      if (firebaseConfig) {
          const success = initFirebase(firebaseConfig);
          setIsFirebaseConnected(success);
          
          if (success) {
              // Subscribe to real-time updates
              const unsubscribe = subscribeToConversations((remoteConversations) => {
                  setConversations(remoteConversations);
                  // Update local storage as backup/cache
                  localStorage.setItem('lr_conversations', JSON.stringify(remoteConversations));
              });
              return () => unsubscribe();
          }
      } else {
          setIsFirebaseConnected(false);
      }
  }, [firebaseConfig]);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  // Sync profile to local storage (Profile is typically static, not syncing to Firebase in this version for simplicity, 
  // but in a full app you'd sync this too. For now we assume Owner uses one device to edit profile.)
  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem('lr_profile', JSON.stringify(profile));
    }
  }, [profile]);

  // Sync conversations to local storage (as backup or for Demo mode)
  useEffect(() => {
    if (isMounted.current && !isFirebaseConnected) {
      localStorage.setItem('lr_conversations', JSON.stringify(conversations));
    }
  }, [conversations, isFirebaseConnected]);

  const setFirebaseConfig = (config: FirebaseConfig | null) => {
      setFirebaseConfigState(config);
      if (config) {
          localStorage.setItem('lr_firebase_config', JSON.stringify(config));
      } else {
          localStorage.removeItem('lr_firebase_config');
          setIsFirebaseConnected(false);
      }
  };

  const updateProfile = (newProfile: ProfileContent) => {
    setProfile(newProfile);
    localStorage.setItem('lr_profile', JSON.stringify(newProfile));
  };

  const logout = () => {
    setCurrentUser('visitor');
  };

  const verifyPassword = (input: string) => {
      return input === adminPassword;
  };

  const changePassword = (newPass: string) => {
      setAdminPassword(newPass);
      localStorage.setItem('lr_admin_password', newPass);
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
    let newConversationObj: Conversation | null = null;
    let updatedConversationObj: Conversation | null = null;

    if (!targetConversationId) {
      // Create new conversation
      targetConversationId = Date.now().toString();
      newMessage.conversationId = targetConversationId;
      
      const visitorName = visitorDetails?.name || 'Visitor';
      const emailSuffix = visitorDetails?.email ? ` (${visitorDetails.email})` : '';
      const displayName = sender === 'visitor' ? (visitorName + emailSuffix) : 'Unknown';

      // Added createdAt property to satisfy Conversation interface requirements
      newConversationObj = {
        id: targetConversationId,
        visitorName: displayName,
        visitorToken: visitorToken,
        lastMessageSnippet: body.substring(0, 30) + '...',
        updatedAt: Date.now(),
        unreadCount: 1,
        status: flags.includes('spam') ? MessageStatus.SPAM : MessageStatus.UNREAD,
        messages: [newMessage],
        createdAt: Date.now()
      };
    }

    // Logic for updating state depending on mode
    if (isFirebaseConnected) {
         if (newConversationObj) {
             await saveConversationToFirestore(newConversationObj);
         } else {
             // Find existing to update
             const existing = conversations.find(c => c.id === targetConversationId);
             if (existing) {
                 updatedConversationObj = {
                    ...existing,
                    lastMessageSnippet: body.substring(0, 30) + '...',
                    updatedAt: Date.now(),
                    unreadCount: sender === 'visitor' ? existing.unreadCount + 1 : existing.unreadCount,
                    messages: [...existing.messages, newMessage]
                 };
                 await updateConversationInFirestore(updatedConversationObj);
             }
         }
    } else {
        // Local Storage Mode
        let updatedConversations = [...conversations];
        if (newConversationObj) {
            updatedConversations = [newConversationObj, ...updatedConversations];
        } else {
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
    }
    
    return targetConversationId as string;
  };

  const markAsRead = (conversationId: string) => {
    if (isFirebaseConnected) {
        const c = conversations.find(c => c.id === conversationId);
        if (c && c.unreadCount > 0) {
            updateConversationInFirestore({ ...c, unreadCount: 0, status: MessageStatus.READ });
        }
    } else {
        setConversations(prev => {
            const updated = prev.map(c => 
                c.id === conversationId ? { ...c, unreadCount: 0, status: MessageStatus.READ } : c
            );
            return updated;
        });
    }
  };

  // --- Demo Simulation Functions ---
  const simulateOwnerReply = (conversationId: string) => {
    setTimeout(() => {
        sendMessage(conversationId, "Thanks for reaching out! I'll get back to you shortly. (This is an automated demo reply)", 'owner');
    }, 1500);
  };

  const createTestConversation = () => {
    const testId = Date.now().toString();
    const testMessage: Message = {
        id: Date.now().toString(),
        conversationId: testId,
        senderType: 'visitor',
        body: "Hi! I'm a recruiter from TechCorp. Are you open to new roles?",
        createdAt: Date.now()
    };
    
    // Added createdAt property to satisfy Conversation interface requirements
    const testConv: Conversation = {
        id: testId,
        visitorName: "Recruiter (Demo)",
        visitorToken: 'demo-token',
        lastMessageSnippet: "Hi! I'm a recruiter from Tech...",
        updatedAt: Date.now(),
        unreadCount: 1,
        status: MessageStatus.UNREAD,
        messages: [testMessage],
        createdAt: Date.now()
    };
    
    if (isFirebaseConnected) {
        saveConversationToFirestore(testConv);
    } else {
        const updated = [testConv, ...conversations];
        setConversations(updated);
    }
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
      logout,
      visitorToken,
      verifyPassword,
      changePassword,
      simulateOwnerReply,
      createTestConversation,
      firebaseConfig,
      setFirebaseConfig,
      isFirebaseConnected
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