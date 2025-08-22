import { useState } from "react";
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
} from "lucide-react";

export default function App() {
  const [idea, setIdea] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeIdea = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!res.ok) throw new Error("Failed to analyze idea");

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRoadmapStep = (number, title, content, icon) => (
    <div className="relative flex items-start mb-12 group">
      <div className="absolute left-5 h-full w-0.5 bg-gradient-to-b from-blue-500 to-transparent -z-10" />
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="ml-8 flex-1">
        <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          {title}
        </h3>
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.15)] transition-all">
          {content}
        </div>
      </div>
    </div>
  );

  const renderKeyMetrics = (metrics) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
      {Object.entries(metrics).map(([key, value]) => (
        <div
          key={key}
          className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl hover:transform hover:scale-105 transition-all duration-300"
        >
          <div className="text-sm text-blue-600 font-medium uppercase tracking-wider">
            {key}
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
        </div>
      ))}
    </div>
  );

  const renderActionItems = (items) => (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl hover:shadow-md transition-all duration-300"
        >
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <span className="text-gray-800">{item}</span>
        </div>
      ))}
    </div>
  );

  const renderChallenges = (challenges) => (
    <div className="space-y-3">
      {challenges.map((challenge, index) => (
        <div
          key={index}
          className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl hover:shadow-md transition-all duration-300"
        >
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <span className="text-gray-800">{challenge}</span>
        </div>
      ))}
    </div>
  );
  const renderSection = (title, content) => {
    if (!content) return null;

    if (Array.isArray(content)) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <ul className="list-disc pl-5">
            {content.map((item, i) => (
              <li key={i} className="mb-1">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (typeof content === "object") {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="pl-5">
            {Object.entries(content).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="font-medium">{key}: </span>
                {typeof value === "object" ? (
                  <pre className="mt-1 text-sm">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <span>{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p>{content}</p>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Vision Roadmap
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          Transform your idea into a strategic business plan
        </p>

        <form onSubmit={analyzeIdea} className="mb-16">
          <div className="mb-6">
            <label
              htmlFor="idea"
              className="block text-sm font-medium mb-2 text-gray-700"
            >
              Describe your business idea
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
              placeholder="Share your innovative business concept..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center gap-3 transition-all duration-300 hover:transform hover:scale-105"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Lightbulb className="w-5 h-5" />
            )}
            Analyze Idea
          </button>
        </form>

        {response && (
          <div className="space-y-8 relative">
            {/* Strategic Overview */}
            {renderRoadmapStep(
              1,
              "Strategic Overview",
              <div>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  {response.summary}
                </p>
                {renderKeyMetrics(response.dataHighlights)}
              </div>,
              <Target className="w-5 h-5" />
            )}

            {/* Market Opportunity */}
            {renderRoadmapStep(
              2,
              "Market Opportunity",
              <div className="space-y-6">
                <div className="p-4 bg-blue-50/50 rounded-xl">
                  <div className="flex items-center gap-3 text-xl font-medium text-blue-700 mb-2">
                    <TrendingUp className="w-6 h-6" />
                    Market Size
                  </div>
                  <p className="text-gray-700">
                    {response.marketLandscape.marketSize}
                  </p>
                </div>
                <div className="p-4 bg-green-50/50 rounded-xl">
                  <div className="flex items-center gap-3 text-xl font-medium text-green-700 mb-2">
                    <ArrowRight className="w-6 h-6" />
                    Growth Trend
                  </div>
                  <p className="text-gray-700">
                    {response.marketLandscape.growthTrends}
                  </p>
                </div>
              </div>,
              <TrendingUp className="w-5 h-5" />
            )}

            {/* Action Plan */}
            {renderRoadmapStep(
              3,
              "Action Plan",
              renderActionItems(response.actionableSteps),
              <CheckCircle className="w-5 h-5" />
            )}

            {/* Risk Assessment */}
            {renderRoadmapStep(
              4,
              "Risk Assessment",
              renderChallenges(response.marketLandscape.challenges),
              <Shield className="w-5 h-5" />
            )}

            {/* Revenue Strategy */}
            {renderRoadmapStep(
              5,
              "Revenue Strategy",
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {response.potentialBusinessModels.revenueModels.map(
                  (model, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-white-50 to-pink-50 p-6 rounded-xl hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="w-6 h-6 text-white-600" />
                        <div className="font-medium text-white-700">
                          Revenue Stream {index + 1}
                        </div>
                      </div>
                      <div className="text-gray-700">{model}</div>
                    </div>
                  )
                )}
              </div>,
              <DollarSign className="w-5 h-5" />
            )}

            {/* Competitive Analysis */}
            {renderRoadmapStep(
              6,
              "Competitive Landscape",
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-blue-700 mb-4">
                      Direct Competitors
                    </h4>
                    <ul className="space-y-2">
                      {response.competitorInsights.directCompetitors.map(
                        (competitor, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            {competitor}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-white-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-indigo-700 mb-4">
                      Indirect Competitors
                    </h4>
                    <ul className="space-y-2">
                      {response.competitorInsights.indirectCompetitors.map(
                        (competitor, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                            {competitor}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">
                    Market Gaps & Opportunities
                  </h4>
                  <p className="text-gray-700">
                    {response.competitorInsights.gapsInSolutions}
                  </p>
                </div>
              </div>,
              <Target className="w-5 h-5" />
            )}

            {/* Final Recommendations */}
            {renderRoadmapStep(
              7,
              "Next Steps",
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-green-700 mb-4">
                    Key Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {response.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-blue-700 mb-4">
                    Monetization Opportunities
                  </h4>
                  <ul className="space-y-3">
                    {response.potentialBusinessModels.monetizationOpportunities.map(
                      (opportunity, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <DollarSign className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                          <span className="text-gray-700">{opportunity}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>,
              <Lightbulb className="w-5 h-5" />
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
