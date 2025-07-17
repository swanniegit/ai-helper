'use client'; // This is a Client Component

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'User' | 'AI Mentor';
  message: string;
}

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages: initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newUserMessage: Message = {
        id: `user-${Date.now()}`,
        sender: 'User',
        message: input.trim(),
      };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInput('');

      // Simulate AI response after a short delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          sender: 'AI Mentor',
          message: `(Mock Response) I received your message: "${newUserMessage.message}". How else can I assist?`,
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-md shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'User' ? 'justify-end animate-slideInRight' : 'justify-start animate-slideInLeft'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                msg.sender === 'User'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="font-semibold text-sm mb-1 opacity-90">
                {msg.sender === 'User' ? 'You' : 'AI Mentor'}
              </p>
              <p>{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow border border-gray-300 rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
        />
        <button
          type="submit"
          className="ml-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;