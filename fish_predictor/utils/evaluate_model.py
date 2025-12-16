import pandas as pd
import joblib
import os
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# === Load model and encoders ===
MODEL_PATH = os.path.join("models", "fish_model.pkl")
ENCODER_PATH = os.path.join("models", "label_encoders.pkl")
DATA_PATH = os.path.join("data", "fish_dataset.csv")

if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
    raise FileNotFoundError("Model or encoders not found! Please run train_model.py first.")

print("Loading trained model and encoders...")
model = joblib.load(MODEL_PATH)
label_encoders = joblib.load(ENCODER_PATH)

# === Load dataset ===
print("Loading dataset for evaluation...")
df = pd.read_csv(DATA_PATH)

# Encode categorical columns the same way as training
for col, le in label_encoders.items():
    if col.lower() in df.columns:
        df[col.lower()] = le.transform(df[col.lower()])

# Split into features and labels (use lowercase!)
X = df[["region", "month", "temperature", "salinity", "oxygen"]]
y_true = df["species"]

# === Evaluate model ===
print("Evaluating model...")
y_pred = model.predict(X)

print("\nClassification Report:")
print(classification_report(y_true, y_pred, zero_division=0))

# === Confusion Matrix ===
plt.figure(figsize=(8,6))
sns.heatmap(confusion_matrix(y_true, y_pred), annot=True, fmt="d", cmap="Blues")
plt.title("Confusion Matrix - Fish Predictor")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.show()

# === Manual Prediction ===
print("\nTest manual prediction below:")
try:
    region = input("Enter Region (e.g., Chennai Coast): ")
    month = input("Enter Month (e.g., May): ")
    temp = float(input("Enter Temperature (°C): "))
    salinity = float(input("Enter Salinity (PSU): "))
    oxygen = float(input("Enter Oxygen level (mg/L): "))

    # Encode inputs
    region_enc = label_encoders["Region"].transform([region])[0]
    month_enc = label_encoders["Month"].transform([month])[0]

    # Make prediction
    X_sample = [[region_enc, month_enc, temp, salinity, oxygen]]
    pred_species_enc = model.predict(X_sample)[0]
    pred_species = label_encoders["Species"].inverse_transform([pred_species_enc])[0]

    print(f"\nPredicted Species: {pred_species}")

except Exception as e:
    print("Error during prediction:", e)
