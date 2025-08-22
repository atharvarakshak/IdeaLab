import google.generativeai as genai
from typing import List, Dict
import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],  # Update this to match your frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GeminiBrainstormBot:
    def __init__(self, api_key: str):
        """
        Initialize the brainstorming chatbot with the Gemini API key
        """
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.chat = self.model.start_chat()
        self.conversations: Dict[str, List[Dict]] = {}
        self.state: Dict[str, bool] = {
            "industry": False,
            "problem": False,
            "target_audience": False,
            "revenue": False
        }
        self.summary_generated: bool = False  # Track if a summary has been generated

    def get_follow_up_questions(self, session_id: str) -> List[str]:
        """
        Generate follow-up questions based on the conversation history and update state.
        """
        if session_id not in self.conversations:
            return ["Hello! Let's brainstorm your startup idea. What is your startup about?"]

        previous_responses = [msg['content'] for msg in self.conversations[session_id] if msg['role'] == 'user']
        
        questions = []

        # Check if user has answered each question, using LLM to classify the response
        for category in self.state:
            if not self.state[category]:
                response = previous_responses[-1] if previous_responses else ""
                if self._check_answered(response, category):
                    self.state[category] = True
        
        # Generate follow-up questions based on the state
        if not self.state["industry"]:
            questions.append("What industry is your startup in?")
        elif not self.state["problem"]:
            questions.append("What problem does your startup solve?")
        elif not self.state["target_audience"]:
            questions.append("Who is your target audience?")
        elif not self.state["revenue"]:
            questions.append("How do you plan to make money?")
        
        return questions

    def _check_answered(self, response: str, category: str) -> bool:
        """
        Check if the response answers the specific category question by using LLM classification.
        """
        # Send response to Gemini for classification
        if category == "industry":
            prompt = f"Does the following response describe or imply the industry in which the startup operates?\n{response}"
        elif category == "problem":
            prompt = f"Does the following response describe or imply the problem that the startup is solving?\n{response}"
        elif category == "target_audience":
            prompt = f"Does the following response describe or imply the target audience for the startup?\n{response}"
        elif category == "revenue":
            prompt = f"Does the following response describe or imply how the startup plans to make money?\n{response}"

        # Classify response using Gemini
        classification = self.chat.send_message(prompt).text.lower()
        return "yes" in classification

    def send_message(self, session_id: str, message: str) -> Dict:
        """
        Process user message, ask follow-up questions, or generate a summary.
        """
        if session_id not in self.conversations:
            self.conversations[session_id] = []

        # Store user message
        self.conversations[session_id].append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        
        # Get follow-up questions
        follow_up = self.get_follow_up_questions(session_id)
        
        if len(self.conversations[session_id]) < 10 and follow_up:
            response = follow_up[0]  # Ask one question at a time
        elif not self.summary_generated:
            # Once enough details are collected, generate final summary and end the conversation
            conversation_text = "\n".join([msg['content'] for msg in self.conversations[session_id] if msg['role'] == 'user'])
            response = "Thank you for sharing your idea! Here's the final summary of your startup:\n" + \
                       self.chat.send_message(f"Summarize this startup idea concisely in one or two sentences:\n{conversation_text}").text + \
                       "\n\nThis concludes our session. Good luck with your startup!"
            self.summary_generated = True  # Mark summary as generated
            return {"response": response, "end_conversation": True}  # Signal to end the conversation
        else:
            # If the summary has already been generated, do nothing
            return {"response": "", "end_conversation": True}

        # Store assistant response
        self.conversations[session_id].append({
            'role': 'assistant',
            'content': response,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        
        return {"response": response, "end_conversation": False}

    def get_conversation_history(self, session_id: str) -> List[Dict]:
        """
        Return the conversation history for a given session.
        """
        return self.conversations.get(session_id, [])

    def clear_history(self, session_id: str):
        """
        Clear conversation history for a session.
        """
        self.conversations[session_id] = []
        self.state = {
            "industry": False,
            "problem": False,
            "target_audience": False,
            "revenue": False
        }
        self.summary_generated = False  # Reset summary flag
        self.chat = self.model.start_chat()

# Example usage
def main():
    api_key = "AIzaSyCyykFMrYmdwPDf6jkl1htVZ8Se_qgP3wM"
    chatbot = GeminiBrainstormBot(api_key)
    session_id = "test_session"
    
    print("Hi, I am a brainstorming agent, I am here to make your idea into a reality. Let's start discussing your startup idea.")
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() == 'quit':
            break
        elif user_input.lower() == 'history':
            history = chatbot.get_conversation_history(session_id)
            print("\nConversation History:")
            for message in history:
                print(f"\n{message['timestamp']} - {message['role']}:")
                print(message['content'])
        else:
            response = chatbot.send_message(session_id, user_input)
            if response["response"]: 
                print(f"\nAssistant: {response['response']}")
            if response.get("end_conversation", False):
                print("\n[Conversation ended. Thank you!]")
                break

if __name__ == "__main__":
    main()