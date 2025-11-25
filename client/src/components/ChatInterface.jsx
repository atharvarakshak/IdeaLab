import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function ChatInterface({ initialMessage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [summary, setSummary] = useState(""); // ✅ Store summary
  const messagesEndRef = useRef(null);
  const firstMessageSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage && !firstMessageSent.current) {
      firstMessageSent.current = true;
      handleSendMessage(initialMessage);
    }
  }, []);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading || isConversationEnded) return;

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear input after sending

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get response from the chatbot.");
      }

      const data = await response.json();
      setSessionId(data.session_id);

      const botMessage = {
        role: "bot",
        content: data.chatbot_response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);

      console.log("Chatbot last message:", data.chatbot_response); // ✅ Logging summary
      setSummary(data.chatbot_response); // ✅ Store the last chatbot response as summary

      if (data.end_conversation) {
        setIsConversationEnded(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isConversationEnded) {
      handleSendMessage(input);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)] px-4">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-2xl shadow-lg ${
                message.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "glass-effect text-gray-800 dark:text-gray-200"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <div className={`text-xs mt-2 ${
                message.role === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-effect p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {!isConversationEnded && (
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-3 items-end">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || isConversationEnded}
              className="flex-1 px-4 py-3 glass-effect rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
            />
            <motion.button
              type="submit"
              disabled={isLoading || isConversationEnded || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </motion.button>
          </div>
        </form>
      )}
      <SummaryComponent summary={summary} />
    </div>
  );
}

function SummaryComponent({ summary }) {
  if (!summary) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 glass-effect rounded-2xl shadow-xl border-t border-white/20 dark:border-gray-800/50"
    >
      <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Chat Summary
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
    </motion.div>
  );
}
