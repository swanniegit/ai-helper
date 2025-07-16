import AIMentorChat from '../../../components/AIMentorChat';

export default function MentorChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">AI Career Mentor</h1>
          <p className="text-gray-600 mt-1">
            Get personalized career guidance, code reviews, and daily motivation
          </p>
        </div>
      </div>
      
      <div className="flex-1 max-w-7xl mx-auto w-full">
        <AIMentorChat />
      </div>
    </div>
  );
} 