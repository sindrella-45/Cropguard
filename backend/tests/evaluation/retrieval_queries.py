"""
Evaluation query set for CropGuard AI RAG pipeline.

Contains 10 representative test queries covering
the most common crop diseases in Uganda and
East Africa.

These queries are used by:
    1. scripts/evaluate_retrieval.py
       to tune top_k and threshold settings
    2. rag/retrieval/evaluator.py
       for logging and monitoring
    3. Manual testing during development

Why these specific queries?
    Selected to cover:
    - Different crop types (tomato, maize, potato etc)
    - Different symptom types (colour, texture, growth)
    - Different disease categories (fungal, bacterial, viral)
    - Different severity levels (mild to severe)
    - Common East African crop diseases specifically

Addresses reviewer feedback:
    'Introduce a simple evaluation set (5-10
    representative queries) to measure retrieval
    quality'

Usage:
    from tests.evaluation.retrieval_queries import (
        EVALUATION_QUERIES,
        EXPECTED_TOPICS
    )
"""

# 10 representative test queries
# covering common East African crop diseases
EVALUATION_QUERIES: list[str] = [
    # Tomato diseases
    "yellow spots with brown borders on tomato leaves",
    "white powdery coating on tomato leaf surface",

    # Maize diseases
    "yellow streaking pattern along maize leaf veins",
    "gray lesions with dark borders on maize leaves",

    # Potato diseases
    "dark brown patches spreading on potato leaves",
    "water soaked spots turning brown on potato plant",

    # Banana diseases
    "black streaks inside banana plant stem",
    "yellow wilting of banana leaves from edges",

    # Cassava diseases
    "mosaic discoloration pattern on cassava leaves",

    # General symptoms
    "wilting and yellowing despite regular watering"
]


# Expected relevant topics for each query
# Used to manually verify retrieval quality
# during evaluation
EXPECTED_TOPICS: dict[str, list[str]] = {
    "yellow spots with brown borders on tomato leaves": [
        "early blight",
        "alternaria",
        "tomato fungal"
    ],
    "white powdery coating on tomato leaf surface": [
        "powdery mildew",
        "fungal",
        "tomato"
    ],
    "yellow streaking pattern along maize leaf veins": [
        "maize streak virus",
        "msv",
        "viral disease"
    ],
    "gray lesions with dark borders on maize leaves": [
        "gray leaf spot",
        "cercospora",
        "maize"
    ],
    "dark brown patches spreading on potato leaves": [
        "late blight",
        "phytophthora",
        "potato"
    ],
    "water soaked spots turning brown on potato plant": [
        "bacterial wilt",
        "early blight",
        "potato disease"
    ],
    "black streaks inside banana plant stem": [
        "banana xanthomonas wilt",
        "bxw",
        "bacterial"
    ],
    "yellow wilting of banana leaves from edges": [
        "panama disease",
        "fusarium wilt",
        "banana"
    ],
    "mosaic discoloration pattern on cassava leaves": [
        "cassava mosaic",
        "cmd",
        "viral"
    ],
    "wilting and yellowing despite regular watering": [
        "root rot",
        "fusarium",
        "bacterial wilt",
        "nutrient deficiency"
    ]
}


# Minimum acceptable similarity score
# for each query to pass evaluation
MINIMUM_SCORES: dict[str, float] = {
    query: 0.6
    for query in EVALUATION_QUERIES
}
