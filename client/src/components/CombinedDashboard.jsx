import React, { useState, useEffect } from 'react';
import FinancialAnalysisInput from './FinancialAnalysisInput';
import FinancialAnalysis from './FinancialAnalysis';

const CombinedDashboard = () => {
  const [financialData, setFinancialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null);      // Add error state

  const handleAnalyze = async (data) => {
    setIsLoading(true); // Set loading to true before fetching

    try {
      setFinancialData(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message); // Set the error message
      setFinancialData(null); // Clear any previous data
      console.error("Error in handleAnalyze:", err);
    } finally {
      setIsLoading(false); // Set loading to false after fetch completes
    }
  };



  return (
    <div>
      <FinancialAnalysisInput onAnalyze={handleAnalyze} />

      {isLoading && <div>Loading...</div>} {/* Display loading indicator */}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>} {/* Display error message */}

      {financialData && <FinancialAnalysis data={financialData} />}
    </div>
  );
};

export default CombinedDashboard;