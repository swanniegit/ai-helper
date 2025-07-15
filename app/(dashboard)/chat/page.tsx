// app/chat/page.tsx
import ChatWindow from './ChatWindow';
import { mockChatResponses } from './mockResponses';

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">AI Mentor Chat</h2>
      <div className="bg-white shadow-md rounded-lg p-6 h-[600px] flex flex-col">
        <ChatWindow messages={mockChatResponses} />
      </div>
    </div>
  );
}