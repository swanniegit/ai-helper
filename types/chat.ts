// types/chat.ts
export type Sender = 'AI Mentor' | 'User';

export interface Message {
  id: string;
  sender: Sender;
  message: string;
}