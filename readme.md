# Market Research AI Assistant

An AI-powered system that conducts comprehensive market research and competitive analysis for business ideas. The system leverages Google's Gemini AI to provide structured insights, competitor analysis, and business model recommendations.

## Features

- Automated market research analysis
- Competitive landscape evaluation
- Business model recommendations
- Structured JSON output format
- Available as both CLI and web application

## System Components

### CLI Version

- `main.py`: Command-line interface for direct idea analysis
- `output.json`: Stores analysis results in structured format

### Web Version

- `server.py`: FastAPI backend server
- `/client`: React-based frontend interface

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd startup-agent
```

2. Install Python dependencies:

```bash
pip install google-generativeai --upgrade
pip install "fastapi[all]"
pip install uvicorn
```

3. For the web version, install frontend dependencies:

```bash
cd client
npm install
```

## Usage

### CLI Version

1. Run the command-line interface:

```bash
fastapi run .\server.py
```

2. Enter your business idea when prompted
3. The analysis will be saved to `output.json`

### Web Version

1. Start the FastAPI backend server:

```bash
uvicorn server:app --reload
```

2. In a separate terminal, start the frontend development server:

```bash
cd client
npm run dev
```

3. Access the web interface at `http://localhost:5173`

## Output Format

The analysis is provided in a structured JSON format including:

- Market Landscape
- Competitor Insights
- Business Models
- Key Insights
- Actionable Steps
- Data Highlights

Example output structure:

```json
{
  "summary": "Brief overview",
  "keyInsights": ["Insight 1", "Insight 2"],
  "actionableSteps": ["Step 1", "Step 2"],
  "dataHighlights": {
    "marketSize": "Value",
    "marketGrowth": "Growth rate"
  },
  "marketLandscape": {
    "overview": "",
    "challenges": []
  },
  "competitorInsights": {
    "directCompetitors": [],
    "indirectCompetitors": []
  },
  "potentialBusinessModels": {
    "revenueModels": [],
    "monetizationOpportunities": []
  }
}
```

## API Endpoints

### POST /analyze

Analyzes a business idea and returns market research results

Request body:

```json
{
  "idea": "Your business idea here"
}
```

## Environment Variables

Create a `.env` file with your Google API key:
