import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Load dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), "fish_dataset.csv")
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError("Dataset not found! Please run generate_dataset.py first.")

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)
print(df.head())

# Normalize column names (in case of mixed casing)
df.columns = df.columns.str.lower()

# Encode categorical columns
label_encoders = {}
categorical_cols = ["region", "month", "species"]

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Define features (inputs) and target (output)
X = df[["region", "month", "temperature", "salinity", "oxygen"]]
y = df["species"]

# Split data into training/testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Initialize and train RandomForest model
print("Training RandomForest model...")
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
accuracy = model.score(X_test, y_test)
print(f"Model trained successfully with accuracy: {accuracy:.2f}")

# Save model & encoders
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/fish_model.pkl")
joblib.dump(label_encoders, "models/label_encoders.pkl")

print("Model and encoders saved successfully in /models/ directory.")
