from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

import google.generativeai as genai
from google.generativeai import types

import os
import json
import logging
from ogbg.contentGen import generate_content

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Change 1: Use env var instead of hardcoded key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("GOOGLE_API_KEY not set")
genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.5-flash")

class IdeaRequest(BaseModel):
    idea: str
    initial_revenue: Optional[float] = None
    revenue_growth_rate: Optional[float] = None
    cogs_percentage: Optional[float] = None
    operating_expenses: Optional[float] = None
    initial_capital: Optional[float] = None
    monthly_burn_rate: Optional[float] = None
    customer_acquisition_cost: Optional[float] = None
    lifetime_value: Optional[float] = None

class Testimonial(BaseModel):
    text: str
    author: str

class LandingPageContent(BaseModel):
    navigation: dict
    hero: dict
    features: list
    testimonials: list[Testimonial]
    pricing: list
    contact: dict
    footer: str

class FinancialAnalysisRequest(BaseModel):
    initial_revenue: float
    revenue_growth_rate: float
    cogs_percentage: float
    operating_expenses: float
    initial_capital: float
    customer_acquisition_cost: float
    lifetime_value: float

@app.post("/api/generate", response_model=LandingPageContent)
async def generate_landing_page(request: IdeaRequest):
    idea = request.idea
    if not idea:
        raise HTTPException(status_code=400, detail="Idea is required")

    try:
        content = generate_content(idea)

        # Change 3: logger instead of print
        logger.debug("Generated Content: %s", json.dumps(content, indent=2))

        return content
    except Exception as e:
        logger.error("Error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_idea(request: IdeaRequest):
    try:
        search_tool = {'google_search': {}}
        chat = model.start_chat(history=[])
        
        # Change 2: Removed trailing comma in JSON template
        json_template = """{
            "summary": "string",
            "keyInsights": ["string"],
            "actionableSteps": ["string"],
            "dataHighlights": {
                "metric": "string",
                "context": "string"
            },
            "marketLandscape": {
                "overview": "string",
                "marketSize": "string",
                "growthTrends": "string",
                "keyDrivers": ["string"],
                "challenges": ["string"]
            },
            "competitorInsights": {
                "directCompetitors": ["string"],
                "indirectCompetitors": ["string"],
                "gapsInSolutions": "string",
                "competitiveMatrix": {
                    "featureSets": {},
                    "pricingModels": {},
                    "userBase": {}
                }
            },
            "potentialBusinessModels": {
                "revenueModels": ["string"],
                "monetizationOpportunities": ["string"]
            },
            "feasibility" : {
                "feasibilityScore": "number - a score from 1 to 100 (1 is bad, 100 is good, try to be definitive)",
                "feasibilityRecommendations": ["string"]
            },
            "financial_analysis": {
                "equipment": "number",
                "raw_materials": "number",
                "marketing": "number",
                "manufacturing_costs": "number",
                "total": "number",
                "unit": "string (USD, EUR, etc.)"
            }
        }"""

        prompt = f"""You are a market research expert. Analyze this business idea and provide a detailed response in valid JSON format.

Input Idea: {request.idea}

Format your entire response as this JSON:
{json_template}
"""

        response = chat.send_message(prompt)
        if not response or not response.candidates or not response.candidates[0].content:
            raise HTTPException(status_code=500, detail="No response from model")

        full_response = ""
        for part in response.candidates[0].content.parts:
            if part.text:
                response_text = part.text.strip()
                if response_text.startswith('```'):
                    response_text = "\n".join(response_text.split("\n")[1:-1])
                full_response += response_text

        try:
            parsed_response = json.loads(full_response)
            return parsed_response
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to parse response: {str(e)}")

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- The rest of your code below is unchanged ----

@app.post("/charts")
async def analyze_market_data(request: IdeaRequest):
    try:
        prompt = f"""
        You are a market research expert. Fetch numerical values for "{request.idea}". 
        Return ONLY valid JSON.
        """

        chat = model.start_chat(history=[])
        response = chat.send_message(prompt)

        full_response = ""
        for part in response.candidates[0].content.parts:
            if part.text:
                response_text = part.text.strip()
                if response_text.startswith('```'):
                    response_text = "\n".join(response_text.split("\n")[1:-1])
                full_response += response_text

        parsed_response = json.loads(full_response)
        return {"market_analysis": parsed_response.get("market_analysis", {})}

    except Exception as e:
        logging.error(f"Market analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mvp")
async def generate_mvp_roadmap(request: IdeaRequest):
    try:
        chat = model.start_chat(history=[])

        json_template = {
            "mvpSummary": "Brief summary",
            "keyFeatures": ["Feature 1"],
            "targetAudience": "Audience",
            "developmentSteps": ["Step 1"],
            "technicalStack": ["Tech 1"],
            "systemDesign": "Architecture",
            "timeline": {
                "milestones": ["M1"],
                "estimatedCompletion": "Date"
            },
            "thirdPartyIntegrations": ["Integration"],
            "launchPlan": {
                "launchGoals": "Goals",
                "marketingStrategies": ["Strategy"],
                "successMetrics": ["Metric"]
            }
        }

        prompt = f"""Generate MVP JSON:
{json_template}"""

        response = chat.send_message(prompt)

        full_response = ""
        for part in response.candidates[0].content.parts:
            if part.text:
                response_text = part.text.strip()
                if response_text.startswith("```"):
                    response_text = "\n".join(response_text.split("\n")[1:-1])
                full_response += response_text

        parsed_response = json.loads(full_response)
        return parsed_response

    except Exception as e:
        logger.error(f"Error generating MVP roadmap: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/financial_analysis")
async def financial_analysis(request: FinancialAnalysisRequest):
    try:
        initial_revenue = request.initial_revenue
        revenue_growth_rate = request.revenue_growth_rate
        cogs_percentage = request.cogs_percentage
        operating_expenses = request.operating_expenses
        initial_capital = request.initial_capital
        customer_acquisition_cost = request.customer_acquisition_cost
        lifetime_value = request.lifetime_value

        years = [1, 2, 3]
        revenue = []
        cogs = []
        gross_profit = []
        net_profit = []

        rev = initial_revenue
        for year in years:
            if year > 1:
                rev *= (1 + revenue_growth_rate)
            revenue.append(rev)
            cogs.append(rev * (cogs_percentage / 100))
            gross_profit.append(rev - cogs[-1])
            net_profit.append(gross_profit[-1] - operating_expenses)

        gross_margin = [(gp / rev) * 100 if rev else 0 for gp, rev in zip(gross_profit, revenue)]
        net_profit_margin = [(np / rev) * 100 if rev else 0 for np, rev in zip(net_profit, revenue)]
        monthly_burn_rate = operating_expenses
        runway = initial_capital / monthly_burn_rate if monthly_burn_rate else 0
        return_on_equity = (net_profit[0] / initial_capital) * 100 if initial_capital else 0

        response_data = {
            "monthlyBurnRate": monthly_burn_rate,
            "runway": runway,
            "customerMetrics": {
                "cac": customer_acquisition_cost,
                "ltv": lifetime_value,
            },
            "incomeStatementProjection": {
                "revenue": revenue,
                "cogs": cogs,
                "grossProfit": gross_profit,
                "netProfit": net_profit,
            },
            "profitabilityMetrics": {
                "returnOnEquity": return_on_equity,
                "grossMargin": gross_margin,
                "netProfitMargin": net_profit_margin,
            },
        }

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
