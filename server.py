from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
# from google  import genai
import google.generativeai as genai

import os
import json
import logging
from ogbg.contentGen import generate_content  # Import Gemini utility function

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

# Initialize Google AI client
os.environ['GOOGLE_API_KEY'] = 'AIzaSyAIDTRs37prIes19fMICfl3JloUD5QmHos'
genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
model = genai.GenerativeModel('gemini-2.5-flash')

# Pydantic model for request body
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
# Pydantic model for response body
class LandingPageContent(BaseModel):
    navigation: dict
    hero: dict
    features: list
    testimonials: list[Testimonial]  # Add this
    pricing: list
    contact: dict
    footer: str

class FinancialAnalysisRequest(BaseModel):
    initial_revenue: float
    revenue_growth_rate: float
    cogs_percentage: float
    operating_expenses: float  # Assuming this is the MONTHLY operating expense
    initial_capital: float
    customer_acquisition_cost: float
    lifetime_value: float
# API endpoint to generate landing page content
@app.post("/api/generate", response_model=LandingPageContent)
async def generate_landing_page(request: IdeaRequest):
    idea = request.idea
    if not idea:
        raise HTTPException(status_code=400, detail="Idea is required")

    try:
        # Generate content using Gemini
        content = generate_content(idea)
        print("Generated Content:", json.dumps(content, indent=2))  # Debug the output
        return content
    except Exception as e:
        print("Error:", e)  # Log any errors
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_idea(request: IdeaRequest):
    try:
        search_tool = {'google_search': {}}
        chat = model.start_chat(history=[])
        
        # Move json_template into the function scope
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
            },
        }"""


        prompt = f"""You are a market research expert. Analyze this business idea and provide a detailed response in valid JSON format.

Input Idea: {request.idea}

Requirements:
1. Market Landscape Analysis
- Market segment overview
- Current market size and growth trends
- Key market drivers
- Market challenges

2. Competitor Analysis
- Direct and indirect competitors
- Gaps in existing solutions
- Competitive advantages/disadvantages
- Feature and pricing comparison

3. Business Model Recommendations
- Revenue model suggestions
- Monetization strategies
- Pricing recommendations

Format your entire response as a JSON object with this exact structure:
{json_template}

Important Instructions:
1. Ensure the response is valid JSON
2. Provide specific, actionable insights
3. Use realistic market data and trends
4. Keep responses concise but informative"""

        response = chat.send_message(prompt)
        if not response or not response.candidates or not response.candidates[0].content:
            raise HTTPException(status_code=500, detail="No response from model")

        # Process and clean the response
        full_response = ""
        for part in response.candidates[0].content.parts:
            if part.text:
                response_text = part.text.strip()
                if response_text.startswith('```'):
                    response_text = '\n'.join(response_text.split('\n')[1:-1])
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
@app.post("/charts")
async def analyze_market_data(request: IdeaRequest):
    try:
        # Define structured prompt
        prompt = f"""
        You are a market research expert. Fetch **exact numerical values** for "{request.idea}". 
        STRICTLY follow this format (no extra text): 

        {{
            "market_analysis": {{
                "market_overview": {{
                    "total_market_size": {{"year": 2024, "value": 50.0}},
                    "total_market_size_projected": {{"year": 2033, "value": 1200.0}},
                    "market_growth_rate": 25.5,
                    "market_segments": [
                        {{"segment_name": "Segment 1", "segment_size": 200.0}},
                        {{"segment_name": "Segment 2", "segment_size": 300.0}}
                    ]
                }},
                "competitive_landscape": {{
                    "market_share_distribution": [
                        {{"competitor_name": "Competitor 1", "market_share": 40.0}},
                        {{"competitor_name": "Competitor 2", "market_share": 30.0}}
                    ]
                }},
                "regional_analysis": {{
                    "regions": [
                        {{"region": "North America", "market_size": 250.0}},
                        {{"region": "Europe", "market_size": 150.0}}
                    ]
                }}
            }}
        }}
        
        - **ONLY provide valid JSON output, nothing else.**
        - **Use exact values, no approximations like 'several billion'.**
        """

        chat = model.start_chat(history=[])
        response = chat.send_message(prompt)

        if not response or not response.candidates or not response.candidates[0].content:
            raise HTTPException(status_code=500, detail="No response from Gemini")

        full_response = ""
        for part in response.candidates[0].content.parts:
            if part.text:
                response_text = part.text.strip()
                if response_text.startswith('```'):
                    response_text = '\n'.join(response_text.split('\n')[1:-1])
                full_response += response_text

        try:
            parsed_response = json.loads(full_response)
            
            # Validate if numbers are missing
            missing_fields = []
            for key, value in parsed_response.get("market_analysis", {}).items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        if isinstance(sub_value, dict) and "value" in sub_value and sub_value["value"] == "N/A":
                            missing_fields.append(sub_key)
            
            if missing_fields:
                followup_prompt = f"Provide exact numbers for {', '.join(missing_fields)} in the format requested."
                response = chat.send_message(followup_prompt)
                parsed_response = json.loads(response)

            return {"market_analysis": parsed_response.get("market_analysis", {})}

        except json.JSONDecodeError as e:
            logging.error(f"JSON parsing error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to parse response: {str(e)}")

    except Exception as e:
        logging.error(f"Market analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/mvp")
async def generate_mvp_roadmap(request: IdeaRequest):
    try:
        # Define search tool configuration for Google AI
        search_tool = {'google_search': {}}
        chat = model.start_chat(history=[])

        
        json_template = {
            "mvpSummary": "Brief summary of the MVP.",
            "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
            "targetAudience": "Description of the initial target audience.",
            "developmentSteps": ["Step 1", "Step 2", "Step 3"],
            "technicalStack": ["Technology 1", "Technology 2", "Technology 3"],
            "systemDesign": "High-level description of the system architecture.",
            "timeline": {
                "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
                "estimatedCompletion": "Projected timeline for MVP completion."
            },
            "thirdPartyIntegrations": ["Integration 1", "Integration 2", "Integration 3"],
            "launchPlan": {
                "launchGoals": "Goals for the MVP launch.",
                "marketingStrategies": ["Strategy 1", "Strategy 2"],
                "successMetrics": ["Metric 1", "Metric 2"]
            }
        }

        # Generate prompt for the AI model
        prompt = f"""You are a product management expert. Analyze the following business idea and generate a detailed MVP roadmap in valid JSON format.

Input Idea: {request.idea}

Requirements:
1. MVP Summary: Provide a concise description of the proposed MVP.
2. Key Features: Highlight the essential features to include in the MVP.
4. Development Steps: List clear, actionable steps to build the MVP.
5. Technical Stack: Recommend the technologies and tools to use.
6. System Design: Describe the high-level system architecture.
7. Timeline:
   - Key milestones
   - Estimated completion date
8. Third-Party Integrations: Suggest essential third-party services or APIs to integrate.
9. Launch Plan:
   - Launch Goals: Define clear objectives for the MVP launch.
   - Marketing Strategies: Suggest strategies for creating awareness.
   - Success Metrics: Identify measurable indicators for success.

Format your response as a JSON object using the following structure:
{json_template}

Important Instructions:
1. Ensure the response is valid JSON.
2. Avoid placeholder text; provide specific, actionable recommendations.
3. Include concise, practical insights.
4. Use double quotes for all strings.
5. Strictly follow the JSON template provided.
6. Do not add any additional fields or properties to the JSON object.
7. Do not add any additional text or formatting to the JSON object.
8. Do not add any additional comments to the JSON object.
9. Do not add any additional explanations to the JSON object.
10. Do not add any additional notes to the JSON object.
11. Do not add any additional information to the JSON object.
12. Do not add any additional details to the JSON object.

Return ONLY the JSON object without any additional text or formatting."""

        # Send prompt to the AI model
        response = chat.send_message(prompt)
        if not response or not response.candidates or not response.candidates[0].content:
            raise HTTPException(status_code=500, detail="No response from the AI model")

        # Process the AI response
        full_response = ""
        for part in response.candidates[0].content.parts:
            if part.text:
                response_text = part.text.strip()
                if response_text.startswith('```'):
                    response_text = '\n'.join(response_text.split('\n')[1:-1])
                full_response += response_text

        try:
            # Parse response as JSON
            parsed_response = json.loads(full_response)
            return parsed_response
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON")

    except Exception as e:
        logger.error(f"Error generating MVP roadmap: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/financial_analysis")  
async def financial_analysis(request: FinancialAnalysisRequest):
    # ... your code
    try:
        # Extract data from the request
        initial_revenue = request.initial_revenue
        revenue_growth_rate = request.revenue_growth_rate
        cogs_percentage = request.cogs_percentage
        operating_expenses = request.operating_expenses
        initial_capital = request.initial_capital
        customer_acquisition_cost = request.customer_acquisition_cost
        lifetime_value = request.lifetime_value

        # Financial Projections (3 years)
        years = [1, 2, 3]
        revenue = []
        cogs = []
        gross_profit = []
        net_profit = []

        rev = initial_revenue  # Initialize revenue for the first year
        for year in years:
            if year > 1:  # Apply growth from year 2 onwards
                rev *= (1 + revenue_growth_rate)
            revenue.append(rev)
            cogs.append(rev * (cogs_percentage / 100))
            gross_profit.append(rev - cogs[-1])
            net_profit.append(gross_profit[-1] - operating_expenses)

        # Key Metrics
        gross_margin = [(gp / rev) * 100 if rev else 0 for gp, rev in zip(gross_profit, revenue)]
        net_profit_margin = [(np / rev) * 100 if rev else 0 for np, rev in zip(net_profit, revenue)]
        monthly_burn_rate = operating_expenses
        runway = initial_capital / monthly_burn_rate if monthly_burn_rate else 0
        return_on_equity = (net_profit[0] / initial_capital) * 100 if initial_capital else 0

        # Prepare Response Data (matching the frontend's expected format)
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