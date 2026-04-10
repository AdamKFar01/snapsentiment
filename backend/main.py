from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import models.sentiment as sentiment_model
import models.image_analysis as image_model

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # load both models at startup so the first request isn't slow
    sentiment_model.load_model()
    image_model.load_model()
    yield


app = FastAPI(lifespan=lifespan)

# wide-open CORS for local dev — tighten this if you ever deploy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyse")
async def analyse(
    image: UploadFile = File(...),
    caption: Optional[str] = Form(default=""),
):
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {image.content_type}. Use JPEG, PNG, WebP, or GIF.",
        )

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image file is empty.")

    try:
        image_description = image_model.describe(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

    # if no caption was provided, run sentiment on the generated description instead
    text_for_sentiment = caption.strip() if caption and caption.strip() else image_description

    try:
        sentiment = sentiment_model.analyse(text_for_sentiment)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

    return {
        "sentiment": sentiment,
        "image_description": image_description,
        "caption_used": text_for_sentiment,
    }
