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
import FinancialInputForm from "./components/FinancialInputForm";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="fixed top-4 right-4"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}

export default function backup3() {
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

      // Transform the API response into the format expected by MarketCharts component
      const transformedChartData = {
        growthData: [
          {
            year: marketAnalysis.market_analysis.market_overview
              .total_market_size.year,
            size: marketAnalysis.market_analysis.market_overview
              .total_market_size.value,
          },
          {
            year: marketAnalysis.market_analysis.market_overview
              .total_market_size_projected.year,
            size: marketAnalysis.market_analysis.market_overview
              .total_market_size_projected.value,
          },
        ],
        segmentsData:
          marketAnalysis.market_analysis.market_overview.market_segments.map(
            (segment) => ({
              name: segment.segment_name,
              value: segment.segment_size,
            })
          ),
        competitiveData:
          marketAnalysis.market_analysis.competitive_landscape.market_share_distribution.map(
            (competitor) => ({
              name: competitor.competitor_name,
              share: competitor.market_share,
            })
          ),
        regionalData:
          marketAnalysis.market_analysis.regional_analysis.regions.map(
            (region) => ({
              region: region.region,
              size: region.market_size,
            })
          ),
      };

      setMarketChartData(transformedChartData);

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
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle>MVP Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              {roadmap.mvpSummary}
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
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
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
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

        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
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
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
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
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0 overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
              StartupLaunch
            </h1>
            <nav className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Analysis
                </h2>
                <div className="space-y-1">
                  <a
                    href="#overview"
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg"
                  >
                    <Target className="w-4 h-4" />
                    Overview
                  </a>
                  <a
                    href="#market"
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Market Analysis
                  </a>
                  <a
                    href="#competitors"
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg"
                  >
                    <ChartBar className="w-4 h-4" />
                    Competitors
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
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg"
                  >
                    <Target className="w-4 h-4" />
                    MVP Roadmap
                  </a>
                  <a
                    href="#landing"
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Landing Page
                  </a>
                  <a
                    href="#financial"
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg"
                  >
                    <DollarSign className="w-4 h-4" />
                    Financial Analysis
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Dashboard
                </h2>
                <ThemeToggle />
              </div>
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <form onSubmit={analyzeIdea} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Describe your startup idea
                      </label>
                      <Textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="Enter your startup idea here..."
                        className="min-h-[100px] w-full"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-black"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Lightbulb className="w-5 h-5 mr-2" />
                      )}
                      {loading ? "Analyzing..." : "Analyze Idea"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            {(response ||
              mvpRoadmap ||
              landingPageContent ||
              marketChartData) && (
              <div className="space-y-8">
                {/* Market Overview */}
                <section id="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Market Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {marketChartData && (
                        <MarketCharts data={marketChartData} />
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* MVP Roadmap */}
                {mvpRoadmap && (
                  <section id="mvp">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
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
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
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
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Financial Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FinancialAnalysis data={financialData} />
                      </CardContent>
                    </Card>
                  </section>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Card className="mt-8 border-red-200 bg-red-50 dark:bg-red-900/20">
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
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-[300px] bg-white/90 dark:bg-gray-900/90">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyzing your idea...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
