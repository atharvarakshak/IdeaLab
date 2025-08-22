import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const MarketTrendsChart = ({ data }) => {
  const sampleData = [
    { month: "Jan", value: 1000 },
    { month: "Feb", value: 2000 },
    { month: "Mar", value: 1500 },
    { month: "Apr", value: 3000 },
    // Add more data points as needed
  ];

  return (
    <LineChart width={500} height={300} data={data || sampleData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  );
};

export default MarketTrendsChart;
