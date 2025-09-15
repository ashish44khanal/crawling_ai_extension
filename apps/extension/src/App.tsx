import axios from 'axios';
import { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ExtractedResult {
  url: string | null;
  instruction: string;
  parsed_fields: string[];
  extracted: Record<string, string | string[]>;
  confidence: Record<string, number>;
}

export interface ExtractedBlock {
  text: string;
  tag: string;
  headingContext?: string;
}

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
    async function getTabInfo() {
      try {
        const result = await fetchDOM();
        if (result) {
          setActiveTabUrl(result.url);
          setDom(result.dom);
        }
      } catch (error) {
        console.error('Error fetching tab info:', error);
      }
    }
    getTabInfo();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchDOM = async (): Promise<{ url: string; dom: string } | null> => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab?.id) return reject('No active tab');

        const url = activeTab.url || '';

        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            func: () => {
              const bodyHTML = document.body.innerHTML;
              const parser = new DOMParser();
              const doc = parser.parseFromString(bodyHTML, 'text/html');

              // Remove unwanted tags
              doc
                .querySelectorAll(
                  'script, style, noscript, svg,img,video,audio,iframe,header,footer,nav'
                )
                .forEach((el) => el.remove());
              // Remove comments
              doc.body.innerHTML = doc.body.innerHTML.replace(/<!--[\s\S]*?-->/g, '');

              // Remove elements with display:none
              doc.querySelectorAll('*').forEach((el) => {
                const style = window.getComputedStyle(el);
                if (style && style.display === 'none') el.remove();

                // Remove class attributes
                if (el.hasAttribute('class')) el.removeAttribute('class');
              });

              // Get cleaned HTML
              let cleanedHTML = doc.body.innerHTML;

              // Normalize whitespace
              cleanedHTML = cleanedHTML.replace(/\s+/g, ' ').trim();

              return cleanedHTML;
            },
          },
          (injectionResults) => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);

            if (injectionResults && injectionResults.length > 0) {
              const dom = injectionResults[0].result as string;
              resolve({ url, dom });
            } else {
              reject('No result from executeScript');
            }
          }
        );
      });
    });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    // Add user message immediately
    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setLoading(true);

    const reqBody = { url: activeTabUrl, html: dom, instruction: input };

    try {
      const res = await axios.post<ExtractedResult>(
        'http://localhost:5000/api/rag/ingest',
        reqBody,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const botMessage: Message = {
        sender: 'bot',
        text: res.data.extracted ? JSON.stringify(res.data.extracted) : 'No data extracted.',
      };
      // Add bot reply
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (err) {
      console.error('Error:', err);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-[300px] bg-gray-900 text-white  shadow-2xl overflow-hidden font-sans">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-scale`}
          >
            <div
              className={`max-w-[75%] rounded-lg py-2 px-4 shadow-md ${
                msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'
              } ${loading && index === messages.length - 1 && msg.sender === 'bot' ? 'opacity-50' : ''}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center p-4 border-t border-gray-700 bg-gray-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 bg-gray-700 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l.674-.261a1 1 0 001.134-.523l.186-.341L12 7.632l7.614-7.614a1 1 0 00-1.414-1.414L12.553 9.106a1 1 0 00-.523 1.134l-.341.186a1 1 0 00-.523 1.134l-.341.186L6.591 16.486a1 1 0 001.409 1.169l14-7a1 1 0 000-1.788l-14-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
