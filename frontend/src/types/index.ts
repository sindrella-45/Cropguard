export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  avatar: string;       // initials e.g. "JO"
  memberSince: string;
  crops: string[];
}

export interface Diagnosis {
  id: string;
  crop: string;
  cropEmoji: string;
  disease: string;
  severity: 'High' | 'Medium' | 'Low' | 'Healthy';
  confidence: number;
  date: string;
  plantPart: string;
  treatments: string[];
  prevention: string[];
}

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
