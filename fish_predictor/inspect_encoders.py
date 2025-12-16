import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENCODER_PATH = os.path.join(BASE_DIR, "models", "label_encoders.pkl")

encoders = joblib.load(ENCODER_PATH)

print("\n===========================")
print("REGION LABELS IN MODEL")
print("===========================")
print(encoders["region"].classes_)

print("\n===========================")
print("MONTH LABELS IN MODEL")
print("===========================")
print(encoders["month"].classes_)

print("\n===========================")
print("SPECIES LABELS IN MODEL")
print("===========================")
print(encoders["species"].classes_)
