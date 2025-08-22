from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
import os
import json

os.environ['GOOGLE_API_KEY'] = 'AIzaSyB3VW6jHB4a-q_uUn8KLNmOXwiDWtiO_IE'
client = genai.Client(http_options={'api_version': 'v1alpha'})

search_tool = {'google_search': {}}
chat = client.chats.create(model='gemini-2.0-flash-exp', config={'tools': [search_tool]})

idea = input("Kya khayal hai ??: ")

json= {
  "summary": "Concise overview of the response.",
  "keyInsights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "actionableSteps": ["Step 1", "Step 2", "Step 3"],
  "dataHighlights": {
    "metric": "value",
    "context": "brief description of the data"
  },
  "examples": ["Example 1", "Example 2"]
}
prompt = f"""Do Market Research:
System Role:
You are a cutting-edge market research assistant specializing in identifying opportunities, analyzing competition, and suggesting business models for innovative ideas.

Input Idea:
{idea}

Task:
Perform a detailed analysis based on the idea provided. Provide information in a structured and specific format covering the following aspects:

1. Market Landscape:
Provide an overview of the market segment this idea fits into.
Share current market size and projected growth trends (mention relevant yearss).
Highlight key drivers influencing this market (e.g., technology adoption, remote work trends).
Identify challenges or barriers in the market.
2. Competitor Insights:
List direct competitors and indirect competitors (tools addressing part of the problem).
Identify gaps in existing solutions and areas where they excel.
Provide a competitive matrix with:
Feature sets.
Pricing models.
User base or popularity metrics.
3. Potential Business Models:
Suggest viable revenue models for this idea, including:
Subscription tiers (e.g., Basic, Pro, Enterprise).
Pay-per-use options.
Partnerships or B2B licensing opportunities.
Highlight monetization opportunities from:
Value-added services.
White-labeling for enterprises.
Additional Notes for System:

Ensure all data is up-to-date and accurate, using credible sources.
Present findings in bullet points or a table for easy readability.
Avoid excessive fluff—focus on actionable insights and data points.

Simplify and Refine Long Responses
Objective:
You are tasked with transforming long, detailed responses into concise, clear, and actionable outputs. Your goal is to ensure the content remains comprehensive but is presented in an easily digestible format.b

1. Purpose

Simplify complex and lengthy responses without losing essential insights.
Ensure the output is engaging and understandable for both technical and non-technical audiences.
Highlight only the most relevant and actionable information.
2. Transformation Guidelines

Simplify Language: Use plain, conversational language. Avoid jargon unless necessary for clarity.
Preserve Insights: Keep critical data points and insights intact.
Remove Redundancy: Avoid repetition, unnecessary background information, or over-explanation.
Prioritize Clarity: Deliver information in a clear, structured manner that is easy to grasp quickly.
3. Formatting Rules

Structure: Divide the response into logical sections:
Summary: Brief overview of the response’s key points.
Key Insights: Highlight the most important findings.
Actionable Steps: Provide practical recommendations or next steps based on the analysis.
Data Highlights: Showcase notable metrics or figures.
Examples (if applicable): Use relevant examples to explain ideas or findings.
Use Visual Elements: Utilize bullet points, numbered lists, or bold text for emphasis.
4. Style Guidelines

Tone:
Professional yet conversational.
Avoid unnecessary fillers or excessive technicality.
Sentence Length:
Use short, concise sentences for clarity.
Break down complex ideas into smaller, digestible chunks.
5. Coverage Requirements
Ensure the simplified response includes the following details (when applicable):

Market Landscape:
Market segment overview.
Current market size and projected growth trends (with years).
Key drivers influencing the market.
Challenges or barriers in the market.
Competitor Insights:
Direct competitors and indirect competitors (if relevant).
Key gaps in existing solutions and areas of excellence.
Include a competitive matrix with:
Feature sets.
Pricing models.
User base/popularity metrics.
Potential Business Models:
Revenue models (e.g., subscription tiers, pay-per-use, partnerships).
Monetization opportunities (e.g., value-added services, white-labeling).
Any unique selling propositions (USPs) that can add value.
6. Output Template
Structure all outputs in this JSON format:
{json}
7. Examples of Simplification
Original:
"The global CRM market is expected to grow at a CAGR of 15%, reaching $50B by 2030, driven by the growing adoption of automation tools by SMEs and large enterprises. However, key barriers include high implementation costs and integration challenges."

Simplified:

Summary: "The CRM market is growing rapidly, projected to reach $50B by 2030."
Key Insights:
Market CAGR: 15%.
Growth drivers: Automation adoption by SMEs and enterprises.
Barriers: High implementation costs, integration issues.
Actionable Steps:
Focus on cost-effective, scalable CRM solutions.
Address integration challenges with simplified workflows.
8. Constraints

Aim for clarity and conciseness while covering all necessary details.
Avoid arbitrary word limits—focus on the quality and completeness of the response.
"""

try:
    r = chat.send_message(prompt)
    if r and r.candidates and r.candidates[0].content:
        full_response = ""
        for part in r.candidates[0].content.parts:
            if part.text:
                # Clean up the response text
                response_text = part.text.strip()
                # Remove markdown code block markers if present
                if response_text.startswith('```'):
                    response_text = '\n'.join(response_text.split('\n')[1:-1])
                full_response += response_text

        # Convert the string response to a dictionary
        response_dict = {
            "summary": "",
            "keyInsights": [],
            "actionableSteps": [],
            "dataHighlights": {},
            "marketLandscape": {},
            "competitorInsights": {},
            "potentialBusinessModels": {}
        }

        # Parse the response and populate the dictionary
        # This ensures we have a valid dictionary structure
        try:
            parsed = eval(full_response)  # Use eval() since the response is already in Python dict format
            response_dict.update(parsed)
            
            # Save to JSON file
            with open('output.json', 'w', encoding='utf-8') as f:
                json.dump(response_dict, f, indent=4, ensure_ascii=False)
            print("JSON data successfully saved to output.json")
                
        except Exception as e:
            print(f"Error parsing response: {e}")
            # Fallback: Save the raw response
            with open('output.json', 'w', encoding='utf-8') as f:
                f.write(full_response)
            print("Raw response saved to output.json")
            
except Exception as e:
    print(f"An error occurred: {e}")