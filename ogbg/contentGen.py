import os
from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
import json

# Set up Gemini client
os.environ['GOOGLE_API_KEY'] = 'AIzaSyB3VW6jHB4a-q_uUn8KLNmOXwiDWtiO_IE'  # Replace with your Gemini API key
client = genai.Client(http_options={'api_version': 'v1alpha'})

def generate_content(idea: str) -> dict:
    """
    Generate detailed landing page content using the Gemini model.
    """
    # Define the prompt
    prompt = f"""
     Generate content for a professional landing page about {idea}.
    Include:
    1. Navigation links (Home, Features, Pricing, Contact)
    2. Hero section with headline, subheadline, and CTA
    3. Features section with 3 features (title, description, icon name)
    4. Testimonials section with 2 testimonials (text and author)
    5. Pricing section with 3 plans
    6. Contact section
    7. Footer content
    Format the response as JSON:
    {{
        "navigation": {{
            "logo": "BrandName",
            "links": ["Home", "Features", "Pricing", "Contact"]
        }},
        "hero": {{
            "headline": "...",
            "subheadline": "...",
            "cta": "Get Started"
        }},
        "features": [
            {{
                "title": "...",
                "description": "...",
                "icon": "rocket" // (use FontAwesome icons)
            }}
        ],
        "testimonials": [  // Add this section
            {{
                "text": "...",
                "author": "..."
            }}
        ],
        "pricing": [
            {{
                "name": "Basic",
                "price": "29",
                "features": ["Feature 1", "Feature 2"]
            }}
        ],
        "contact": {{
            "email": "contact@example.com",
            "phone": "+1 234 567 890"
        }},
        "footer": "© 2024 BrandName. All rights reserved."
    }}
    """

    try:
        # Create a chat session with Gemini
        search_tool = {'google_search': {}}
        chat = client.chats.create(model='gemini-2.0-flash-exp', config={'tools': [search_tool]})

        # Send the prompt to Gemini
        response = chat.send_message(prompt)
        if response and response.candidates and response.candidates[0].content:
            full_response = ""
            for part in response.candidates[0].content.parts:
                if part.text:
                    # Clean up the response text
                    response_text = part.text.strip()
                    # Remove markdown code block markers if present
                    if response_text.startswith('```'):
                        response_text = '\n'.join(response_text.split('\n')[1:-1])
                    full_response += response_text

            # Add validation for Gemini response
            if not full_response.strip():
                raise ValueError("Empty response from Gemini")

            content = json.loads(full_response)
            
            # Validate required fields
            required_fields = ["navigation", "hero", "features", "testimonials", "pricing", "contact", "footer"]
        for field in required_fields:
            if field not in content:
                raise ValueError(f"Missing required field: {field}")
                
        return content
        
    except json.JSONDecodeError as e:
        raise Exception(f"Invalid JSON from Gemini: {full_response}")
    except Exception as e:
        raise Exception(f"Content generation failed: {str(e)}")
