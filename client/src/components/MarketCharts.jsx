import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const MarketCharts = ({ data }) => {
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const regionalChartRef = useRef(null);

  const lineChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const barChartInstance = useRef(null);
  const regionalChartInstance = useRef(null);

  useEffect(() => {
    if (!data) return;

    // Line Chart
    if (data.growthData && lineChartRef.current) {
      const lineChartCtx = lineChartRef.current.getContext("2d");
      if (lineChartCtx) {
        if (lineChartInstance.current) {
          lineChartInstance.current.destroy();
        }
        lineChartInstance.current = new Chart(lineChartCtx, {
          type: "line",
          data: {
            labels: data.growthData.map((item) => item.year),
            datasets: [
              {
                label: "Market Size (USD Billion)",
                data: data.growthData.map((item) => item.size),
                borderColor: "rgba(136, 132, 216, 1)",
                backgroundColor: "rgba(136, 132, 216, 0.1)",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  color: "rgba(200,200,200, 0.2)",
                },
              },
              y: {
                grid: {
                  color: "rgba(200,200,200, 0.2)",
                },
              },
            },
          },
        });
      }
    }

    // Pie Chart
    if (data.segmentsData && pieChartRef.current) {
      const pieChartCtx = pieChartRef.current.getContext("2d");
      if (pieChartCtx) {
        if (pieChartInstance.current) {
          pieChartInstance.current.destroy();
        }
        pieChartInstance.current = new Chart(pieChartCtx, {
          type: "pie",
          data: {
            labels: data.segmentsData.map((item) => item.name),
            datasets: [
              {
                data: data.segmentsData.map((item) => item.value),
                backgroundColor: [
                  "rgba(136, 132, 216, 0.8)",
                  "rgba(136, 132, 216, 0.6)",
                  "rgba(136, 132, 216, 0.4)",
                  "rgba(136, 132, 216, 0.2)",
                ],
                borderColor: "transparent",
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          },
        });
      }
    }

    // Bar Chart
    if (data.competitiveData && barChartRef.current) {
      const barChartCtx = barChartRef.current.getContext("2d");
      if (barChartCtx) {
        if (barChartInstance.current) {
          barChartInstance.current.destroy();
        }
        barChartInstance.current = new Chart(barChartCtx, {
          type: "bar",
          data: {
            labels: data.competitiveData.map((item) => item.name),
            datasets: [
              {
                label: "Market Share (%)",
                data: data.competitiveData.map((item) => item.share),
                backgroundColor: "rgba(130, 202, 157, 0.8)",
                borderColor: "transparent",
                borderRadius: 5,
              },
            ],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  color: "rgba(200,200,200, 0.2)",
                },
              },
              y: {
                grid: {
                  color: "rgba(200,200,200, 0.2)",
                },
              },
            },
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          },
        });
      }
    }

    // Regional Analysis Bar Chart
    if (data.regionalData && regionalChartRef.current) {
      const regionalChartCtx = regionalChartRef.current.getContext("2d");
      if (regionalChartCtx) {
        if (regionalChartInstance.current) {
          regionalChartInstance.current.destroy();
        }
        regionalChartInstance.current = new Chart(regionalChartCtx, {
          type: "bar",
          data: {
            labels: data.regionalData.map((item) => item.region),
            datasets: [
              {
                label: "Market Size (USD Billion)",
                data: data.regionalData.map((item) => item.size),
                backgroundColor: "rgba(255, 198, 88, 0.8)",
                borderColor: "transparent",
                borderRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  color: "rgba(200,200,200, 0.2)",
                },
              },
              y: {
                grid: {
                  color: "rgba(200,200,200, 0.2)",
                },
              },
            },
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          },
        });
      }
    }
  }, [data]);

  if (!data) return null;

  // Add data validation
  const hasValidData =
    data.growthData &&
    data.segmentsData &&
    data.competitiveData &&
    data.regionalData;

  if (!hasValidData) {
    console.error("Invalid market chart data structure:", data);
    return <div>Error: Invalid market data structure</div>;
  }

  return (
    <motion.div
      className="space-y-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg  p-8 shadow-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="h-[400px]">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Market Growth Projection
        </h3>
        <canvas ref={lineChartRef} />
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div className="h-[400px]">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Market Segments
          </h3>
          <canvas ref={pieChartRef} />
        </motion.div>
        <motion.div className="h-[400px]">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Competitive Landscape
          </h3>
          <canvas ref={barChartRef} />
        </motion.div>

        <motion.div className="h-[400px]">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Regional Analysis
          </h3>
          <canvas ref={regionalChartRef} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MarketCharts;
