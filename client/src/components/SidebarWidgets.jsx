import { useState } from "react";

export const ScenarioGenerator = ({ onSubmit }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(input);
    setInput("");
  };

  return (
    <div className="widget">
      <h3>Scenario Generator</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What if we increase marketing budget by 50%?"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate
        </button>
      </form>
    </div>
  );
};

export const FinancialMetrics = ({ nodes }) => {
  const totalBudget = nodes.reduce(
    (sum, node) => sum + (node.data.budget || 0),
    0
  );
  const teamCost = nodes.reduce(
    (sum, node) => sum + (node.data.teamSize || 0) * 8000,
    0
  );

  return (
    <div className="widget">
      <h3>Financial Metrics</h3>
      <div className="metric">
        <span>Total Budget</span>
        <span>${totalBudget.toLocaleString()}</span>
      </div>
      <div className="metric">
        <span>Team Cost</span>
        <span>${teamCost.toLocaleString()}</span>
      </div>
    </div>
  );
};

export const AIInsightsPanel = ({ insights }) => {
  return (
    <div className="widget">
      <h3>AI Insights</h3>
      <div className="insights">
        {insights.map((insight, index) => (
          <div key={index} className="insight">
            <p>{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
