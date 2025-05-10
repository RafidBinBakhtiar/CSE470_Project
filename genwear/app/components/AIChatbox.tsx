'use client';

import { useState, useRef, useEffect } from 'react';

interface AIChatboxProps {
  onImageGenerated?: (imageUrl: string) => void;
}

export default function AIChatbox({ onImageGenerated }: AIChatboxProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; imageUrl?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageGeneration = async (prompt: string) => {
    try {
      setIsGeneratingImage(true);
      setError(null);
      
      // Add a message to indicate that image generation has started
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m generating your design. This may take a moment...'
      }]);
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }
      
      if (!data.imageUrl) {
        throw new Error('No image URL received from the server');
      }

      // Remove the "generating" message
      setMessages(prev => prev.slice(0, -1));
      
      // Add the generated image to the chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Here\'s your generated design:',
        imageUrl: data.imageUrl
      }]);

      // Notify parent component about the new image
      if (onImageGenerated) {
        onImageGenerated(data.imageUrl);
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      
      // Remove the "generating" message if it exists
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.content.includes('generating your design')) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error while generating the image: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again with a different prompt.`
      }]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Check if the user is requesting an image
      const isImageRequest = userMessage.toLowerCase().includes('generate') || 
                            userMessage.toLowerCase().includes('create') ||
                            userMessage.toLowerCase().includes('make') ||
                            userMessage.toLowerCase().includes('show') ||
                            userMessage.toLowerCase().includes('draw') ||
                            userMessage.toLowerCase().includes('picture') ||
                            userMessage.toLowerCase().includes('texture') ||
                            userMessage.toLowerCase().includes('pattern') ||
                            userMessage.toLowerCase().includes('design');
      
      if (isImageRequest) {
        // Extract the image prompt from the user message
        let imagePrompt = userMessage;
        
        // Remove common request phrases to get a cleaner prompt
        imagePrompt = imagePrompt.replace(/generate|create|make|show|draw|picture of|texture of|pattern of|design of/gi, '');
        
        // Generate the image
        await handleImageGeneration(imagePrompt);
      } else {
        // Regular text response
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              ...messages.map(msg => ({ role: msg.role, content: msg.content })),
              { role: 'user', content: userMessage }
            ]
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get response from AI');
        }

        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="h-64 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
              {message.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={message.imageUrl} 
                    alt="Generated design" 
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {(isLoading || isGeneratingImage) && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
              {isGeneratingImage ? 'Generating your design...' : 'Thinking...'}
            </div>
          </div>
        )}
        {error && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-red-100 text-red-800">
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for design help or type 'generate a texture with...' to create a custom texture"
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isGeneratingImage}
        />
        <button
          type="submit"
          disabled={isLoading || isGeneratingImage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
} 