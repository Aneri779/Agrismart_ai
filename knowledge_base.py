"""
AgriSmart AI — Disease Knowledge Base
======================================
Fixed, human-verified reference content for all 38 PlantVillage classes.

This is NOT generated per-request by the LLM. The GenAI assistant is
grounded against this file — it may only rephrase/explain this content
in plain language, never invent symptoms or precautions beyond what's
listed here (plus generic safe advice like "consult a local agronomist").

Structure per class:
    symptoms      : list[str]  — visible signs of the disease (empty for healthy classes)
    precautions   : list[str]  — actionable management/treatment steps
    severity_hint : str        — "none" | "low" | "medium" | "high"
                                  (a simple heuristic label, not a model output)

Keys match the exact class folder names from the PlantVillage dataset
(config.CLASS_NAMES), so they can be looked up directly using the
label returned by predict().
"""

KNOWLEDGE_BASE: dict[str, dict] = {

    # ── Apple ──────────────────────────────────────────────
    "Apple___Apple_scab": {
        "symptoms": [
            "Olive-green to dark brown velvety spots on leaves",
            "Scabby, corky lesions on fruit surface",
            "Premature leaf yellowing and drop in severe cases",
        ],
        "precautions": [
            "Remove and destroy fallen leaves in autumn to reduce overwintering spores",
            "Apply a preventive fungicide spray (e.g. captan or myclobutanil) starting at bud break",
            "Prune to improve air circulation within the canopy",
            "Choose scab-resistant apple varieties for future planting",
        ],
        "severity_hint": "medium",
    },
    "Apple___Black_rot": {
        "symptoms": [
            "Purple-bordered brown spots on leaves (\"frog-eye leaf spot\")",
            "Sunken, concentric-ringed rotting lesions on fruit",
            "Cankers with reddish-brown, cracked bark on branches",
        ],
        "precautions": [
            "Prune out and destroy cankered or dead wood during dormant season",
            "Remove mummified fruit left on the tree or ground",
            "Apply fungicide during the growing season, especially after wounds/hail",
            "Avoid tree stress — maintain proper watering and fertilization",
        ],
        "severity_hint": "high",
    },
    "Apple___Cedar_apple_rust": {
        "symptoms": [
            "Bright yellow-orange spots on upper leaf surface",
            "Small black dots within the yellow spots",
            "Orange, tube-like structures on the underside of leaves in wet weather",
        ],
        "precautions": [
            "Remove nearby juniper/cedar trees if feasible (alternate host of this fungus)",
            "Apply fungicide in spring during the period between bud break and mid-summer",
            "Plant rust-resistant apple varieties",
        ],
        "severity_hint": "low",
    },
    "Apple___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue regular monitoring for early signs of pests or disease",
            "Maintain balanced watering and fertilization schedule",
            "Prune annually to keep good air circulation",
        ],
        "severity_hint": "none",
    },

    # ── Blueberry ──────────────────────────────────────────
    "Blueberry___healthy": {
        "symptoms": [],
        "precautions": [
            "Maintain acidic, well-drained soil (pH 4.5–5.5)",
            "Mulch to retain moisture and suppress weeds",
            "Monitor regularly for early pest or disease signs",
        ],
        "severity_hint": "none",
    },

    # ── Cherry ─────────────────────────────────────────────
    "Cherry_(including_sour)___Powdery_mildew": {
        "symptoms": [
            "White powdery fungal growth on leaves and shoots",
            "Leaf curling and distortion",
            "Stunted new growth",
        ],
        "precautions": [
            "Improve air circulation through pruning",
            "Apply sulfur-based or approved fungicide at first sign of disease",
            "Avoid excess nitrogen fertilizer, which encourages susceptible new growth",
        ],
        "severity_hint": "medium",
    },
    "Cherry_(including_sour)___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue routine monitoring for pests and disease",
            "Maintain proper pruning for airflow",
        ],
        "severity_hint": "none",
    },

    # ── Corn (Maize) ───────────────────────────────────────
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "symptoms": [
            "Small, rectangular tan-to-gray lesions running parallel to leaf veins",
            "Lesions may merge, causing large areas of dead tissue",
            "Most severe in lower leaves first",
        ],
        "precautions": [
            "Rotate crops with non-host species (e.g. soybean) for at least one season",
            "Use resistant hybrids where available",
            "Apply foliar fungicide if disease appears before tasseling in susceptible fields",
            "Manage crop residue — tillage can reduce fungal spore survival",
        ],
        "severity_hint": "medium",
    },
    "Corn_(maize)___Common_rust_": {
        "symptoms": [
            "Small, reddish-brown, powdery pustules on both leaf surfaces",
            "Pustules may darken to brown/black as they mature",
        ],
        "precautions": [
            "Plant rust-resistant corn hybrids",
            "Apply fungicide if infection is severe and occurs early in the season",
            "Monitor fields regularly, especially in cool, humid weather",
        ],
        "severity_hint": "low",
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "symptoms": [
            "Long, elliptical gray-green to tan lesions on leaves",
            "Lesions can grow to several inches, reducing photosynthetic area",
        ],
        "precautions": [
            "Use resistant hybrids",
            "Rotate crops to reduce residue-borne inoculum",
            "Apply fungicide at early disease onset if conditions favor spread (humid, moderate temperatures)",
        ],
        "severity_hint": "medium",
    },
    "Corn_(maize)___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue regular field scouting",
            "Maintain balanced nutrient and irrigation management",
        ],
        "severity_hint": "none",
    },

    # ── Grape ──────────────────────────────────────────────
    "Grape___Black_rot": {
        "symptoms": [
            "Small tan spots with dark borders on leaves",
            "Black, shriveled, mummified berries",
            "Reddish-brown lesions on shoots and tendrils",
        ],
        "precautions": [
            "Remove mummified berries and infected plant debris",
            "Apply fungicide starting at early shoot growth through fruit set",
            "Improve canopy airflow through proper pruning and trellising",
        ],
        "severity_hint": "high",
    },
    "Grape___Esca_(Black_Measles)": {
        "symptoms": [
            "\"Tiger-stripe\" pattern of yellow/brown streaks between leaf veins",
            "Dark spots on berries (measles-like appearance)",
            "Wood discoloration inside affected vines",
        ],
        "precautions": [
            "Prune out and destroy infected wood during dry weather",
            "Avoid large pruning wounds; treat cuts with wound protectant if possible",
            "There is no full cure — focus on prevention and removing severely affected vines",
        ],
        "severity_hint": "high",
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "symptoms": [
            "Irregular dark brown to reddish-brown spots on leaves",
            "Spots may have a yellow halo",
            "Premature defoliation in severe cases",
        ],
        "precautions": [
            "Remove and destroy fallen infected leaves",
            "Apply copper-based or other approved fungicide during wet periods",
            "Ensure good canopy ventilation through pruning",
        ],
        "severity_hint": "medium",
    },
    "Grape___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue routine canopy management and monitoring",
            "Maintain good airflow through proper pruning and trellising",
        ],
        "severity_hint": "none",
    },

    # ── Orange ─────────────────────────────────────────────
    "Orange___Haunglongbing_(Citrus_greening)": {
        "symptoms": [
            "Blotchy, asymmetric yellowing of leaves (unlike nutrient deficiency, which is symmetric)",
            "Small, lopsided, bitter-tasting fruit",
            "Twig dieback and gradual tree decline",
        ],
        "precautions": [
            "There is no cure — infected trees should be removed to prevent spread",
            "Control the Asian citrus psyllid insect vector with approved insecticides",
            "Use certified disease-free planting material",
            "Contact local agricultural authority, as this disease is often subject to regulatory reporting",
        ],
        "severity_hint": "high",
    },

    # ── Peach ──────────────────────────────────────────────
    "Peach___Bacterial_spot": {
        "symptoms": [
            "Small, dark, water-soaked spots on leaves that may fall out, leaving a \"shot-hole\" appearance",
            "Sunken, dark lesions on fruit surface",
        ],
        "precautions": [
            "Plant resistant peach varieties where available",
            "Apply copper-based bactericide sprays during dormant season and early growth",
            "Avoid overhead irrigation, which spreads bacteria",
            "Prune to improve air circulation",
        ],
        "severity_hint": "medium",
    },
    "Peach___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue regular monitoring for pests and disease",
            "Maintain proper pruning and irrigation practices",
        ],
        "severity_hint": "none",
    },

    # ── Pepper, bell ───────────────────────────────────────
    "Pepper,_bell___Bacterial_spot": {
        "symptoms": [
            "Small, dark, water-soaked spots on leaves with yellow halos",
            "Raised, scabby spots on fruit",
            "Leaf drop in severe infections",
        ],
        "precautions": [
            "Use certified disease-free seeds and transplants",
            "Avoid overhead watering; use drip irrigation instead",
            "Apply copper-based bactericide as a preventive measure",
            "Rotate crops with non-solanaceous plants",
        ],
        "severity_hint": "medium",
    },
    "Pepper,_bell___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue routine monitoring for pests and disease",
            "Maintain consistent watering to avoid plant stress",
        ],
        "severity_hint": "none",
    },

    # ── Potato ─────────────────────────────────────────────
    "Potato___Early_blight": {
        "symptoms": [
            "Dark brown spots with concentric \"target-like\" rings on lower/older leaves first",
            "Yellowing of tissue surrounding spots",
            "Lesions may also appear on stems and tubers",
        ],
        "precautions": [
            "Remove and destroy infected plant debris after harvest",
            "Rotate crops with non-solanaceous plants for at least 2 years",
            "Apply fungicide preventively in favorable (warm, humid) conditions",
            "Avoid overhead irrigation; water at the base of plants",
        ],
        "severity_hint": "medium",
    },
    "Potato___Late_blight": {
        "symptoms": [
            "Water-soaked, pale-to-dark green lesions on leaves that rapidly turn brown/black",
            "White fungal growth on the underside of leaves in humid conditions",
            "Firm, dark, rotting lesions on tubers",
        ],
        "precautions": [
            "Act quickly — this disease can destroy a crop within days in favorable weather",
            "Apply fungicide immediately at first sign of infection",
            "Remove and destroy infected plants; do not compost",
            "Ensure good field drainage and avoid overhead watering",
        ],
        "severity_hint": "high",
    },
    "Potato___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue regular field monitoring, especially during humid weather",
            "Practice crop rotation to reduce disease risk over time",
        ],
        "severity_hint": "none",
    },

    # ── Raspberry ──────────────────────────────────────────
    "Raspberry___healthy": {
        "symptoms": [],
        "precautions": [
            "Maintain good air circulation through proper cane spacing/pruning",
            "Continue routine monitoring for pests and disease",
        ],
        "severity_hint": "none",
    },

    # ── Soybean ────────────────────────────────────────────
    "Soybean___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue routine field scouting for pests and disease",
            "Practice crop rotation to maintain soil health",
        ],
        "severity_hint": "none",
    },

    # ── Squash ─────────────────────────────────────────────
    "Squash___Powdery_mildew": {
        "symptoms": [
            "White, powdery fungal patches on upper and lower leaf surfaces",
            "Leaves may yellow and become brittle as infection spreads",
            "Reduced fruit yield and quality in severe cases",
        ],
        "precautions": [
            "Apply sulfur-based or approved fungicide at first sign of disease",
            "Ensure adequate plant spacing for good air circulation",
            "Water at the base of plants, avoiding wetting the foliage",
            "Choose powdery-mildew-resistant squash varieties",
        ],
        "severity_hint": "medium",
    },

    # ── Strawberry ─────────────────────────────────────────
    "Strawberry___Leaf_scorch": {
        "symptoms": [
            "Small, irregular purple-to-red spots on leaves",
            "Spots enlarge and merge, giving a scorched appearance",
            "Reduced plant vigor in severe infections",
        ],
        "precautions": [
            "Remove and destroy infected leaves after harvest",
            "Ensure good air circulation through proper plant spacing",
            "Apply fungicide if infection is widespread",
            "Avoid overhead watering",
        ],
        "severity_hint": "medium",
    },
    "Strawberry___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue routine monitoring for pests and disease",
            "Maintain proper spacing and mulching",
        ],
        "severity_hint": "none",
    },

    # ── Tomato ─────────────────────────────────────────────
    "Tomato___Bacterial_spot": {
        "symptoms": [
            "Small, dark, water-soaked spots on leaves, often with yellow halos",
            "Raised, scabby spots on fruit",
            "Leaf yellowing and drop in severe cases",
        ],
        "precautions": [
            "Use certified disease-free seeds and transplants",
            "Avoid overhead watering; use drip irrigation",
            "Apply copper-based bactericide as a preventive measure",
            "Rotate crops with non-solanaceous plants",
        ],
        "severity_hint": "medium",
    },
    "Tomato___Early_blight": {
        "symptoms": [
            "Dark brown spots with concentric \"target-like\" rings, starting on older/lower leaves",
            "Yellowing of surrounding leaf tissue",
            "Leaf drop in severe cases, which can expose fruit to sunscald",
        ],
        "precautions": [
            "Remove and destroy affected leaves promptly",
            "Improve air circulation around plants (proper spacing/staking)",
            "Avoid overhead watering; water at the base",
            "Apply fungicide preventively in warm, humid conditions",
        ],
        "severity_hint": "medium",
    },
    "Tomato___Late_blight": {
        "symptoms": [
            "Large, water-soaked, greasy-looking dark lesions on leaves",
            "White fungal growth on leaf undersides in humid conditions",
            "Firm, brown, rotting lesions on fruit",
        ],
        "precautions": [
            "Act quickly — this disease spreads rapidly in cool, wet weather",
            "Remove and destroy infected plants immediately; do not compost",
            "Apply fungicide at first sign of disease",
            "Avoid overhead irrigation and ensure good field drainage",
        ],
        "severity_hint": "high",
    },
    "Tomato___Leaf_Mold": {
        "symptoms": [
            "Pale green or yellow spots on upper leaf surface",
            "Olive-green to grayish-purple fuzzy mold on the underside of leaves",
            "Most common in humid greenhouse conditions",
        ],
        "precautions": [
            "Improve ventilation and reduce humidity around plants",
            "Avoid overhead watering",
            "Remove and destroy infected leaves",
            "Apply fungicide if conditions remain humid and infection persists",
        ],
        "severity_hint": "medium",
    },
    "Tomato___Septoria_leaf_spot": {
        "symptoms": [
            "Small, circular spots with dark borders and light gray/tan centers",
            "Tiny black specks (fungal fruiting bodies) visible within spots",
            "Starts on lower leaves and moves upward",
        ],
        "precautions": [
            "Remove and destroy infected lower leaves promptly",
            "Avoid overhead watering; water at the base of plants",
            "Apply fungicide if infection spreads significantly",
            "Rotate crops and clear plant debris after harvest",
        ],
        "severity_hint": "medium",
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "symptoms": [
            "Fine yellow/white stippling or speckling on leaves",
            "Fine webbing visible on the underside of leaves or between stems",
            "Leaves may turn bronze/yellow and dry out in heavy infestations",
        ],
        "precautions": [
            "Spray plants with water to dislodge mites, especially leaf undersides",
            "Introduce natural predators (e.g. predatory mites) where feasible",
            "Apply insecticidal soap or miticide if infestation is severe",
            "Avoid excessive drought stress, which favors mite populations",
        ],
        "severity_hint": "medium",
    },
    "Tomato___Target_Spot": {
        "symptoms": [
            "Small, dark, water-soaked spots that develop concentric \"target\" rings",
            "Spots may appear on leaves, stems, and fruit",
            "Can cause significant leaf drop in severe infections",
        ],
        "precautions": [
            "Remove and destroy infected plant debris",
            "Improve air circulation through proper spacing and staking",
            "Apply fungicide preventively in warm, humid conditions",
            "Avoid overhead watering",
        ],
        "severity_hint": "medium",
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "symptoms": [
            "Upward curling and yellowing of leaves, especially at leaf margins",
            "Stunted plant growth and reduced fruit production",
            "Spread primarily by whiteflies",
        ],
        "precautions": [
            "Control whitefly populations with approved insecticides or sticky traps",
            "Remove and destroy infected plants to reduce virus spread",
            "Use virus-resistant tomato varieties where available",
            "Use reflective mulches to help repel whiteflies",
        ],
        "severity_hint": "high",
    },
    "Tomato___Tomato_mosaic_virus": {
        "symptoms": [
            "Mottled light and dark green pattern (mosaic) on leaves",
            "Leaf curling, distortion, and stunted growth",
            "Reduced fruit yield and quality",
        ],
        "precautions": [
            "Remove and destroy infected plants — there is no cure",
            "Wash hands and tools after handling infected plants to prevent mechanical spread",
            "Use virus-free certified seed",
            "Control weeds that may host the virus",
        ],
        "severity_hint": "high",
    },
    "Tomato___healthy": {
        "symptoms": [],
        "precautions": [
            "Continue routine monitoring for pests and disease",
            "Maintain consistent watering and proper staking/support",
        ],
        "severity_hint": "none",
    },
}


def get_disease_info(class_label: str) -> dict:
    """
    Look up symptoms/precautions/severity for a predicted class label.
    Returns a safe default if the label isn't found (e.g. "Uncertain").
    """
    return KNOWLEDGE_BASE.get(
        class_label,
        {
            "symptoms": [],
            "precautions": [
                "Unable to determine specific guidance — consult a local agricultural expert for an accurate diagnosis.",
            ],
            "severity_hint": "unknown",
        },
    )
