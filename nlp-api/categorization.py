from flask import Flask, request, jsonify
from transformers import pipeline
import re

app = Flask(__name__)

# Optimized categories with clear distinctions
CATEGORIES = {
    "payment": {
        "label": "Payment issues (failed transactions, declined cards)",
        "keywords": ["payment", "pay", "declined", "failed", "charge", "credit card"]
    },
    "account": {
        "label": "Account problems (login failures, password reset)",
        "keywords": ["login", "account", "password", "sign in", "credentials"]
    },
    "technical": {
        "label": "Technical errors (website down, features broken)",
        "keywords": ["error", "broken", "not working", "crash", "website", "page"]
    }
}

# Load model
classifier = pipeline(
    "zero-shot-classification",
    model="MoritzLaurer/deberta-v3-base-zeroshot-v1",  # More accurate model
    device="cpu"
)


def keyword_check(text):
    """Fallback when model confidence is low"""
    text_lower = text.lower()
    for cat_id, cat_data in CATEGORIES.items():
        if any(kw in text_lower for kw in cat_data["keywords"]):
            # High confidence for keyword matches
            return cat_data["label"], 0.99
    return None, 0


@app.route('/categorize', methods=['POST'])
def categorize():
    data = request.get_json()
    text = data['text'].strip()

    # First try keyword matching
    keyword_match, kw_confidence = keyword_check(text)
    if kw_confidence > 0:
        return jsonify({
            "category": keyword_match,
            "confidence": kw_confidence,
            "method": "keyword_match"
        })

    # If no keywords, use model
    result = classifier(
        text,
        [cat["label"] for cat in CATEGORIES.values()]
    )

    # If model confidence is low, use keyword fallback again
    if result['scores'][0] < 0.6:
        return jsonify({
            "category": keyword_match or result['labels'][0],
            "confidence": max(kw_confidence, result['scores'][0]),
            "warning": "Low confidence prediction",
            "details": dict(zip(result['labels'], result['scores']))
        })

    return jsonify({
        "category": result['labels'][0],
        "confidence": round(result['scores'][0], 2),
        "method": "model_prediction"
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
