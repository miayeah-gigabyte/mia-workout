// server/controllers/sessionController.js

const { PrismaClient } = require('@prisma/client');
const { isAfter, subDays, format, parseISO } = require('date-fns');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Constants
const MIA_USER_ID = "user-mia"; 
const START_DATE = parseISO('2025-12-04'); // Starting date for day count
const WORKOUT_MINUTES_REQUIRED = 30;

// --- 🎯 SIMPLIFIED REWARD LOGIC BASED ON REQUIREMENTS ---
const WORKOUT_REWARDS = [
  // { days: achieved_in_window, window: days_for_window, name: reward_string }
  { days: 5, window: 7, name: "35-min Massage from Karol" },
  { days: 10, window: 14, name: "Karol & Mia walk Buster together for at least 20 mins" },
  { days: 14, window: 21, name: "Karol & Mia goes to an Asian restaurant together at Mia’s choice" },
  { days: 21, window: 31, name: "Karol & Mia goes Skiing" },
];

/**
 * Checks all defined reward tiers for the user based on the rolling window.
 * @param {string} userId 
 * @returns {Array} List of newly unlocked rewards.
 */
async function evaluateRewards(userId) {
  const unlocks = [];
  const today = new Date();

  for (const reward of WORKOUT_REWARDS) {
    const windowStart = subDays(today, reward.window);
    
    // 1. Check if this reward has already been unlocked within the current window.
    const isAlreadyUnlocked = await prisma.rewardUnlock.findFirst({
        where: { 
            userId,
            rewardName: reward.name,
            unlockedAt: { gte: windowStart } // Check if unlocked within the current window
        }
    });

    if (isAlreadyUnlocked) continue; 

    // 2. Count sessions that meet the criteria (within window, min 30 minutes).
    // NOTE: This counts the number of SESSIONS, which is a proxy for days logged.
    const sessionCount = await prisma.session.count({
      where: {
        userId,
        date: { gte: windowStart },
        minutes: { gte: WORKOUT_MINUTES_REQUIRED }
      }
    });

    // 3. Check if criteria is met and log/email if so.
    if (sessionCount >= reward.days) {
      // a. Log the Unlock in the database
      const newUnlock = await prisma.rewardUnlock.create({
        data: { userId, rewardName: reward.name },
      });
      unlocks.push(newUnlock);
      
      // b. Trigger Email Notification to Karol
      await sendRewardEmail(reward.name, userId);
    }
  }
  return unlocks;
}


/**
 * Sends a notification email to Karol.
 */
async function sendRewardEmail(rewardName, userId) {
  // NOTE: You must have EMAIL_USER and EMAIL_PASS set in your Render environment variables.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.partnerEmail) {
      console.warn("Email not sent: Karol's partnerEmail is missing or User not found.");
      return;
  }

  const transporter = nodemailer.createTransport({
    // IMPORTANT: Use your actual email service configuration
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.partnerEmail, 
    subject: `🏆 MIA UNLOCKED A REWARD!`,
    text: `Mia successfully achieved a major milestone! The reward unlocked is: ${rewardName}. Please arrange this reward for Mia!`,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email notification sent to ${user.partnerEmail}`);
}


// --- API FUNCTIONS ---

// POST /api/sessions (Logs the workout)
exports.logSession = async (req, res) => {
  const { date, minutes, notes } = req.body; 
  const minutesToLog = minutes || WORKOUT_MINUTES_REQUIRED; 

  try {
    // 1. Save the Session
    const session = await prisma.session.create({
      data: {
        userId: MIA_USER_ID,
        minutes: minutesToLog,
        notes,
        date: date ? parseISO(date) : new Date(),
      },
    });

    // 2. Trigger Reward Evaluation
    const newUnlocks = await evaluateRewards(MIA_USER_ID); 
    
    res.json({ session, newUnlocks });
  } catch (error) {
    console.error("Error logging session:", error);
    res.status(500).json({ error: "Failed to log session" });
  }
};

// GET /api/sessions (Used for dashboard display)
exports.getSessions = async (req, res) => {
    try {
        const sessions = await prisma.session.findMany({
            where: { userId: MIA_USER_ID },
            orderBy: { date: 'desc' }
        });
        const unlocks = await prisma.rewardUnlock.findMany({
            where: { userId: MIA_USER_ID },
            orderBy: { unlockedAt: 'desc' }
        });
        
        // Calculate Metrics for Dashboard
        const today = new Date();

        const currentDay = isAfter(today, START_DATE) 
            ? Math.floor((today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1 
            : 1;

        const sessionsIn7Days = await prisma.session.count({
             where: {
                userId: MIA_USER_ID,
                date: {
                    gte: subDays(today, 7),
                },
             }
        });

        res.json({
            sessions,
            unlocks,
            currentDay,
            weeklyCount: sessionsIn7Days,
            // Pass the reward structure to the frontend for display purposes
            rewardTiers: WORKOUT_REWARDS 
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve sessions" });
    }
}

// GET /api/setup (Ensures the user exists)
exports.setupUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: MIA_USER_ID } });
        if (!user) {
             await prisma.user.create({
                 data: {
                     id: MIA_USER_ID,
                     email: 'mia@example.com',
                     partnerEmail: 'karol@example.com', // Replace with Karol's actual email
                     name: 'Mia'
                 }
             });
        }
        res.status(200).send("Setup complete.");
    } catch (error) {
        res.status(500).json({ error: "Setup failed" });
    }
}
