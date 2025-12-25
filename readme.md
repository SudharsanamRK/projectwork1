# AquaPredict

**AquaPredict** is an AI-powered decision support platform for fisheries and aquaculture. It helps fishermen, traders, and planners make **safer, smarter, and more sustainable decisions** by combining environmental analytics, machine learning predictions, market intelligence, and an AI chatbot assistant.

The system translates complex ocean, weather, and market data into **clear, actionable insights** through an interactive dashboard.

## Project Overview

Fishing operations are highly dependent on environmental conditions and volatile market prices. AquaPredict addresses these challenges by:

1. Analyzing **sea and weather parameters** (temperature, rainfall, wind, waves, air quality)

2. Predicting **fish species suitability and availability**

3. Forecasting **market price trends**

4. Assisting users with **AI-driven guidance through a chatbot**

5. Supporting **sustainable harvesting** and conservation-aware planning

The platform is designed so that users **do not need technical or scientific expertise** to benefit from advanced analytics.

## System Architecture

AquaPredict follows a **modular, multi-service architecture**:

1. **React + Vite Frontend**
    - Interactive dashboard
    - Static sidebar navigation
    - Data visualization and maps

2. **Node.js + Express Backend**
    - AI chatbot (Gemini / Groq fallback)
    - Weather, air quality, and market services
    - REST APIs for frontend integration

3. **Python Flask ML Service**
    - Fish species prediction
    - Trained machine learning models
    - Model evaluation and retraining utilities
    
4. **External APIs**
    - Weather & environmental data
    - Conversational AI (Gemini / Groq)
    
5. **Machine Learning Models**
   - Trained using historical fisheries datasets
   - Serialized using Joblib / Pickle

## Features
    
1. **Predictive Species Selection:** The system identifies the most suitable fish species for farming or harvesting by analyzing specific environmental parameters.
2. **Interactive Regional Mapping:** Users can access visual, interactive maps that highlight optimal fishing zones and real-time environmental conditions.
3. **Comprehensive Market Analytics:** The platform tracks historical data and generates forecasts for fish prices to help users understand market trends.
4. **AI-Powered Technical Support:** A dedicated chatbot, AquaBot, utilizes Gemini and Groq to provide expert fishing advice and safety guidance.
5. **Sustainable Harvest Management:** The planner helps users balance their financial revenue goals with essential ecological conservation limits.
6. **Proactive Risk Alerting:** The system automatically detects and notifies users of unusual environmental changes or volatile market conditions.
7. **Versatile Data Portability:** All generated insights and data can be exported in CSV or JSON formats for external analysis or record-keeping.

## Technologies Used

#### Frontend
    
- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Leaflet & React-Leaflet
- Lucide Icons

#### Backend (Node.js)
    
- Node.js
- Express.js
- Axios
- Gemini API
- Groq API
- OpenWeather / Environmental APIs

#### Machine Learning (Python)

- Flask
- scikit-learn
- Pandas
- NumPy
- Joblib

## Project Structure
```text
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
│   │   ├── services
│   │   └── styles
│   ├── App.jsx
│   └── package.json
│
└── fish_predictor
    ├── datasets
    ├── models
    ├── utils
    ├── app.py
    ├── train_model.py
    └── requirements.txt
```

## Installation and Setup

#### Backend Setup

```bash
cd aquapredict-backend
npm install
```

Create a .env file (not committed to GitHub):
```env
PORT=5000
WEATHER_API_KEY=your_key
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
```

Start the server:
```bash
node server.js
```

#### Frontend Setup

```bash
cd aquapredict-frontend
npm install
npm run dev
```

## Machine Learning API Setup

```bash
cd fish_predictor
pip install -r requirements.txt
```

Train the model:
```bash
python train_model.py
```

Start the ML API:
```bash
python app.py
```

## API Endpoints

##### Fish Prediction
```bash
POST /predict
```
Returns predicted fish species and suitability score.

#### Chatbot

```bash
POST /api/chat
```
Returns AI-generated responses for user queries.

#### Weather & Environment

```bash
GET /api/weather
```
Returns real-time environmental data.

## Output Modules

1. Dashboard overview with key metrics
2. Fish prediction results with insights
3. Market trend and price analysis
4. AquaBot chat interface
5. Harvest planner recommendations

## Future Enhancements

1. Integration of real time satellite ocean data
2. Mobile application support
3. Multilingual chatbot for regional fishermen
4. Deep learning based time series forecasting
5. GPS based route optimization

## Conclusion

AquaPredict demonstrates how **AI, machine learning, and data analytics** can modernize traditional fishing and aquaculture practices. By combining environmental intelligence, market forecasting, and sustainability-aware planning, the system helps reduce risk, improve efficiency, and support long-term marine resource management.

## License

This project is developed for academic and research purposes.