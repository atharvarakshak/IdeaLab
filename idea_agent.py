from fastapi import FastAPI, Cookie, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uuid
from idea_chatbot import GeminiBrainstormBot

app = FastAPI()

# Configure CORS - Must be before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Explicitly specify methods
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize chatbot
api_key = "AIzaSyCyykFMrYmdwPDf6jkl1htVZ8Se_qgP3wM"
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

chatbot = GeminiBrainstormBot(api_key)
sessions = {}

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    session_id: str
    chatbot_response: str
    conversation: list
    end_conversation: bool

def get_or_create_session(session_id: str = None):
    if session_id is None or session_id not in sessions:
        session_id = str(uuid.uuid4())
        sessions[session_id] = {"history": []}
    return session_id

@app.post("/chat")
async def chat(request: ChatRequest, session_id: str = Cookie(None)):
    try:
        session_id = get_or_create_session(session_id)
        result = chatbot.send_message(session_id, request.message)

        chatbot_response = result.get("response", "")
        if result.get("end_conversation"):
            chatbot_response = result.get("summary", chatbot_response)
            chatbot.clear_history(session_id)

        response_data = ChatResponse(
            session_id=session_id,
            chatbot_response=chatbot_response,
            conversation=chatbot.get_conversation_history(session_id),
            end_conversation=result.get("end_conversation", False)
        )

        return JSONResponse(
            content=response_data.dict(),
            headers={
                "Set-Cookie": f"session_id={session_id}; Path=/; SameSite=None; Secure",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Origin": "http://localhost:5174"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reset")
async def reset_chat(session_id: str = Cookie(None)):
    try:
        session_id = get_or_create_session(session_id)
        chatbot.clear_history(session_id)
        return JSONResponse(
            content={"message": "Conversation reset"},
            headers={
                "Set-Cookie": f"session_id={session_id}; Path=/; SameSite=None; Secure",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Origin": "http://localhost:5174"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.options("/chat")
@app.options("/reset")
async def options_handler():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5174",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

if name == "main":
    import uvicorn
    uvicorn.run("idea_agent:app", host="127.0.0.1", port=8000, reload=True)