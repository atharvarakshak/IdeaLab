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

export default function backup2() {
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
      <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950">
        <ThemeToggle />
        <div className="max-w-7xl mx-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-bold mb-4 text-black">
              Startup System
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Transform your innovative idea into a strategic masterplan
            </p>
          </motion.div>

          {/* Input Form Section */}
          <motion.form
            onSubmit={analyzeIdea}
            className="max-w-3xl mx-auto mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-4">
              <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Describe Your Vision
                  </CardTitle>
                  <CardDescription>
                    Share your business idea and let AI create your roadmap
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder=""
                    className="min-h-[150px] text-lg p-4"
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full text-black border border-black bg-black"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Loader2 className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        <Lightbulb className="w-5 h-5 mr-2" />
                        Analyze Vision
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </motion.form>

          {/* Financial Input Form */}
          {/* <FinancialInputForm
            financialInputs={financialInputs}
            setFinancialInputs={setFinancialInputs}
            onAnalyze={handleFinancialAnalysis}
            showForm={showFinancialForm}
            setShowForm={setShowFinancialForm}
          /> */}

          {/* Results Section */}
          {(response ||
            mvpRoadmap ||
            landingPageContent ||
            marketChartData) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {response && (
                <ScrollArea className="h-[calc(100vh-200px)] pr-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-7 mb-8">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="market">Market</TabsTrigger>
                      <TabsTrigger value="action">Action Plan</TabsTrigger>
                      <TabsTrigger value="risks">Risks</TabsTrigger>
                      <TabsTrigger value="revenue">Revenue</TabsTrigger>
                      <TabsTrigger value="competition">Competition</TabsTrigger>
                      <TabsTrigger value="next">Next Steps</TabsTrigger>
                    </TabsList>
                    {/* Tab Contents */}
                    <TabsContent value="overview" className="space-y-6">
                      <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
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
                              {Object.entries(response.dataHighlights).map(
                                ([key, value]) => (
                                  <motion.div
                                    key={key}
                                    whileHover={{ scale: 1.05 }}
                                    className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50"
                                  >
                                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                                      {key}
                                    </h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                      {value}
                                    </p>
                                  </motion.div>
                                )
                              )}
                            </div>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="market" className="space-y-6">
                      <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                            Market Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl mt-6">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <ChartBar className="w-6 h-6 text-blue-600" />
                                  Market Visualizations
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <MarketCharts
                                  marketData={{
                                    currentSize:
                                      response.marketLandscape.currentSize,
                                    projectedSize:
                                      response.marketLandscape.projectedSize,
                                  }}
                                />
                              </CardContent>
                            </Card>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50"
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
                              className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50"
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
                      <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            Action Steps
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {response.actionableSteps.map((step, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30"
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold">
                                  {index + 1}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                  {step}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="risks" className="space-y-6">
                      <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
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
                                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30"
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
                      <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
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
                                  className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50"
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
                    <TabsContent value="competition" className="space-y-6">
                      <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
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
                                className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50"
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
                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
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
                                className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50"
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
                                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
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
                              className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/50"
                            >
                              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                Market Gaps & Opportunities
                              </h4>
                              <p className="text-gray-700 dark:text-gray-300">
                                {response.competitorInsights.gapsInSolutions}
                              </p>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="next" className="space-y-6">
                      <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
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
                              className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50"
                            >
                              <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4">
                                Key Recommendations
                              </h4>
                              <ul className="space-y-3">
                                {response.keyInsights.map((insight, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-3"
                                  >
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                      {insight}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50"
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
                    </TabsContent>{" "}
                  </Tabs>
                </ScrollArea>
              )}

              {/* MVP Roadmap Section */}
              {mvpRoadmap && (
                <motion.div>{renderMvpRoadmap(mvpRoadmap)}</motion.div>
              )}

              {/* Market Charts Section */}
              {marketChartData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
                    Market Analysis Visualization
                  </h2>
                  <MarketCharts data={marketChartData} />
                </motion.div>
              )}

              {/* Landing Page Section */}
              {landingPageContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Generated Landing Page
                  </h2>
                  <Editor ref={iframeRef} content={landingPageContent} />
                  <DownloadButton iframeRef={iframeRef} />
                </motion.div>
              )}

              {/* Financial Analysis Section */}
              {financialData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
                    Financial Analysis
                  </h2>
                  <FinancialAnalysis data={financialData} />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Error Handling */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                        Analysis Error
                      </h3>
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <Card className="w-[300px] bg-white/90 dark:bg-gray-900/90">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="w-8 h-8 text-blue-600" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyzing your idea...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
