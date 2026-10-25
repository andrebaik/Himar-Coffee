import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .config import INTERNAL_API_KEY
from .catalog import fetch_catalog
from .llm import generate_chat_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fetch initial catalog asynchronously at startup
    asyncio.create_task(fetch_catalog())
    yield

app = FastAPI(
    title="Himar Coffee Garut AI Service",
    description="FastAPI service for intent classification & RAG chatbot powered by Groq LLM",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=8, max_length=64)
    message: str = Field(..., min_length=1, max_length=500)

class ChatResponse(BaseModel):
    intent: str
    confidence: float
    reply: str

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        result = await generate_chat_response(req.message)
        return ChatResponse(
            intent=result["intent"],
            confidence=result["confidence"],
            reply=result["reply"]
        )
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INTERNAL_ERROR", "message": "Gagal memproses pesan"}
        )

@app.post("/api/v1/reindex", status_code=status.HTTP_202_ACCEPTED)
async def reindex_endpoint(x_internal_key: str = Header(None)):
    if not x_internal_key or x_internal_key != INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Kunci internal tidak valid"}
        )

    # Trigger reindexing asynchronously in background
    asyncio.create_task(fetch_catalog())
    return {"message": "Reindexing triggered"}

if __name__ == "__main__":
    import uvicorn
    from .config import PORT
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
