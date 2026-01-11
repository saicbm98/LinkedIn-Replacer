// Fix: Corrected Firebase modular imports to resolve "no exported member" errors
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import type { FirebaseConfig, Conversation } from '../types';

let db: any = null;
let app: any = null;

// Fix: Initializing Firebase with modular SDK and checking for existing apps
export function initFirebase(config: FirebaseConfig): boolean {
  try {
    const existingApps = getApps();
    if (existingApps.length === 0) {
      app = initializeApp(config);
    } else {
      app = existingApps[0];
    }
    db = getFirestore(app);
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return false;
  }
}

// Fix: Real-time subscription to the conversations collection
export function subscribeToConversations(
  onUpdate: (conversations: Conversation[]) => void
): () => void {
  if (!db) return () => {};

  const conversationsRef = collection(db, 'conversations');
  const q = query(conversationsRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        visitorName: data.visitorName,
        visitorToken: data.visitorToken,
        lastMessageSnippet: data.lastMessageSnippet,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : (data.updatedAt || Date.now()),
        unreadCount: data.unreadCount || 0,
        status: data.status,
        messages: data.messages || [],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
      };
    }) as Conversation[];

    onUpdate(conversations);
  });
}

// Fix: Helper function to save a conversation to Firestore
export async function saveConversationToFirestore(conversation: Conversation) {
  if (!db) return;
  try {
    const conversationRef = doc(db, 'conversations', conversation.id);
    const firestoreData = {
      ...conversation,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.fromMillis(conversation.createdAt)
    };
    await setDoc(conversationRef, firestoreData);
  } catch (error) {
    console.error('❌ Failed to save conversation:', error);
  }
}

// Fix: Helper function to update an existing conversation in Firestore
export async function updateConversationInFirestore(conversation: Conversation) {
  if (!db) return;
  try {
    const conversationRef = doc(db, 'conversations', conversation.id);
    await updateDoc(conversationRef, {
      ...conversation,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('❌ Failed to update conversation:', error);
  }
}

// Fix: Checks if the Firestore database instance is initialized
export function isFirebaseInitialized(): boolean {
  return db !== null;
}