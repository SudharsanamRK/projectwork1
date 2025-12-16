import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import math, random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# ----------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "data", "india_dataset.csv")

if not os.path.exists(DATASET_PATH):
    raise FileNotFoundError(f"❌ INDIA dataset missing at: {DATASET_PATH}")

df_india = pd.read_csv(DATASET_PATH)

# Validate required columns (keeps original checks)
required_cols = [
    "state","species","min_price_Rs_per_kg","max_price_Rs_per_kg",
    "catch_probability","sst_C","chlorophyll_mg_m3"
]
for col in required_cols:
    if col not in df_india.columns:
        raise ValueError(f"❌ Dataset missing column: {col}")

# ----------------------------------------------------
MODEL_PATH = os.path.join(BASE_DIR, "models", "fish_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "models", "label_encoders.pkl")

model = joblib.load(MODEL_PATH)
encoders = joblib.load(ENCODER_PATH)

print("✅ Model + Dataset Loaded Successfully")

def decode_species(encoded):
    return encoders["species"].inverse_transform([encoded])[0]

# ----------------- REGION NORMALIZATION -----------------
# Mapping from names the UI might show to labels the model expects.
# Update this mapping if you add other friendly names in the frontend.
REGION_MAP = {
    "Kochi Backwaters": "Kerala Coast",
    "Kochi": "Kerala Coast",
    "Ernakulam": "Kerala Coast",
    "Goa Bay": "Goa Coast",
    "Panaji": "Goa Coast",
    "Chennai Marina": "Chennai Coast",
    "Marina Beach": "Chennai Coast",
    "Mumbai Harbor": "Visakhapatnam",  # approximate fallback if you don't have Mumbai in model
    # you can add more aliases here
}

def normalize_region(region):
    if not region:
        return region
    # exact match: if the frontend already sends model label, pass through
    if region in encoders["region"].classes_:
        return region
    # try map
    mapped = REGION_MAP.get(region)
    if mapped:
        return mapped
    # fallback: try to match by substring (case-insensitive)
    for known in encoders["region"].classes_:
        if known.lower() in region.lower() or region.lower() in known.lower():
            return known
    # last resort: return a safe default (first encoder class)
    return encoders["region"].classes_[0]

# ----------------------------------------------------
@app.route("/regions", methods=["GET"])
def regions():
    # Return the list of region labels the model expects.
    return jsonify({"regions": encoders["region"].classes_.tolist()})

# ----------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    # normalize user region before encoding
    region_raw = data.get("region", "")
    region = normalize_region(region_raw)

    month_raw = data.get("month", "")
    # month likely already matches encoder (we validated months earlier)
    month = month_raw

    try:
        region_encoded = encoders["region"].transform([region])[0]
        month_encoded = encoders["month"].transform([month])[0]
    except Exception as e:
        # safe fallback — send a helpful message for debugging
        return jsonify({"error": f"Encoding failed for region/month - region:{region_raw} -> {region}, month:{month_raw}. Exception: {str(e)}"}), 400

    X = [[region_encoded,
          month_encoded,
          float(data.get("temperature", 0)),
          float(data.get("salinity", 0)),
          float(data.get("oxygen", 0))]]

    pred = model.predict(X)[0]
    species = decode_species(pred)

    return jsonify({"predicted_species": species})

# ----------------------------------------------------
@app.route("/predict_proba", methods=["POST"])
def predict_proba():
    data = request.get_json()
    region = normalize_region(data.get("region", ""))
    month = data.get("month", "")

    try:
        region_encoded = encoders["region"].transform([region])[0]
        month_encoded = encoders["month"].transform([month])[0]
    except Exception as e:
        return jsonify({"error": f"Encoding failed: {str(e)}"}), 400

    X = [[region_encoded,
          month_encoded,
          float(data.get("temperature", 0)),
          float(data.get("salinity", 0)),
          float(data.get("oxygen", 0))]]

    proba = model.predict_proba(X)[0]
    classes = model.classes_

    output = [
        {"species": decode_species(cls), "probability": float(p)}
        for cls, p in zip(classes, proba)
    ]

    return jsonify(sorted(output, key=lambda x: x["probability"], reverse=True))

# ----------------------------------------------------
@app.route("/region/conditions")
def region_conditions():
    lat = float(request.args.get("lat", 13.05))
    lng = float(request.args.get("lng", 80.27))

    return jsonify({
        "temperature": round(27 + np.sin(lat / 5) + random.uniform(-0.3,0.3), 2),
        "salinity": round(34 + np.cos(lng / 10) + random.uniform(-0.2,0.2), 2),
        "oxygen": round(6.5 + np.sin(lat / 10) + random.uniform(-0.3,0.3), 2),
        "wave_height": round(0.5 + random.random(), 2),
        "wind": f"{random.randint(5, 15)} km/h W",
        "tide": "High tide in 3 hours"
    })

# ----------------------------------------------------
@app.route("/trends7d")
def trends7d():
    species = request.args.get("species", "Tuna")
    today = datetime.now().date()

    base_price = df_india[df_india["species"].str.contains(species, case=False, na=False)] \
                    [["min_price_Rs_per_kg","max_price_Rs_per_kg"]] \
                    .mean() \
                    .mean()

    if pd.isna(base_price):
        base_price = random.uniform(100,300)

    series = [
        {
            "date": (today + timedelta(days=i)).isoformat(),
            "price": round(base_price + math.sin(i/2)*10 + random.uniform(-3,3), 2)
        }
        for i in range(7)
    ]

    return jsonify({"species": species, "series": series})

# ----------------------------------------------------
@app.route("/recommendation", methods=["POST"])
def recommendation():
    data = request.get_json()
    region_raw = data.get("region", "")
    region = normalize_region(region_raw)
    month = data.get("month", "")

    try:
        region_encoded = encoders["region"].transform([region])[0]
        month_encoded = encoders["month"].transform([month])[0]
    except Exception as e:
        return jsonify({"error": f"Encoding failed: {str(e)}"}), 400

    X = [[region_encoded,
          month_encoded,
          float(data.get("temperature", 0)),
          float(data.get("salinity", 0)),
          float(data.get("oxygen", 0))]]

    proba = model.predict_proba(X)[0]
    classes = model.classes_

    ml_scores = {decode_species(cls): float(p) for cls, p in zip(classes, proba)}

    region_data = df_india[df_india["state"].str.contains(region.split()[0], case=False, na=False)]

    price_scores = {}
    for _, row in region_data.iterrows():
        avg_price = (row["min_price_Rs_per_kg"] + row["max_price_Rs_per_kg"]) / 2
        price_scores[row["species"]] = avg_price

    if not price_scores:
        return jsonify({"error": "No price data for region"}), 404

    max_price = max(price_scores.values())

    final_scores = {
        species: ml_scores.get(species,0) * (price_scores.get(species,1) / max_price)
        for species in ml_scores
    }

    best = max(final_scores, key=final_scores.get)

    return jsonify({
        "region": region,
        "recommended": best,
        "confidence": round(final_scores[best], 3),
        "price": price_scores.get(best, "N/A"),
        "reason": f"{best} has high abundance and strong market price in {region}"
    })

# ----------------------------------------------------
@app.route("/advanced_predict", methods=["POST"])
def advanced_predict():
    data = request.get_json()

    region_raw = data.get("region", "Kerala Coast")
    region = normalize_region(region_raw)
    month = data.get("month", "January")

    try:
        region_encoded = encoders["region"].transform([region])[0]
        month_encoded = encoders["month"].transform([month])[0]
    except Exception as e:
        return jsonify({"error": f"Encoding failed: {str(e)}"}), 400

    X = [[
        region_encoded,
        month_encoded,
        float(data.get("temperature", 0)),
        float(data.get("salinity", 0)),
        float(data.get("oxygen", 0))
    ]]

    proba = model.predict_proba(X)[0]
    classes = model.classes_

    species = decode_species(classes[np.argmax(proba)])
    probability = float(max(proba))

    region_data = df_india[df_india["state"].str.contains(region.split()[0], case=False)]
    price = region_data[region_data["species"] == species]["max_price_Rs_per_kg"].mean()

    best_time = "4:30 AM – 7:00 AM" if probability > 0.5 else "6:00 AM – 9:00 AM"

    wave = random.uniform(0.5, 2.5)
    risk = "LOW" if wave < 1 else "MEDIUM" if wave < 1.8 else "HIGH"

    return jsonify({
        "species": species,
        "probability": round(probability, 2),
        "price": round(price, 2) if not np.isnan(price) else "N/A",
        "best_time": best_time,
        "risk": risk,
        "wave_height": round(wave, 2),
        "message": f"Best chance to catch {species} today near {region}!"
    })

# ----------------------------------------------------
@app.route("/heatmap", methods=["GET"])
def heatmap():
    grouped = df_india.groupby(["state","lat","lon"]).agg({
        "catch_probability":"mean",
        "min_price_Rs_per_kg":"mean",
        "max_price_Rs_per_kg":"mean"
    }).reset_index()

    grouped["score"] = (
        grouped["catch_probability"] * 0.6 +
        ((grouped["max_price_Rs_per_kg"] + grouped["min_price_Rs_per_kg"]) / 2) / grouped["max_price_Rs_per_kg"].max() * 0.4
    )

    result = grouped.to_dict(orient="records")
    return jsonify({"locations": result})

# -------------------- Backward-compatible /predict_market --------------------
@app.route("/predict_market", methods=["POST"])
def predict_market():
    data = request.get_json() or {}
    region_raw = data.get("region", "")
    month_raw = data.get("month", "") or datetime.now().strftime("%B")

    # normalize region to encoder labels
    region = normalize_region(region_raw)
    month = month_raw

    try:
        region_encoded = encoders["region"].transform([region])[0]
        month_encoded = encoders["month"].transform([month])[0]
    except Exception as e:
        return jsonify({"error": f"Encoding failed: region '{region_raw}' -> '{region}', month '{month_raw}'. {str(e)}"}), 400

    X = [[
        region_encoded,
        month_encoded,
        float(data.get("temperature", 0)),
        float(data.get("salinity", 0)),
        float(data.get("oxygen", 6.5))
    ]]

    # model predict safely
    try:
        proba = model.predict_proba(X)[0]
        classes = model.classes_
        best_idx = int(np.argmax(proba))
        predicted_encoded = classes[best_idx]
        try:
            predicted_species = decode_species(predicted_encoded)
        except Exception:
            predicted_species = str(predicted_encoded)
        confidence = float(proba[best_idx])
    except Exception:
        predicted_species = "Unknown"
        confidence = 0.0

    # expected catch heuristic (same idea as your recommendation route)
    fishing_effort = float(data.get("fishingEffort", 5) or 5)
    base_catch = 20.0
    try:
        region_df = df_india[df_india["state"].str.contains(str(region).split()[0], case=False, na=False)]
        if not region_df.empty and "catch_probability" in region_df.columns:
            base_catch = float(max(1.0, region_df["catch_probability"].mean() * 50))
    except Exception:
        base_catch = 20.0

    expected_catch = round(base_catch * (0.5 + confidence) * (fishing_effort / 5.0) * (0.9 + random.random() * 0.2), 2)

    # price forecast from dataset
    price_forecast = "N/A"
    try:
        subset = df_india[df_india["species"].str.contains(str(predicted_species), case=False, na=False)]
        if not subset.empty:
            price_forecast = float(((subset["min_price_Rs_per_kg"].mean() + subset["max_price_Rs_per_kg"].mean()) / 2))
    except Exception:
        price_forecast = "N/A"

    # simple recommendation text
    rec = []
    if confidence > 0.7 and price_forecast != "N/A" and price_forecast > 300:
        rec.append("High chance & attractive price — consider selling at peak.")
    elif confidence > 0.7:
        rec.append("High catch probability — good time to fish.")
    elif confidence > 0.4:
        rec.append("Moderate chance — monitor conditions and effort.")
    else:
        rec.append("Low probability — avoid high fuel/effort trips.")

    if price_forecast != "N/A":
        if price_forecast >= 500:
            rec.append("Price strong in local markets.")
        elif price_forecast < 200:
            rec.append("Local price weak — consider storing inventory.")

    market_recommendation = " ".join(rec)

    return jsonify({
        "predicted_species": predicted_species,
        "expected_catch_kg": expected_catch,
        "price_forecast": price_forecast,
        "market_recommendation": market_recommendation,
        "confidence": round(confidence, 3),
    })

# ----------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False, use_reloader=False)
