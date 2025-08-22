// FinancialAnalysisInput.jsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"; // Import your Card components

const FinancialAnalysisInput = ({ onAnalyze }) => {
  const [formData, setFormData] = useState({
    initial_revenue: "",
    revenue_growth_rate: "",
    cogs_percentage: "",
    operating_expenses: "",
    initial_capital: "",
    customer_acquisition_cost: "",
    lifetime_value: "",
  });
  const [showForm, setShowForm] = useState(true); // State to control form visibility

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/financial_analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server error");
      }

      const data = await response.json();
      onAnalyze(data);
      setShowForm(false); // Hide the form after successful submission
    } catch (error) {
      console.error("Error fetching data:", error);
      // Display error message to the user (e.g., using an alert or state)
      alert("Error fetching data. Please check the console."); // Example alert
    }
  };

  return (
    <Card className={showForm ? "" : "hidden"}>
      {" "}
      {/* Conditionally hide the Card */}
      <CardHeader>
        <CardTitle>Financial Inputs</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {" "}
          {/* Added spacing */}
          <div className="grid grid-cols-2 gap-4">
            {" "}
            {/* Grid for better layout */}
            <div>
              <label
                htmlFor="initial_revenue"
                className="block text-sm font-medium text-gray-700"
              >
                Initial Revenue:
              </label>
              <input
                type="number"
                name="initial_revenue"
                value={formData.initial_revenue}
                onChange={handleChange}
                required
                className="mt-1 p-2 border  w-full"
              />
            </div>
            <div>
              <label
                htmlFor="revenue_growth_rate"
                className="block text-sm font-medium text-gray-700"
              >
                Revenue Growth Rate (%):
              </label>
              <input
                type="number"
                name="revenue_growth_rate"
                value={formData.revenue_growth_rate}
                onChange={handleChange}
                required
                className="mt-1 p-2 border  w-full"
              />
            </div>
            <div>
              <label
                htmlFor="cogs_percentage"
                className="block text-sm font-medium text-gray-700"
              >
                COGS Percentage (%):
              </label>
              <input
                type="number"
                name="cogs_percentage"
                value={formData.cogs_percentage}
                onChange={handleChange}
                required
                className="mt-1 p-2 border  w-full"
              />
            </div>
            <div>
              <label
                htmlFor="operating_expenses"
                className="block text-sm font-medium text-gray-700"
              >
                Operating Expenses:
              </label>
              <input
                type="number"
                name="operating_expenses"
                value={formData.operating_expenses}
                onChange={handleChange}
                required
                className="mt-1 p-2 border  w-full"
              />
            </div>
            <div>
              <label
                htmlFor="initial_capital"
                className="block text-sm font-medium text-gray-700"
              >
                Initial Capital:
              </label>
              <input
                type="number"
                name="initial_capital"
                value={formData.initial_capital}
                onChange={handleChange}
                required
                className="mt-1 p-2 border  w-full"
              />
            </div>
            <div>
              <label
                htmlFor="customer_acquisition_cost"
                className="block text-sm font-medium text-gray-700"
              >
                Customer Acquisition Cost:
              </label>
              <input
                type="number"
                name="customer_acquisition_cost"
                value={formData.customer_acquisition_cost}
                onChange={handleChange}
                required
                className="mt-1 p-2 border  w-full"
              />
            </div>
            <div>
              <label
                htmlFor="lifetime_value"
                className="block text-sm font-medium text-gray-700"
              >
                Lifetime Value:
              </label>
              <input
                type="number"
                name="lifetime_value"
                value={formData.lifetime_value}
                onChange={handleChange}
                required
                className="mt-1 p-2 border  w-full"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 "
          >
            Analyze
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancialAnalysisInput;
