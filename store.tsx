import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ProfileContent, Conversation, Message, MessageStatus, FirebaseConfig } from './types.ts';
import { INITIAL_PROFILE, ADMIN_PASSWORD } from './constants.ts';
import { checkSpam } from './services/geminiService.ts';
import { initFirebase, subscribeToConversations, saveConversationToFirestore, updateConversationInFirestore } from './services/firebaseService.ts';

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
  
  // Crisp Integration
  crispMessages: Message[];
  isCrispTyping: boolean;
  sendCrispMessage: (text: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileContent>(() => {
    try {
      const stored = localStorage.getItem('lr_profile');
      return stored ? JSON.parse(stored) : INITIAL_PROFILE;
    } catch (e) {
      return INITIAL_PROFILE;
    }
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const stored = localStorage.getItem('lr_conversations');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Crisp specific state
  const [crispMessages, setCrispMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem('lr_crisp_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCrispTyping, setIsCrispTyping] = useState(false);

  const [currentUser, setCurrentUser] = useState<'visitor' | 'owner'>('visitor');
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('lr_admin_password') || ADMIN_PASSWORD);
  
  const [visitorToken] = useState(() => {
    const stored = localStorage.getItem('lr_visitor_token');
    if (stored) return stored;
    const newToken = 'visitor-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('lr_visitor_token', newToken);
    return newToken;
  });

  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfig | null>(() => {
      try {
          const stored = localStorage.getItem('lr_firebase_config');
          return stored ? JSON.parse(stored) : null;
      } catch (e) { return null; }
  });
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  const isMounted = useRef(false);

  // Initialize Firebase
  useEffect(() => {
      if (firebaseConfig) {
          const success = initFirebase(firebaseConfig);
          setIsFirebaseConnected(success);
          if (success) {
              const unsubscribe = subscribeToConversations((remoteConversations) => {
                  setConversations(remoteConversations);
              });
              return () => unsubscribe();
          }
      }
  }, [firebaseConfig]);

  // Persistence
  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem('lr_profile', JSON.stringify(profile));
      localStorage.setItem('lr_crisp_history', JSON.stringify(crispMessages));
      if (!isFirebaseConnected) {
        localStorage.setItem('lr_conversations', JSON.stringify(conversations));
      }
    } else {
      isMounted.current = true;
    }
  }, [profile, conversations, isFirebaseConnected, crispMessages]);

  // Crisp Listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).$crisp) {
      const handleMessageReceived = (message: any) => {
        const newMsg: Message = {
          id: message.fingerprint || Date.now().toString(),
          conversationId: 'crisp-live',
          senderType: 'owner', // In the eyes of the visitor, incoming Crisp is from owner
          body: message.content,
          createdAt: Date.now()
        };
        setCrispMessages(prev => [...prev, newMsg]);
        setIsCrispTyping(false);
      };

      const handleMessageSent = (message: any) => {
        const newMsg: Message = {
          id: message.fingerprint || Date.now().toString(),
          conversationId: 'crisp-live',
          senderType: 'visitor',
          body: message.content,
          createdAt: Date.now()
        };
        setCrispMessages(prev => [...prev, newMsg]);
      };

      const handleTyping = (state: string) => {
        setIsCrispTyping(true);
        setTimeout(() => setIsCrispTyping(false), 5000);
      };

      (window as any).$crisp.push(['on', 'message:received', handleMessageReceived]);
      (window as any).$crisp.push(['on', 'message:sent', handleMessageSent]);
      (window as any).$crisp.push(['on', 'chat:typing:received', handleTyping]);
    }
  }, []);

  const sendCrispMessage = (text: string) => {
    if ((window as any).$crisp) {
      (window as any).$crisp.push(['do', 'message:send', ['text', text]]);
    }
  };

  const setFirebaseConfig = (config: FirebaseConfig | null) => {
      setFirebaseConfigState(config);
      if (config) {
          localStorage.setItem('lr_firebase_config', JSON.stringify(config));
      } else {
          localStorage.removeItem('lr_firebase_config');
          setIsFirebaseConnected(false);
          const stored = localStorage.getItem('lr_conversations');
          setConversations(stored ? JSON.parse(stored) : []);
      }
  };

  const updateProfile = (newProfile: ProfileContent) => {
    setProfile(newProfile);
  };

  const logout = () => {
    setCurrentUser('visitor');
  };

  const verifyPassword = (input: string) => input === adminPassword;

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
    let flags: string[] = [];
    if (sender === 'visitor') {
      const spamCheck = await checkSpam(body);
      if (spamCheck.isSpam) flags.push('spam');
    }

    const now = Date.now();
    const newMessageId = `${now}-${Math.random().toString(36).substr(2, 5)}`;
    
    let existingConv = conversationId 
        ? conversations.find(c => c.id === conversationId)
        : conversations.find(c => c.visitorToken === visitorToken);

    const targetId = existingConv ? existingConv.id : now.toString();

    const newMessage: Message = {
      id: newMessageId,
      conversationId: targetId,
      senderType: sender,
      body,
      createdAt: now,
      flags
    };

    let updatedConv: Conversation;

    if (!existingConv) {
        const visitorName = visitorDetails?.name || 'Visitor';
        const emailSuffix = visitorDetails?.email ? ` (${visitorDetails.email})` : '';
        const displayName = sender === 'visitor' ? (visitorName + emailSuffix) : 'New Connection';

        updatedConv = {
            id: targetId,
            visitorName: displayName,
            visitorToken: visitorToken,
            lastMessageSnippet: body.substring(0, 40),
            updatedAt: now,
            unreadCount: sender === 'visitor' ? 1 : 0,
            status: flags.includes('spam') ? MessageStatus.SPAM : MessageStatus.UNREAD,
            messages: [newMessage],
            createdAt: now
        };
    } else {
        updatedConv = {
            ...existingConv,
            lastMessageSnippet: body.substring(0, 40),
            updatedAt: now,
            unreadCount: sender === 'visitor' ? existingConv.unreadCount + 1 : 0,
            messages: [...existingConv.messages, newMessage],
            status: sender === 'owner' ? MessageStatus.READ : existingConv.status
        };
    }

    if (isFirebaseConnected) {
        await saveConversationToFirestore(updatedConv);
    } else {
        setConversations(prev => {
            const others = prev.filter(c => c.id !== targetId);
            return [updatedConv, ...others];
        });
    }
    
    return targetId;
  };

  const markAsRead = (conversationId: string) => {
    const c = conversations.find(c => c.id === conversationId);
    if (c && c.unreadCount > 0) {
        const updated = { ...c, unreadCount: 0, status: MessageStatus.READ };
        if (isFirebaseConnected) {
            updateConversationInFirestore(updated);
        } else {
            setConversations(prev => prev.map(conv => conv.id === conversationId ? updated : conv));
        }
    }
  };

  const simulateOwnerReply = (conversationId: string) => {
    setTimeout(() => {
        sendMessage(conversationId, "Thanks for getting in touch! I've received your message and will check it out shortly.", 'owner');
    }, 1500);
  };

  const createTestConversation = () => {
    const testId = `demo-${Date.now()}`;
    const testConv: Conversation = {
        id: testId,
        visitorName: "Potential Lead (Demo)",
        visitorToken: `demo-token-${Math.random()}`,
        lastMessageSnippet: "I saw your portfolio on GitHub...",
        updatedAt: Date.now(),
        unreadCount: 1,
        status: MessageStatus.UNREAD,
        messages: [{
            id: 'm-test',
            conversationId: testId,
            senderType: 'visitor',
            body: "Hi! I really like your work on operations automation. Are you currently available for new projects?",
            createdAt: Date.now()
        }],
        createdAt: Date.now()
    };
    
    if (isFirebaseConnected) {
        saveConversationToFirestore(testConv);
    } else {
        setConversations(prev => [testConv, ...prev]);
    }
  };

  return (
    <StoreContext.Provider value={{
      profile, updateProfile, conversations, sendMessage, markAsRead,
      currentUser, setCurrentUser, logout, visitorToken, verifyPassword,
      changePassword, simulateOwnerReply, createTestConversation,
      firebaseConfig, setFirebaseConfig, isFirebaseConnected,
      crispMessages, isCrispTyping, sendCrispMessage
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