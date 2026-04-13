# SnapSentiment

Upload an image, optionally add a caption, and get back an AI-generated description of what's in the photo plus a sentiment read on the text. Built as a quick end-to-end demo of plugging HuggingFace vision and NLP models into a FastAPI + React stack — no database, no auth, just the interesting bits.

![Demo](docs/demo.png)

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

**No caption?** If you leave the caption field blank, sentiment is run on the model-generated image description instead, so you always get a result.
