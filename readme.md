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

### Frontend Setup

```bash
cd aquapredict-frontend
npm install
npm run dev
```

### Machine Learning API Setup

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

### API Endpoints

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

## System Architecture
<img width="1024" height="1024" alt="Gemini_Generated_Image_c3hi2wc3hi2wc3hi" src="https://github.com/user-attachments/assets/3e7ad98c-0d5e-45c3-afcb-6c842404a7de" />

## Output Modules

### 1. Dashboard overview with key metrics
![Dashboard](https://github.com/user-attachments/assets/cd0612d8-86fd-40b5-8400-4141ec660181)

### 2. Fish prediction results with insights
**Basic Mode for Fish Prediction**
![Fish-Prediction-Basic](https://github.com/user-attachments/assets/f7bbeb38-3e4a-4558-80a1-f0c835154c0f)

**Advanced Mode for Fish Prediction**
![Fish-Prediction-Advanced](https://github.com/user-attachments/assets/e86627f5-e711-43c9-95a3-965ec1e9db11)

### 3. Market trend and price analysis
![Market](https://github.com/user-attachments/assets/babc1f3b-96b7-44b4-8245-8374ec1ab381)

### 4. Environment interface
![Environment](https://github.com/user-attachments/assets/e67af6bd-10fd-4c42-9e2a-872e130d1f02)

### 5. AquaBot chat interface
![Chatbot](https://github.com/user-attachments/assets/96155fd6-0128-4408-8d61-1829da2ad27d)

### 6. Harvest planner recommendations
![Harvest-Planner](https://github.com/user-attachments/assets/209b9336-19c0-4344-9c75-103921cecb61)

## Results and Impact

The AquaPredict system successfully integrates machine learning, real-time environmental analytics, market trend analysis, and conversational AI into a unified decision-support platform for fisheries. The developed models provide reliable fish species predictions based on environmental parameters, while real-time weather and sea condition monitoring enhances safety and situational awareness. Market price visualization and forecasting support informed economic decisions, and the AI-powered AquaBot delivers timely guidance and assistance to users. Additionally, the sustainable harvest planner promotes responsible fishing by balancing revenue optimization with conservation considerations. Overall, AquaPredict improves operational efficiency, economic outcomes, and safety for fishermen while encouraging sustainable marine resource management, demonstrating the practical impact of AI-driven technologies in modernizing traditional fishing practices.

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

## Articles published / References

[1]
Hossain, M. S., Ghosh, S., Rahman, M. A., & Hasan, M. M. (2022).
Machine learning-based fish species classification and prediction using environmental and habitat data.
Ecological Informatics, 68, 101528.
https://doi.org/10.1016/j.ecoinf.2022.101528

[2]
Rahman, M. M., Islam, M. R., & Hasan, M. M. (2023).
AI-based decision support systems for climate-resilient fisheries management.
Environmental Modelling & Software, 158, 105532.
https://doi.org/10.1016/j.envsoft.2022.105532

[3]
Kumar, A., Singh, R., & Patel, N. R. (2023).
Agricultural and fisheries commodity price forecasting using hybrid machine learning models.
Applied Soft Computing, 132, 109876.
https://doi.org/10.1016/j.asoc.2022.109876

[4]
Villasante, S., Pita, C., Antelo, M., & Rodrigues, J. G. (2020).
Social-ecological systems and decision support tools for sustainable fisheries management.
Marine Policy, 117, 103953.
https://doi.org/10.1016/j.marpol.2020.103953

[5]
Adamopoulou, E., & Moussiades, L. (2020).
Chatbots: History, technology, and applications.
Machine Learning with Applications, 2, 100006.
https://doi.org/10.1016/j.mlwa.2020.100006
