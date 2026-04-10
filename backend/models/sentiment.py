from transformers import pipeline

# distilbert fine-tuned on SST-2 — small enough to run locally without a GPU,
# good enough for general-purpose positive/negative classification
_classifier = None


def load_model():
    global _classifier
    # load once at startup; this blocks for a moment on first run if weights aren't cached
    _classifier = pipeline(
        "text-classification",
        model="distilbert-base-uncased-finetuned-sst-2-english",
    )


def analyse(text: str) -> dict:
    if not text.strip():
        # empty caption — skip classification rather than padding with garbage
        return {"label": "neutral", "score": 1.0}

    result = _classifier(text)[0]
    label = result["label"].lower()  # POSITIVE / NEGATIVE → lowercase
    return {"label": label, "score": round(result["score"], 4)}
