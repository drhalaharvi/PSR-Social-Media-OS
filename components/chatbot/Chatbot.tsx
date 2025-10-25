import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

// Define the structure of a chat message
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: inputValue };
    const userInput = inputValue; // Store the input value before clearing
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create the full history INCLUDING the new user message
      // This ensures the AI has the complete conversation context
      const fullHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const modelResponseText = await api.getChatbotResponse(userInput, fullHistory);
      const modelMessage: ChatMessage = { role: 'model', text: modelResponseText };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-brand-primary text-white p-4 rounded-full shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-transform transform hover:scale-110"
        aria-label="Open chat"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col h-[70vh] z-50 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 rounded-t-lg flex items-center">
             <Bot className="w-6 h-6 mr-3 text-brand-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && <Bot className="w-6 h-6 text-brand-secondary flex-shrink-0" />}
                  <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-brand-secondary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  {msg.role === 'user' && <User className="w-6 h-6 text-gray-500 flex-shrink-0" />}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                   <Bot className="w-6 h-6 text-brand-secondary flex-shrink-0" />
                   <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500"/>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-grow p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-brand-primary text-white p-2 rounded-lg hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;