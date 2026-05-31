import os
import json
import traceback
import time
from typing import List, Dict, Any

from dotenv import load_dotenv  # <-- Added to load the .env file
from groq import Groq
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq  # not used now but kept
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables from the .env file
load_dotenv()

class CreditAssistant:
    def __init__(self, data_path: str, index_path: str, model_name: str = "llama-3.1-8b-instant",
                 embedding_model: str = "nomic-embed-text:latest", top_k: int = 1):
        self.data_path = data_path
        self.index_path = index_path
        self.model_name = model_name
        self.embedding_model_name = embedding_model
        self.top_k = top_k

        self.embeddings = OllamaEmbeddings(model=self.embedding_model_name)
        # Groq automatically look for the GROQ_API_KEY environment variable loaded by dotenv
        self.client = Groq()

        self.data = self._load_data()
        self.vectorstore = self._initialize_vectorstore()

        self.prompt_template = """
Tu es l'assistant virtuel de CréditTunisie.
Réponds UNIQUEMENT en français, de façon concise.
Utilise EXCLUSIVEMENT le contexte ci-dessous.

Contexte :
---------------------
{context}
---------------------

Si la réponse n'est pas dans le contexte, dis : "Je n'ai pas assez d'informations pour répondre à cette question."

Question : {question}

Réponse :
"""
        self.prompt = ChatPromptTemplate.from_template(self.prompt_template)

    def _load_data(self) -> List[Dict[str, Any]]:
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"Loaded {len(data)} entries from {self.data_path}")
                return data
        except Exception as e:
            print(f"Error loading data: {e}")
            return []

    def _initialize_vectorstore(self) -> FAISS:
        if os.path.exists(self.index_path) and os.path.exists(f"{self.index_path}/index.faiss"):
            print('Loading existing FAISS index...')
            return FAISS.load_local(self.index_path, self.embeddings, allow_dangerous_deserialization=True)

        print('Creating new FAISS index...')
        documents = []
        for item in self.data:
            q = item.get('question') or item.get('Question', '')
            a = item.get('answer') or item.get('Answer', '')
            if q and a:
                combined = f"Question: {q}\nRéponse: {a}"
                doc = Document(page_content=combined, metadata={"source": "faq"})
                documents.append(doc)

        if not documents:
            raise ValueError("No valid documents found to index")

        vectorstore = FAISS.from_documents(documents, self.embeddings)
        vectorstore.save_local(self.index_path)
        return vectorstore

    def retrieve_context(self, query: str) -> List[Document]:
        start = time.time()
        results = self.vectorstore.similarity_search(query, k=self.top_k)
        print(f"Retrieved {len(results)} docs in {time.time()-start:.2f}s")
        return results

    def format_context(self, retrieved_docs: List[Document]) -> str:
        return "\n\n".join([doc.page_content for doc in retrieved_docs])

    def generate_response(self, query: str, context: str) -> str:
        try:
            prompt_text = self.prompt.format(context=context, question=query)
            print(f"Prompt (first 200 chars): {prompt_text[:200]}...")
            start = time.time()
            completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt_text}
                ],
                model=self.model_name,
                temperature=0,
                max_tokens=512,
                )
            print(f"Generated in {time.time()-start:.2f}s")
            return completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Generation error: {e}")
            traceback.print_exc()
            return "Désolé, une erreur est survenue."

    def answer_question(self, query: str) -> str:
        print(f"\n--- Question: '{query}' ---")
        try:
            docs = self.retrieve_context(query)
            if not docs:
                return "Je n'ai pas assez d'informations pour répondre à cette question."
            context = self.format_context(docs)
            return self.generate_response(query, context)
        except Exception as e:
            print(f"Error in answer_question: {e}")
            traceback.print_exc()
            return "Erreur interne."

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = CreditAssistant(
    data_path='data.json',
    index_path='faiss_index_store',
    model_name='llama-3.1-8b-instant',
    top_k=1
)

class ChatRequest(BaseModel):
    message: str

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response = rag.answer_question(request.message)
        return {"response": response}
    except Exception as e:
        print("=== ERROR in /chat ===")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Test Ollama connection before starting
    try:
        test_embeddings = OllamaEmbeddings(model="nomic-embed-text:latest")
        test_embeddings.embed_query("test")
        print("✅ Ollama is running and accessible.")
    except Exception as e:
        print("❌ Ollama connection failed. Make sure Ollama is running and the model is pulled.")
        print(f"Error: {e}")
        exit(1)
    uvicorn.run(app, host="0.0.0.0", port=8000)