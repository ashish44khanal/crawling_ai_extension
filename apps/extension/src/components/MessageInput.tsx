import React from 'react';

interface Props {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
}

const MessageInput: React.FC<Props> = ({ input, setInput, onSend, disabled }) => {
  return (
    <div className="flex items-center p-4 border-t border-gray-700 bg-gray-800">
      <input
        type="text"
        value={input}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && onSend()}
        placeholder={disabled ? 'Waiting for response...' : 'Type your message...'}
        className="flex-1 bg-gray-700 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 disabled:opacity-50"
      />
      <button
        onClick={onSend}
        disabled={disabled}
        className="ml-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default MessageInput;
