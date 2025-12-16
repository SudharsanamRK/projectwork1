import pandas as pd
import random

# ------------------------------
# Define possible categorical values
# ------------------------------
regions = ["Chennai Coast", "Kerala Coast", "Goa Coast", "Andaman Sea", "Rameswaram", "Visakhapatnam"]
months = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]
species_info = {
    "Mackerel":  {"temp": (26, 30), "depth": (10, 60), "regions": ["Chennai Coast", "Kerala Coast", "Goa Coast"]},
    "Sardine":   {"temp": (25, 29), "depth": (20, 80), "regions": ["Kerala Coast", "Rameswaram"]},
    "Tuna":      {"temp": (28, 32), "depth": (60, 200), "regions": ["Andaman Sea", "Visakhapatnam"]},
    "Anchovy":   {"temp": (24, 28), "depth": (10, 50), "regions": ["Kerala Coast", "Chennai Coast"]},
    "Snapper":   {"temp": (27, 30), "depth": (40, 120), "regions": ["Andaman Sea", "Goa Coast"]},
    "Pomfret":   {"temp": (25, 29), "depth": (30, 90), "regions": ["Rameswaram", "Chennai Coast"]},
    "Seer Fish": {"temp": (27, 31), "depth": (20, 100), "regions": ["Goa Coast", "Visakhapatnam"]}
}

# ------------------------------
# Helper function to generate one record
# ------------------------------
def generate_row():
    fish = random.choice(list(species_info.keys()))
    info = species_info[fish]

    # Random realistic parameters based on species
    region = random.choice(info["regions"])
    month = random.choice(months)
    temperature = round(random.uniform(info["temp"][0], info["temp"][1]), 1)
    salinity = round(random.uniform(33.0, 36.0), 1)
    depth = random.randint(info["depth"][0], info["depth"][1])
    oxygen = round(random.uniform(4.5, 8.0), 1)
    turbidity = round(random.uniform(1.0, 10.0), 1)

    return {
        "region": region,
        "month": month,
        "temperature": temperature,
        "salinity": salinity,
        "depth": depth,
        "oxygen": oxygen,
        "turbidity": turbidity,
        "species": fish
    }

# ------------------------------
# Generate dataset
# ------------------------------
def generate_dataset(num_samples=1000, output_file="fish_dataset.csv"):
    data = [generate_row() for _ in range(num_samples)]
    df = pd.DataFrame(data)
    df.to_csv(output_file, index=False)
    print(f"✅ {output_file} created successfully with {num_samples} samples!")

if __name__ == "__main__":
    generate_dataset(num_samples=1000)
