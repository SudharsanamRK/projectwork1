# AquaPredict

AquaPredict is an AI powered fishing and market prediction system designed to support fishermen, traders, and aquaculture planners. The system combines machine learning, environmental analytics, and market intelligence to predict fish species availability, forecast prices, and assist in sustainable harvesting decisions.

## Project Overview

Fishing activities are often affected by unpredictable ocean conditions and fluctuating market prices. AquaPredict addresses these challenges by analyzing environmental parameters such as temperature, salinity, oxygen levels, rainfall, and seasonal patterns to generate actionable insights. The platform provides real time dashboards, predictive analytics, market trend visualization, and an AI based chatbot assistant.

## System Architecture

The project follows a multi layer architecture:

    1. React based frontend for visualization and user interaction

    2. Python Flask server for machine learning predictions
    
    3. Node.js Express backend for chatbot and weather services
    
    4. External APIs for weather data and conversational AI
    
    5. Machine learning models trained using historical datasets

## Features
    
    1. Fish species prediction based on environmental parameters
    
    2. Regional fishing zone visualization using interactive maps
    
    3. Market price trend analysis and forecasting
    
    4. AI chatbot for fishing advice and safety guidance
    
    5. Sustainable harvest planner for revenue and conservation balance
    
    6. Alerts for environmental and market anomalies
    
    7. Data export in CSV and JSON formats

## Technologies Used

#### Frontend
    
1. React.js
    
2. Vite
    
3. Tailwind CSS
    
4. Recharts
  
5. Leaflet and React Leaflet

#### Backend
    
1. Node.js
    
2. Express.js
    
3. Axios
    
4. OpenWeather API
    
5. Groq or OpenAI API
    
6. Machine Learning


#### Python
    
1. Flask
    
2. scikit learn
    
3. Pandas
    
4. NumPy
    
5. Joblib

## Project Structure
```pgsql
    AQUAPREDICT
    │
    ├── aquapredict-backend
    │   ├── controllers
    │   ├── routes
    │   ├── services
    │   ├── utils
    │   ├── server.js
    │   └── package.json
    │
    ├── aquapredict-frontend
    │   ├── src
    │   │   ├── components
    │   │   ├── pages
    │   │   ├── hooks
    │   │   └── context
    │   ├── App.jsx
    │   └── package.json
    │
    └── fish_predictor
        ├── datasets
        ├── models
        ├── train_model.py
        ├── preprocess.py
        ├── app.py
        └── requirements.txt
```

## Installation and Setup

#### Backend Setup

1. Navigate to aquapredict-backend

2. Install dependencies using npm install

3. Create a .env file with API keys

4. Start the server using node server.js

#### Frontend Setup

1. Navigate to aquapredict-frontend

2. Install dependencies using npm install

3. Run the development server using npm run dev

## Machine Learning API Setup

1. Navigate to fish_predictor

2. Install Python dependencies using pip install -r requirements.txt

3. Train the model using python train_model.py

4. Start the Flask server using python app.py

## API Endpoints

##### Fish Prediction API
*POST /predict*
Returns predicted fish species and abundance

*POST /api/chat*
Returns chatbot responses based on user queries

*GET /api/weather*
Returns current weather and sea conditions

## Output Modules

1. Dashboard overview with environmental metrics

2. Fish prediction results with regional heatmap

3. Market trend analysis and price forecasting

4. AquaBot chat interface

5. Sustainable harvest planning recommendations

## Future Enhancements

1. Integration of real time satellite ocean data

2. Mobile application support

3. Multilingual chatbot for regional fishermen

4. Deep learning based time series forecasting

5. GPS based route optimization

## Conclusion

AquaPredict demonstrates how artificial intelligence and data analytics can modernize traditional fishing practices. By combining environmental prediction, market intelligence, and sustainability planning, the system helps improve decision making, reduce risks, and support long term marine resource management.

## License

This project is developed for academic and research purposes.