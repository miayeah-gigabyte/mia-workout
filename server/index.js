// server/index.js

const express = require('express');
const cors = require('cors');
const sessionController = require('./controllers/sessionController');

const app = express();

// --- CRITICAL CORS CONFIGURATION ---

// FIX: Removed process.env usage and removed the trailing slash.
const VERCEL_FRONTEND_URL = 'https://mia-workout-pkvr.vercel.app'; 

app.use(cors({
  origin: VERCEL_FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(express.json()); // Middleware to parse JSON body requests

// --- API Routes ---

// 1. Root/Status Check Route
app.get('/', (req, res) => {
  res.status(200).send('MiaJourney Workout API is operational.');
});

// 2. Session Routes
app.post('/api/sessions', sessionController.createSession);
app.get('/api/sessions', sessionController.getSessions);
app.get('/api/sessions/dashboard', sessionController.getDashboardMetrics);
app.delete('/api/sessions/:id', sessionController.deleteSession);

// --- Server Start ---

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
