from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch
import io

# BLIP base is a reasonable balance — BLIP-large is more accurate but ~1.5GB
# and takes ages to load on CPU. Base is fine for a demo.
_processor = None
_model = None


def load_model():
    global _processor, _model
    _processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    _model = BlipForConditionalGeneration.from_pretrained(
        "Salesforce/blip-image-captioning-base"
    )
    _model.eval()  # inference only, no gradient tracking needed


def describe(image_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = _processor(image, return_tensors="pt")

    with torch.no_grad():
        output = _model.generate(**inputs, max_new_tokens=50)

    caption = _processor.decode(output[0], skip_special_tokens=True)
    return caption
