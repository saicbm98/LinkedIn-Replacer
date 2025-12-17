import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import type { FirebaseConfig, Conversation } from '../types';

let db: any = null;
let app: any = null;

export function initFirebase(config: FirebaseConfig): boolean {
  try {
    console.log('🔥 Initializing Firebase with config:', { projectId: config.projectId });
    
    // Check if Firebase is already initialized
    const existingApps = getApps();
    if (existingApps.length === 0) {
      app = initializeApp(config);
      console.log('✅ Firebase app initialized');
    } else {
      app = existingApps[0];
      console.log('✅ Firebase app already initialized');
    }
    
    db = getFirestore(app);
    console.log('✅ Firestore instance created');
    console.log('✅ Firebase initialized successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.error('Error details:', error.message);
    return false;
  }
}

export function subscribeToConversations(
  onUpdate: (conversations: Conversation[]) => void
): () => void {
  if (!db) {
    console.error('❌ Firestore not initialized');
    return () => {};
  }

  try {
    console.log('👂 Setting up Firestore listener...');
    
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`📦 Loaded ${snapshot.docs.length} conversations from Firestore`);
        
        const conversations: Conversation[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            visitorName: data.visitorName,
            visitorToken: data.visitorToken,
            lastMessageSnippet: data.lastMessageSnippet,
            updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt || Date.now(),
            unreadCount: data.unreadCount || 0,
            status: data.status,
            messages: data.messages || [],
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt || Date.now(),
          };
        }) as Conversation[];

        onUpdate(conversations);
      },
      (error) => {
        console.error('❌ Firestore listener error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Failed to set up Firestore listener:', error);
    return () => {};
  }
}

export async function saveConversationToFirestore(conversation: Conversation) {
  if (!db) {
    console.error('❌ Firestore not initialized');
    return;
  }

  try {
    const conversationRef = doc(db, 'conversations', conversation.id);
    
    const firestoreData = {
      visitorName: conversation.visitorName,
      visitorToken: conversation.visitorToken,
      lastMessageSnippet: conversation.lastMessageSnippet,
      unreadCount: conversation.unreadCount,
      status: conversation.status,
      messages: conversation.messages,
      createdAt: conversation.createdAt || Date.now(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(conversationRef, firestoreData);
    console.log('✅ Conversation saved to Firestore:', conversation.id);
  } catch (error) {
    console.error('❌ Failed to save conversation:', error);
    console.error('Error details:', error.message);
  }
}

export async function updateConversationInFirestore(conversation: Conversation) {
  if (!db) {
    console.error('❌ Firestore not initialized');
    return;
  }

  try {
    const conversationRef = doc(db, 'conversations', conversation.id);
    
    const firestoreUpdates: any = {
      visitorName: conversation.visitorName,
      visitorToken: conversation.visitorToken,
      lastMessageSnippet: conversation.lastMessageSnippet,
      unreadCount: conversation.unreadCount,
      status: conversation.status,
      messages: conversation.messages,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(conversationRef, firestoreUpdates);
    console.log('✅ Conversation updated in Firestore:', conversation.id);
  } catch (error) {
    console.error('❌ Failed to update conversation:', error);
    console.error('Error details:', error.message);
  }
}

export function isFirebaseInitialized(): boolean {
  return db !== null;
}