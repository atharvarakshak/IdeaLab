import { useState } from "react";
import ChatInterface from "../components/ChatInterface";

const suggestions = [
  "mental health tracking app",
  "freelace skill verification platform",
  "electric vehicle charging location",
];

export default function LandingPage() {
  const [chatStarted, setChatStarted] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      setChatStarted(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setChatStarted(true); // Start chat immediately after selecting a suggestion
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 text-gray-200">
      <header className="fixed top-0 left-0 p-4">
        <h1 className="text-3xl font-semibold text-blue-400">AI-Startup</h1>
      </header>

      {!chatStarted ? (
        <div className="mt-20 p-4">
          <form className="space-y-6">
            <textarea
              className="w-full p-4 bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={4}
              placeholder="Type your message here and press Enter..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown} // Trigger submit on Enter key
            />
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)} // Start chat immediately after clicking a suggestion
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>
        </div>
      ) : (
        <ChatInterface initialMessage={inputValue} />
      )}
    </div>
  );
}
