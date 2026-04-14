# SnapSentiment

Upload one or more images, optionally add a caption, and get back an AI-generated description of each photo plus a sentiment read visualised as a confidence gauge. Supports side-by-side comparison of multiple images and keeps a session history of every analysis. Built as an end-to-end demo of HuggingFace vision and NLP models in a FastAPI + React stack — no database, no auth, no API keys.

![Demo](docs/demo.png)

---

## Features

- **Image description** via [BLIP](https://huggingface.co/Salesforce/blip-image-captioning-base) — generates a natural-language caption for whatever you upload
- **Sentiment analysis** via [DistilBERT-SST-2](https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english) — runs on your caption if you supply one, or on the BLIP output if you don't
- **Sentiment gauge** — SVG semicircle showing confidence score visually
- **Multi-image comparison** — upload up to 4 images at once, results appear in a grid
- **Session history** — every analysis is logged in-memory for the duration of your session; click any entry to restore it

---

## Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be at `http://localhost:8000`. On first run, HuggingFace will download the model weights (~900 MB total) and cache them — subsequent starts are fast.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/analyse` to the backend so you won't hit browser CORS issues.

---

## Notes

**BLIP is slow on first request** even after weights are cached, because the model loads into memory at startup. Give it 10–30 seconds the first time depending on your machine. After that it's snappy.

**Why distilbert over VADER or TextBlob?** Rule-based approaches like VADER are great for social-media slang and emoji, but they fall apart on descriptive prose (which is what BLIP generates). A fine-tuned transformer handles that kind of text much more reliably. distilbert-SST-2 is tiny enough to run on CPU without being embarrassingly wrong.

**Multi-image requests** hit the single `/analyse` endpoint in parallel — no batch endpoint needed. The frontend fires `Promise.all` and assembles results as they come back.

**Session history** lives in React state only — it clears on page refresh. That's intentional; there's no persistence layer.
