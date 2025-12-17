

export interface Experience {
  id: string;
  company: string;
  title: string;
  dates: string;
  location: string;
  description: string[];
  logoUrl?: string;
  employmentType?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  dates: string;
  logoUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stack: string[];
  link?: string;
}

export interface ProfileContent {
  name: string;
  headline: string;
  location: string;
  shortSummary: string;
  aboutLong: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  whatLookingFor: string[];
  contact: {
    email: string;
    githubUrl: string;
    whatsappLink?: string;
  };
  avatarUrl: string;
  coverUrl: string;
}

export enum MessageStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
  SPAM = 'SPAM'
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'visitor' | 'owner' | 'ai';
  body: string;
  createdAt: number;
  flags?: string[]; // 'spam', 'abusive'
}

export interface Conversation {
  id: string;
  visitorName: string; // "Recruiter from X" or "Visitor"
  visitorToken: string; // Simple unique ID for the session
  lastMessageSnippet: string;
  updatedAt: number;
  unreadCount: number;
  status: MessageStatus;
  messages: Message[];
  // Added createdAt property to satisfy type requirements in firebaseService.ts
  createdAt: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface SOCResult {
  code: string;
  title: string;
  confidence: number;
  reasoning: string[];
}