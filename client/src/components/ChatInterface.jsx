import { useState, useEffect, useRef } from "react";

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

  return (
    <div className="w-full max-w-4xl mx-auto text-black flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 text-white ${
                message.role === "user" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              {message.content}
              <div className="text-xs text-gray-400 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <SummaryComponent summary={summary} />{" "}
      {/* ✅ Passing summary to component */}
    </div>
  );
}

function SummaryComponent({ summary }) {
  return (
    <div className="p-4 bg-gray-100 text-black text-center">
      <h2 className="text-lg font-bold">Chat Summary</h2>
      <p>{summary || "No summary available yet."}</p>
    </div>
  );
}
