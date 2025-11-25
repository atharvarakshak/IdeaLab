import { useState } from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="fixed top-0 left-0 right-0 p-6 glass-effect border-b border-white/20 dark:border-gray-800/50 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Startup
          </h1>
        </div>
      </header>

      {!chatStarted ? (
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Transform Your Ideas Into Reality
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get comprehensive analysis, market insights, and actionable strategies for your startup idea
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form className="space-y-6">
                <div className="glass-effect rounded-2xl p-6 shadow-xl">
                  <textarea
                    className="w-full p-4 bg-white/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 resize-none"
                    rows={6}
                    placeholder="Describe your startup idea here... 💡"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="pt-24">
          <ChatInterface initialMessage={inputValue} />
        </div>
      )}
    </div>
  );
}
