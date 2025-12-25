import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";
import predictRoutes from "./routes/predictRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/predict", predictRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("AquaPredict backend is running!");
});

app.listen(PORT, () =>
  console.log(`AquaBot backend running on port ${PORT}`)
);

app.get("/health", (req, res) => {
  res.json({
    backend: "running",
    ml_service: "expected on port 8000"
  });
});
