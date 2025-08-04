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

# Load classifiers
classifier = pipeline(
    "zero-shot-classification",
    model="MoritzLaurer/deberta-v3-base-zeroshot-v1",
    device="cpu"
)

# ✅ Sentiment pipeline added
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device="cpu"
)


def keyword_check(text):
    """Fallback when model confidence is low"""
    text_lower = text.lower()
    for cat_id, cat_data in CATEGORIES.items():
        if any(kw in text_lower for kw in cat_data["keywords"]):
            return cat_data["label"], 0.99
    return None, 0


@app.route('/categorize', methods=['POST'])
def categorize():
    data = request.get_json()
    text = data['text'].strip()

    # Analyze sentiment no matter what
    sentiment_result = sentiment_analyzer(text)[0]

    # First try keyword matching
    keyword_match, kw_confidence = keyword_check(text)
    if kw_confidence > 0:
        return jsonify({
            "category": keyword_match,
            "confidence": kw_confidence,
            "method": "keyword_match",
            "sentiment": {
                "label": sentiment_result['label'],
                "score": round(sentiment_result['score'], 2)
            }
        })

    # If no keywords, use model
    result = classifier(
        text,
        [cat["label"] for cat in CATEGORIES.values()]
    )

    if result['scores'][0] < 0.6:
        return jsonify({
            "category": keyword_match or result['labels'][0],
            "confidence": max(kw_confidence, result['scores'][0]),
            "warning": "Low confidence prediction",
            "details": dict(zip(result['labels'], result['scores'])),
            "sentiment": {
                "label": sentiment_result['label'],
                "score": round(sentiment_result['score'], 2)
            }
        })

    return jsonify({
        "category": result['labels'][0],
        "confidence": round(result['scores'][0], 2),
        "method": "model_prediction",
        "sentiment": {
            "label": sentiment_result['label'],
            "score": round(sentiment_result['score'], 2)
        }
    })


if __name__ == '__main__':
    print("is it working ?")
    app.run(host='0.0.0.0', port=5001)
