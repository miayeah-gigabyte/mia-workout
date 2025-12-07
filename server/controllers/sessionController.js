// server/controllers/sessionController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Initialize Prisma Client

// 1. POST /api/sessions
const createSession = async (req, res) => {
  try {
    // FIX 1: Changed 'durationMinutes' to 'minutes' (Schema field)
    // FIX 2: Changed 'rewardValue' to 'pointsValue' (Schema field)
    // FIX 3: Added 'userId' as a required field
    const { date, minutes, pointsValue, userId, type } = req.body;

    // Basic data validation
    if (!userId || !minutes || !date) {
      return res.status(400).json({ error: 'Missing required session data (userId, minutes, or date).' });
    }

    // FIX 4: Ensured model name is capitalized (prisma.Session)
    const newSession = await prisma.Session.create({
      data: {
        userId, // Required field from schema
        date: new Date(date),
        minutes: parseInt(minutes, 10), // Use 'minutes'
        pointsValue: parseFloat(pointsValue) || 0, // Use 'pointsValue'
        // 'type' is not in your schema but keeping it for now if needed elsewhere
      },
    });

    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error creating session:", error);
    // Log the detailed error to your Render console
    res.status(500).json({ error: 'Failed to create session.', details: error.message });
  }
};

// 2. GET /api/sessions
const getSessions = async (req, res) => {
  try {
    // FIX 4: Ensured model name is capitalized (prisma.Session)
    const sessions = await prisma.Session.findMany({
      orderBy: {
        date: 'desc',
      },
      // You may need to filter by a specific userId here later
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
    // FIX 4: Ensured model name is capitalized (prisma.Session)
    const totalSessions = await prisma.Session.count();
    const totalRewards = await prisma.Session.aggregate({
      _sum: {
        pointsValue: true, // FIX: Use 'pointsValue' from schema
      },
    });

    res.status(200).json({
      totalSessions: totalSessions,
      totalRewards: totalRewards._sum.pointsValue || 0, // Use 'pointsValue'
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
    // FIX: IDs are Strings (UUIDs) in the schema, not Integers. Removed parseInt.
    const deletedSession = await prisma.Session.delete({
      where: {
        id: id,
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
module.exports = {
  createSession,
  getSessions,
  getDashboardMetrics,
  deleteSession,
};
