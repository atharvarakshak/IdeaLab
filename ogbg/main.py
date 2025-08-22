from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contentGen import generate_content  # Import Gemini utility function
from fastapi.middleware.cors import CORSMiddleware  # For CORS
import json
app = FastAPI()

# CORS Middleware (to allow frontend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (update for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"]
)

# Pydantic model for request body
class IdeaRequest(BaseModel):
    idea: str

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
# Root endpoint
@app.get("/")
async def root():
    return {"message": "Landing Page Generator API"}