import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const getWeather = async (city) => {
  const key = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;
  const res = await axios.get(url);
  const data = res.data;

  return {
    temperature: data.main.temp,
    salinity: 34.0, // simulated (marine sensors later)
    waveHeight: Math.random() * 1.5 + 0.5,
    wind: `${data.wind.speed} km/h`
  };
};
