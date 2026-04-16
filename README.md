# SnapSentiment

Image understanding and sentiment analysis — upload a photo, get a natural-language description and a sentiment read visualised as a confidence gauge.

[Live Demo](YOUR_URL_HERE)

![Demo](docs/demo.png)

---

## Technical Architecture

### Two-model pipeline

Requests flow through two models in sequence:

1. **BLIP** (`Salesforce/blip-image-captioning-base`) takes the raw image bytes and generates a natural-language description — e.g. "a dog running through a field of grass". This gives downstream NLP something to work with regardless of whether the user supplies their own caption.

2. **DistilBERT-SST-2** (`distilbert-base-uncased-finetuned-sst-2-english`) runs sentiment classification on either the user's caption (if one was provided) or the BLIP output (if not). It returns a label (positive / negative) and a confidence score.

The result includes both the generated description and whichever text was actually classified, so it's always clear what the model ran on.

### Why DistilBERT over VADER or TextBlob

Rule-based approaches like VADER are tuned for social-media text — short, emoji-heavy, colloquial. They fall apart on the kind of descriptive prose that BLIP generates ("a group of people standing in front of a building"). A transformer fine-tuned on SST-2 handles that register much more reliably. DistilBERT is also small enough to run on CPU without being embarrassingly slow or wrong.

### Backend

FastAPI app in `backend/main.py`. A single `POST /analyse` endpoint accepts multipart form data — an image file and an optional text caption. Both models are loaded once at startup using FastAPI's `lifespan` context manager rather than per-request, so the latency hit is paid once not every time. CORS is open for local development.

```
POST /analyse
  image: File (JPEG, PNG, WebP, GIF)
  caption: str (optional)

→ { sentiment: { label, score }, image_description: str, caption_used: str }
```

### Frontend

React + Vite single-page app in `frontend/`. Communicates with the backend via a plain `fetch` call posting a `FormData` object. In multi-image mode (up to 4 images), requests fire in parallel with `Promise.all`. The Vite dev server proxies `/analyse` to `localhost:8000` so there are no CORS issues during development.

Session history is kept in React state — no persistence layer, clears on refresh.

---

## Models Used

| Model | Task | HuggingFace |
|---|---|---|
| `Salesforce/blip-image-captioning-base` | Image captioning | [link](https://huggingface.co/Salesforce/blip-image-captioning-base) |
| `distilbert-base-uncased-finetuned-sst-2-english` | Sentiment classification | [link](https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english) |

Weights are downloaded automatically by HuggingFace on first run (~900 MB total) and cached locally.

---

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Notes

**First run is slow.** BLIP loads ~900 MB of weights into memory at startup — allow 10–30 seconds depending on your machine. After that it's fast.

**No caption?** Sentiment runs on the BLIP-generated description instead, so you always get a result.

**Multi-image mode** disables the caption field — each image is described independently by BLIP, which makes the comparison meaningful.
