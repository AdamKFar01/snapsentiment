# SnapSentiment

Upload a photo and get back a natural-language description of what's in it, a positive/negative sentiment classification, and a confidence score — visualised as a semicircle gauge. The core idea is a two-model pipeline: BLIP handles the vision side (raw pixels → descriptive prose), then DistilBERT handles the NLP side (prose → sentiment label + score). Plugging a vision model and a language model together lets you run sentiment analysis on images without any labelled image-sentiment training data — the image captioner bridges the modality gap.

![Demo](docs/demo.png)

---

## Features

- Drag-and-drop image upload (up to 4 images; JPEG, PNG, WebP, GIF)
- Optional caption input — type your own text or leave it blank
- BLIP-generated image description shown on every result card
- DistilBERT SST-2 sentiment classification (positive / negative)
- Colour-coded result card: green for positive, red for negative
- Confidence score rendered as an SVG semicircle gauge
- Multi-image comparison mode — up to 4 images analysed in parallel
- Session history panel — last 20 analyses, in-memory only

---

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Uvicorn |
| ML models | HuggingFace `transformers` — BLIP (`blip-image-captioning-base`), DistilBERT (`distilbert-base-uncased-finetuned-sst-2-english`) |
| Frontend | React 18, Vite 5 |
| Styling | Plain CSS |

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

API runs at `http://localhost:8000`. The single endpoint is `POST /analyse` — multipart form data with an `image` file and an optional `caption` string.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/analyse` to `localhost:8000` so there are no CORS issues during development.

---

## Notes

**First run downloads ~900 MB of weights.** BLIP base is roughly 900 MB; DistilBERT adds another ~250 MB. HuggingFace downloads and caches them automatically on first startup — expect 10–30 seconds before the server starts accepting requests. Subsequent runs load from the local cache and are fast.

**Why DistilBERT instead of VADER?** VADER is tuned for social-media text — short phrases, emoji, slang. It performs poorly on the kind of descriptive prose BLIP generates ("a group of people sitting around a table"). DistilBERT fine-tuned on SST-2 handles that register reliably and runs on CPU without being painfully slow.

**No caption provided?** Sentiment runs on the BLIP-generated description instead. You always get a result — the result card shows which text was actually classified so there's no ambiguity.

**Multi-image mode** disables the caption field. Each image goes through BLIP independently, which keeps the comparison meaningful — each card reflects what the model actually sees in that image, not a shared caption.
