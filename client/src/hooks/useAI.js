import { useState } from "react";

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState([]);

  const generateScenario = async (input) => {
    setIsLoading(true);

    // Mock AI API call
    const mockResponse = await new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          nodes: [
            {
              id: node - ${ Date.now() },
            type: "decisionNode",
            position: { x: 100, y: 100 },
            data: {
              label: "Initial Decision",
              description: input,
              budget: 100000,
              teamSize: 5,
            },
            },
          ],
insights: [`
  Increasing marketing budget could lead to a 30 % boost in customer acquisition.,
  Consider improving conversion rates to maximize ROI.`,
],
        });
      }, 1000)
    );

setIsLoading(false);
setInsights(mockResponse.insights);
return mockResponse.nodes;
  };

return { generateScenario, insights, isLoading };
};