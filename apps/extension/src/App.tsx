import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { fetchDOM } from './utils/fetchDom';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

type ExtractedResult = {
  url: string;
  instruction: string;
  parsed_fields: string[];
  extracted: Record<string, string | string[]>;
  confidence: Record<string, number>;
  summary_response: string;
};

const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hello! I am a simple chatbot. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [activeTabUrl, setActiveTabUrl] = useState('');
  const [dom, setDom] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await fetchDOM();
        if (result) {
          setActiveTabUrl(result.url);
          setDom(result.dom);
        }
      } catch (error) {
        console.error('Error fetching tab info:', error);
      }
    })();
  }, []);

  // Auto-scroll when new messages appear
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const reqBody = { url: activeTabUrl, html: dom, instruction: input };

      const res = await axios.post<ExtractedResult>(
        'http://localhost:5000/api/rag/ingest',
        reqBody,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const botMessage: Message = {
        sender: 'bot',
        text: res.data.summary_response || 'No data extracted.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-[300px] bg-gray-900 text-white shadow-2xl overflow-hidden font-sans">
      <MessageList messages={messages} ref={messagesEndRef} loading={loading} />

      <MessageInput input={input} setInput={setInput} onSend={sendMessage} disabled={loading} />
    </div>
  );
};

export default App;
