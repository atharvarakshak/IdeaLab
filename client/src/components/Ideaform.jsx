import React, { useState } from "react";

const IdeaForm = ({ onSubmit }) => {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(idea);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <textarea
        className="w-full p-4 border border-gray-300  shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Describe your idea (e.g., a platform for NGOs and volunteers)"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={4}
      />
      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Generate Landing Page
      </button>
    </form>
  );
};

export default IdeaForm;
