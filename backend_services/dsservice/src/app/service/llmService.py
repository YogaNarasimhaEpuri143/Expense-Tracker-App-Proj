
from dotenv import load_dotenv

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_mistralai import ChatMistralAI

import os

from app.models.expense import Expense


class LLMService:
    
    def __init__(self):
        load_dotenv()  # Load all the data present in the .env file
        
        # Telling system how to act, Not to give response
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are an expert extraction algorithm. "
                    "Only extract relevant information from the text. "
                    "If you do not know the value of an attribute asked to extract, "
                    "return null for the attribute's value.",
                ),
                ("human", "{text}")
            ]
            )
        self.apiKey = os.getenv('OPENAI_API_KEY')
        self.llm = ChatMistralAI(api_key=self.apiKey, model="mistral-large-latest", temperature=0)
        
        # Piping using |
        self.runnable = self.prompt | self.llm.with_structured_output(schema=Expense)
        
    def runLLM(self, message):
        return self.runnable.invoke({"text":message})