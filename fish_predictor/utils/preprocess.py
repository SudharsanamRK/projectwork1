def preprocess_input(region, month):
    # Dummy encoding — in real model, match your training data encoding
    region_map = {"Chennai": 0, "Goa": 1, "Kochi": 2, "Mumbai": 3}
    month_map = {
        "January": 1, "February": 2, "March": 3, "April": 4,
        "May": 5, "June": 6, "July": 7, "August": 8,
        "September": 9, "October": 10, "November": 11, "December": 12
    }

    region_encoded = region_map.get(region, 0)
    month_encoded = month_map.get(month, 1)

    return [region_encoded, month_encoded]
