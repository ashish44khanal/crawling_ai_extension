import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface Props {
  messages: Message[];
  loading: boolean;
}

const MessageList = forwardRef<HTMLDivElement, Props>(({ messages, loading }, ref) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={ref}>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-scale`}
        >
          <div
            className={`max-w-[75%] rounded-lg py-2 px-4 shadow-md ${
              msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-700 rounded-lg py-2 px-4 shadow-md text-sm animate-pulse">
            Thinking...
          </div>
        </div>
      )}
    </div>
  );
});

export default MessageList;
