import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ScrollArea } from "./components/ui/scroll-area";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Target,
  Lightbulb,
  DollarSign,
  Shield,
  ChartBar,
  ArrowUp,
  Moon,
  Sun,
} from "lucide-react";
import { ThemeProvider, useTheme } from "./components/ui/theme-provider";
import Editor from "./components/Editor";
import DownloadButton from "./components/DownloadButton";
import MarketCharts from "./components/MarketCharts";
import FinancialAnalysis from "./components/FinancialAnalysis";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="fixed top-4 right-4 z-50 glass-effect rounded-full w-12 h-12 hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-gray-700" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-500" />
      )}
    </Button>
  );
}

export default function CombinedDashboard() {
  const [idea, setIdea] = useState("");
  const [response, setResponse] = useState(null);
  const [landingPageContent, setLandingPageContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const [mvpRoadmap, setMvpRoadmap] = useState(null);
  const [marketChartData, setMarketChartData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [financialInputs, setFinancialInputs] = useState({
    initial_revenue: 100000,
    revenue_growth_rate: 0.5,
    cogs_percentage: 30,
    operating_expenses: 50000,
    initial_capital: 200000,
    monthly_burn_rate: 15000,
    customer_acquisition_cost: 500,
    lifetime_value: 2000,
  });
  const [showFinancialForm, setShowFinancialForm] = useState(false);

  const analyzeIdea = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setMvpRoadmap(null);
    setLandingPageContent(null);
    setMarketChartData(null);
    setFinancialData(null);

    try {
      // Step 1: Generate market research and analysis
      const researchResponse = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!researchResponse.ok) {
        const errorData = await researchResponse.json();
        throw new Error(errorData.detail || "Failed to analyze idea");
      }

      const data = await researchResponse.json();
      console.log("API Response:", data);
      setResponse(data);

      // Step 2: Generate MVP roadmap
      const mvpResponse = await fetch("http://localhost:8000/mvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!mvpResponse.ok) {
        const errorData = await mvpResponse.json();
        throw new Error(errorData.detail || "Failed to generate MVP roadmap");
      }
      const mvpData = await mvpResponse.json();
      setMvpRoadmap(mvpData);

      // Step 3: Generate landing page content
      const landingPageResponse = await fetch(
        "http://localhost:8000/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea }),
        }
      );

      if (!landingPageResponse.ok) {
        const errorData = await landingPageResponse.json();
        throw new Error(errorData.detail || "Failed to generate landing page");
      }
      const landingPageData = await landingPageResponse.json();
      setLandingPageContent(landingPageData);

      // Step 4: Generate market chart data - Updated to use /charts endpoint
      // Step 4: Generate market chart data - Updated to use /charts endpoint
      const chartResponse = await fetch("http://localhost:8000/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!chartResponse.ok) {
        const errorData = await chartResponse.json();
        throw new Error(
          errorData.detail || "Failed to fetch market charts data"
        );
      }

      const marketAnalysis = await chartResponse.json();

      // Check if marketAnalysis and its required properties exist
      if (marketAnalysis && marketAnalysis.market_analysis) {
        const { market_overview, competitive_landscape, regional_analysis } =
          marketAnalysis.market_analysis;

        const transformedChartData = {
          growthData: [],
          segmentsData: [],
          competitiveData: [],
          regionalData: [],
        };

        if (market_overview) {
          if (market_overview.total_market_size) {
            transformedChartData.growthData.push({
              year: parseFloat(market_overview.total_market_size.year || 0),
              size: parseFloat(market_overview.total_market_size.value || 0),
            });
          }
          if (market_overview.total_market_size_projected) {
            transformedChartData.growthData.push({
              year: parseFloat(
                market_overview.total_market_size_projected.year || 0
              ),
              size: parseFloat(
                market_overview.total_market_size_projected.value || 0
              ),
            });
          }

          if (Array.isArray(market_overview.market_segments)) {
            transformedChartData.segmentsData =
              market_overview.market_segments.map((segment) => ({
                name: segment.segment_name || "",
                value: parseFloat(segment.segment_size || 0),
              }));
          }
        }

        if (
          competitive_landscape &&
          Array.isArray(competitive_landscape.market_share_distribution)
        ) {
          transformedChartData.competitiveData =
            competitive_landscape.market_share_distribution.map(
              (competitor) => ({
                name: competitor.competitor_name || "",
                share: parseFloat(competitor.market_share || 0),
              })
            );
        }

        if (regional_analysis && Array.isArray(regional_analysis.regions)) {
          transformedChartData.regionalData = regional_analysis.regions.map(
            (region) => ({
              region: region.region || "",
              size: parseFloat(region.market_size || 0),
            })
          );
        }
        setMarketChartData(transformedChartData);
      } else {
        // Handle the case where data is missing or in unexpected structure.
        console.error(
          "Invalid or incomplete market chart data from API:",
          marketAnalysis
        );
        setError("Invalid market data received from the server.");
        setMarketChartData(null); // Ensure the component doesn't try to render with missing data.
      }
      // Add financial analysis fetch
      const financialResponse = await fetch(
        "http://localhost:8000/financial_analysis",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea,
            ...financialInputs,
          }),
        }
      );

      if (!financialResponse.ok) {
        const errorData = await financialResponse.json();
        throw new Error(
          errorData.detail || "Failed to generate financial analysis"
        );
      }
      const financialAnalysisData = await financialResponse.json();
      setFinancialData(financialAnalysisData);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
      setResponse(null);
      setMvpRoadmap(null);
      setLandingPageContent(null);
      setMarketChartData(null);
      setFinancialData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialAnalysis = async () => {
    setLoading(true);
    setError(null);
    setFinancialData(null);

    try {
      const financialResponse = await fetch(
        "http://localhost:8000/financial_analysis",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea,
            ...financialInputs,
          }),
        }
      );

      if (!financialResponse.ok) {
        const errorData = await financialResponse.json();
        throw new Error(
          errorData.detail || "Failed to generate financial analysis"
        );
      }
      const financialAnalysisData = await financialResponse.json();
      setFinancialData(financialAnalysisData);
    } catch (err) {
      console.error("Financial Analysis Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMvpRoadmap = (roadmap) => (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-6">
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
          <CardHeader>
            <CardTitle>MVP Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              {roadmap.mvpSummary}
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              {roadmap.targetAudience}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="features" className="space-y-6">
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {roadmap.keyFeatures.map((feature, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
          <CardHeader>
            <CardTitle>Technical Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {roadmap.technicalStack.map((tech, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {tech}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline" className="space-y-6">
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
          <CardHeader>
            <CardTitle>Development Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                Milestones:
              </h4>
              <ul className="space-y-2">
                {roadmap.timeline.milestones.map((milestone, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {milestone}
                  </li>
                ))}
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                Estimated Completion: {roadmap.timeline.estimatedCompletion}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  return (
    <ThemeProvider defaultTheme="light">
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Sidebar */}
        <div className="w-64 h-screen glass-effect border-r border-white/20 dark:border-gray-800/50 fixed left-0 top-0 overflow-y-auto z-10">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StartupLaunch
              </h1>
            </div>
            <nav className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Analysis
                </h2>
                <div className="space-y-1">
                  <a
                    href="#overview"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Overview</span>
                  </a>
                  <a
                    href="#validation"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    <ChartBar className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Validation Score</span>
                  </a>
                  <a
                    href="#market"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">Market Analysis</span>
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Planning
                </h2>
                <div className="space-y-1">
                  <a
                    href="#mvp"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    <Target className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">MVP Roadmap</span>
                  </a>
                  <a
                    href="#landing"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Landing Page</span>
                  </a>
                  <a
                    href="/finance"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">Financial Analysis</span>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <div className="p-8">
            {/* Top Bar with Input */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Dashboard
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Transform your ideas into reality</p>
                </div>
                <ThemeToggle />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-effect border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <form onSubmit={analyzeIdea} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Describe your startup idea
                        </label>
                        <Textarea
                          value={idea}
                          onChange={(e) => setIdea(e.target.value)}
                          placeholder="Enter your startup idea here... Let's build something amazing together! 💡"
                          className="min-h-[120px] w-full border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Analyzing your idea...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="w-5 h-5 mr-2" />
                            Analyze Idea
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            {/* Analysis Results */}
            {(response ||
              mvpRoadmap ||
              landingPageContent ||
              marketChartData) && (
              <div className="space-y-8">
                {/* Market Overview */}
                {response && (
                  <section
                    id="overview"
                    className="bg-white/80 dark:bg-gray-900/80 border-0 backdrop-blur-lg"
                  >
                    <Card>
                      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                          <Target className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          Strategic Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[calc(100vh - 100px )] pr-6">
                          <Tabs defaultValue="summary" className="w-full">
                            <TabsList className="grid w-full grid-cols-7 mb-8">
                              <TabsTrigger value="summary">Summary</TabsTrigger>
                              <TabsTrigger value="market">Market</TabsTrigger>
                              <TabsTrigger value="action">
                                Action Plan
                              </TabsTrigger>
                              <TabsTrigger value="risks">Risks</TabsTrigger>
                              <TabsTrigger value="revenue">Revenue</TabsTrigger>
                              <TabsTrigger value="competition">
                                Competition
                              </TabsTrigger>
                              <TabsTrigger value="next">Next Steps</TabsTrigger>
                            </TabsList>
                            {/* Tab Contents */}
                            <TabsContent value="summary" className="space-y-6">
                              <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Target className="w-6 h-6 text-blue-600" />
                                    Strategic Overview
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                                      {response.summary}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {Object.entries(
                                        response.dataHighlights
                                      ).map(([key, value]) => (
                                        <motion.div
                                          key={key}
                                          whileHover={{ scale: 1.05 }}
                                          className="p-6  bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50"
                                        >
                                          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                                            {key}
                                          </h3>
                                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {value}
                                          </p>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="market" className="space-y-6">
                              <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                    Market Analysis
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      className="p-6  bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50"
                                    >
                                      <div className="flex items-center gap-3 mb-4">
                                        <ChartBar className="w-6 h-6 text-green-600" />
                                        <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                                          Market Size
                                        </h3>
                                      </div>
                                      <p className="text-gray-700 dark:text-gray-300">
                                        {response.marketLandscape.marketSize}
                                      </p>
                                    </motion.div>
                                    <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      className="p-6  bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50"
                                    >
                                      <div className="flex items-center gap-3 mb-4">
                                        <TrendingUp className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                                          Growth Trends
                                        </h3>
                                      </div>
                                      <p className="text-gray-700 dark:text-gray-300">
                                        {response.marketLandscape.growthTrends}
                                      </p>
                                    </motion.div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="action" className="space-y-6">
                              <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    Action Steps
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {response.actionableSteps.map(
                                      (step, index) => (
                                        <motion.div
                                          key={index}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.1 }}
                                          className="flex items-start gap-4 p-4  bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30"
                                        >
                                          <div className="flex items-center justify-center w-8 h-8  bg-green-600 text-white font-bold">
                                            {index + 1}
                                          </div>
                                          <p className="text-gray-700 dark:text-gray-300">
                                            {step}
                                          </p>
                                        </motion.div>
                                      )
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="risks" className="space-y-6">
                              <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-amber-600" />
                                    Risk Assessment
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {response.marketLandscape.challenges.map(
                                      (challenge, index) => (
                                        <motion.div
                                          key={index}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.1 }}
                                          className="flex items-start gap-4 p-4  bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30"
                                        >
                                          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                          <p className="text-gray-700 dark:text-gray-300">
                                            {challenge}
                                          </p>
                                        </motion.div>
                                      )
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="revenue" className="space-y-6">
                              <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-6 h-6 text-purple-600" />
                                    Revenue Models
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {response.potentialBusinessModels.revenueModels.map(
                                      (model, index) => (
                                        <motion.div
                                          key={index}
                                          whileHover={{ scale: 1.02 }}
                                          className="p-6  bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50"
                                        >
                                          <div className="flex items-center gap-3 mb-3">
                                            <DollarSign className="w-6 h-6 text-purple-600" />
                                            <h3 className="font-semibold text-purple-700 dark:text-purple-400">
                                              Revenue Stream {index + 1}
                                            </h3>
                                          </div>
                                          <p className="text-gray-700 dark:text-gray-300">
                                            {model}
                                          </p>
                                        </motion.div>
                                      )
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent
                              value="competition"
                              className="space-y-6"
                            >
                              <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Target className="w-6 h-6 text-blue-600" />
                                    Competitive Analysis
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="p-6  bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50"
                                      >
                                        <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4">
                                          Direct Competitors
                                        </h4>
                                        <ul className="space-y-3">
                                          {response.competitorInsights.directCompetitors.map(
                                            (competitor, index) => (
                                              <li
                                                key={index}
                                                className="flex items-center gap-3"
                                              >
                                                <div className="w-2 h-2  bg-blue-400" />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                  {competitor}
                                                </span>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </motion.div>

                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="p-6  bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50"
                                      >
                                        <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-4">
                                          Indirect Competitors
                                        </h4>
                                        <ul className="space-y-3">
                                          {response.competitorInsights.indirectCompetitors.map(
                                            (competitor, index) => (
                                              <li
                                                key={index}
                                                className="flex items-center gap-3"
                                              >
                                                <div className="w-2 h-2  bg-indigo-400" />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                  {competitor}
                                                </span>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </motion.div>
                                    </div>

                                    <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      className="p-6  bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/50"
                                    >
                                      <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                        Market Gaps & Opportunities
                                      </h4>
                                      <p className="text-gray-700 dark:text-gray-300">
                                        {
                                          response.competitorInsights
                                            .gapsInSolutions
                                        }
                                      </p>
                                    </motion.div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="next" className="space-y-6">
                              <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                                    Next Steps & Recommendations
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-6">
                                    <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      className="p-6  bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50"
                                    >
                                      <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4">
                                        Key Recommendations
                                      </h4>
                                      <ul className="space-y-3">
                                        {response.keyInsights.map(
                                          (insight, index) => (
                                            <li
                                              key={index}
                                              className="flex items-start gap-3"
                                            >
                                              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                              <span className="text-gray-700 dark:text-gray-300">
                                                {insight}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </motion.div>

                                    <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      className="p-6  bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50"
                                    >
                                      <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4">
                                        Monetization Opportunities
                                      </h4>
                                      <ul className="space-y-3">
                                        {response.potentialBusinessModels.monetizationOpportunities.map(
                                          (opportunity, index) => (
                                            <li
                                              key={index}
                                              className="flex items-start gap-3"
                                            >
                                              <DollarSign className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                              <span className="text-gray-700 dark:text-gray-300">
                                                {opportunity}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </motion.div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          </Tabs>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </section>
                )}

                <section id="validation">
                  <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-yellow-600" />
                        Validation Score and Feasibility Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="p-6  bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50"
                        >
                          <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4">
                            Feasibility Analysis
                          </h4>
                          <div className="flex items-center gap-3 p-4  bg-white dark:bg-gray-800 shadow-md">
                            <span
                              className="text-xl font-bold"
                              style={{
                                color:
                                  response.feasibility.feasibilityScore < 5
                                    ? "red"
                                    : "green",
                              }}
                            >
                              Validation Score:
                            </span>
                            <span
                              className="text-2xl font-extrabold"
                              style={{
                                color:
                                  response.feasibility.feasibilityScore < 50
                                    ? "red"
                                    : "green",
                              }}
                            >
                              {response.feasibility.feasibilityScore}
                            </span>
                          </div>
                          <ul className="space-y-3 mt-3">
                            {response.feasibility.feasibilityRecommendations.map(
                              (insight, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {insight}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Market Overview Charts */}
                <section id="market">
                  <Card className="bg-white/80 dark:bg-gray-900/80 border-0 backdrop-blur-lg">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                        <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        Market Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {marketChartData && (
                        <MarketCharts data={marketChartData} />
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Market Overview Charts */}

                {/* MVP Roadmap */}
                {mvpRoadmap && (
                  <section id="mvp">
                    <Card className="bg-white/80 dark:bg-gray-900/80 border-0 backdrop-blur-lg">
                      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                          <Target className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          MVP Roadmap
                        </CardTitle>
                      </CardHeader>
                      <CardContent>{renderMvpRoadmap(mvpRoadmap)}</CardContent>
                    </Card>
                  </section>
                )}

                {/* Landing Page */}
                {landingPageContent && (
                  <section id="landing">
                    <Card className="bg-white/80 dark:bg-gray-900/80 border-0 backdrop-blur-lg">
                      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                          <Lightbulb className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          Landing Page Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Editor ref={iframeRef} content={landingPageContent} />
                        <div className="p-4">
                          <DownloadButton iframeRef={iframeRef} />
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* Financial Analysis */}
                {financialData && (
                  <section id="financial">
                    <Card className="bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl backdrop-blur-lg">
                      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                          <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          Financial Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 bg-white dark:bg-gray-900 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Estimated Initial Investment
                          </h3>

                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Raw Materials
                              </h4>
                              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency:
                                    response.financial_analysis.unit || "USD",
                                }).format(
                                  response.financial_analysis.raw_materials
                                )}
                              </p>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Manufacturing Costs
                              </h4>
                              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency:
                                    response.financial_analysis.unit || "USD",
                                }).format(
                                  response.financial_analysis
                                    .manufacturing_costs
                                )}
                              </p>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Equipment
                              </h4>
                              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency:
                                    response.financial_analysis.unit || "USD",
                                }).format(
                                  response.financial_analysis.equipment
                                )}
                              </p>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Investment
                              </h4>
                              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency:
                                    response.financial_analysis.unit || "USD",
                                }).format(response.financial_analysis.total)}
                              </p>
                            </div>
                          </div>

                          {/* <FinancialAnalysis data={financialData} /> */}
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}
              </div>
            )}
            {/* Error Display */}
            {error && (
              <Card className="mt-8 border-red-200 bg-red-50 dark:bg-red-900/20 backdrop-blur-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                        Analysis Error
                      </h3>
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="w-[350px] glass-effect border-0 shadow-2xl">
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                      <div className="absolute inset-0 w-12 h-12 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Analyzing your idea...
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        This may take a few moments
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </ThemeProvider>
  );
}
