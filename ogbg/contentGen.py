import os
import json
from typing import Any, Dict

try:
    import google.generativeai as genai  # type: ignore[import-not-found]
except Exception as import_error:
    raise ImportError(
        "Missing dependency 'google-generativeai'. Install with: pip install google-generativeai"
    ) from import_error

# Set up Gemini client
os.environ['GOOGLE_API_KEY'] = 'AIzaSyC6xViOO62KpcEMrUMTPG99NjeVpwtPCrs'  # Replace with your Gemini API key
genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
model = genai.GenerativeModel('gemini-2.5-flash')

def generate_content(idea: str) -> Dict[str, Any]:
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
        response = model.generate_content(prompt)
        full_response = (response.text or "").strip()

        if full_response.startswith("```"):
            stripped = full_response.splitlines()
            if stripped and stripped[0].startswith("```") and stripped[-1].startswith("```"):
                full_response = "\n".join(stripped[1:-1]).strip()

        if not full_response:
            raise ValueError("Empty response from Gemini")

        content = json.loads(full_response)

        required_fields = ["navigation", "hero", "features", "testimonials", "pricing", "contact", "footer"]
        for field in required_fields:
            if field not in content:
                raise ValueError(f"Missing required field: {field}")

        return content

    except json.JSONDecodeError as e:
        raise Exception(f"Invalid JSON from Gemini: {full_response}") from e
    except Exception as e:
        raise Exception(f"Content generation failed: {str(e)}") from e
