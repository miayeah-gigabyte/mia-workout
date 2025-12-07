// server/controllers/sessionController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Initialize Prisma Client

// 1. POST /api/sessions
const createSession = async (req, res) => {
  try {
    const { date, durationMinutes, type, rewardValue } = req.body;

    // Basic data validation (you may need more comprehensive validation)
    if (!date || !durationMinutes) {
      return res.status(400).json({ error: 'Missing required session data.' });
    }

    const newSession = await prisma.session.create({
      data: {
        date: new Date(date),
        durationMinutes: parseInt(durationMinutes, 10),
        type, // Ensure your schema supports this field
        rewardValue: parseFloat(rewardValue) || 0, // Default to 0 if null
        // Add any required userId field if your schema links to a user
      },
    });

    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: 'Failed to create session.', details: error.message });
  }
};

// 2. GET /api/sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: {
        date: 'desc',
      },
    });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: 'Failed to retrieve sessions.' });
  }
};

// 3. GET /api/sessions/dashboard
const getDashboardMetrics = async (req, res) => {
  try {
    // Example: Calculate total sessions and total rewards
    const totalSessions = await prisma.session.count();
    const totalRewards = await prisma.session.aggregate({
      _sum: {
        rewardValue: true,
      },
    });

    res.status(200).json({
      totalSessions: totalSessions,
      totalRewards: totalRewards._sum.rewardValue || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ error: 'Failed to retrieve dashboard metrics.' });
  }
};

// 4. DELETE /api/sessions/:id
const deleteSession = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the session exists before deleting (optional, but good practice)
    const deletedSession = await prisma.session.delete({
      where: {
        id: parseInt(id, 10), // Assuming your session ID is an integer
      },
    });
    res.status(200).json({ message: 'Session deleted successfully', session: deletedSession });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Session not found.' });
    }
    console.error("Error deleting session:", error);
    res.status(500).json({ error: 'Failed to delete session.' });
  }
};


// --- CRITICAL EXPORT STATEMENT ---
// This ensures that all functions are available for import in index.js
module.exports = {
  createSession,
  getSessions,
  getDashboardMetrics,
  deleteSession,
};
