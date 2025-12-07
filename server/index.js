// server/index.js

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const sessionController = require('./controllers/sessionController');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(cors()); 
app.use(express.json());

// --- ROUTES ---

// 1. User Setup (Should be called once to create Mia's User record)
app.get('/api/setup', sessionController.setupUser); 

// 2. Log Session (POST)
app.post('/api/sessions', sessionController.logSession);

// 3. Get Sessions/Dashboard Data (GET)
app.get('/api/sessions', sessionController.getSessions);


// --- START SERVER ---
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

startServer();
