import express from 'express';
import cors from 'cors';
import { userConnectDB, User } from './userDb.js';
import { connectDB, AnalysisResult } from './db.js';
import jwt from 'jsonwebtoken';
import authenticateToken from './middleware.js';
import 'dotenv/config';
import { createServer } from 'http'; // Built-in Node module
import { Server } from 'socket.io';

const app = express();
const port = 3001;

app.use(cors({
  origin: "https://omnilog-ai-analyzer.vercel.app/",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

userConnectDB();
connectDB();

const httpServer = createServer(app);

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.create({ email, password });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, apiKey: user.apiKey });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Signup failed' });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'User not found' });
        
        const isMatch = await user.checkPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' }); 

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        // ADD apiKey here so React can store it in localStorage
        res.json({ 
            token, 
            apiKey: user.apiKey 
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
});



// 2. Initialize Socket.io on that server
const io = new Server(httpServer, {
  cors: {
    origin: "https://omnilog-ai-analyzer.vercel.app/", // In production, you'd put your frontend URL here
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // This is the new part!
  socket.on('join_dashboard', (uuid) => {
    const roomName = `user_${uuid}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  });
});

app.get('/logs', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;

    // 1. Find the user in the DB using the ID from the JWT token
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. ONLY fetch logs belonging to this user's apiKey
    const whereClause = { userId: user.apiKey }; 

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const logs = await AnalysisResult.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/internal/notify', async(req, res) => {
    const analyzedLog = req.body;
    let apiKeyFromWorker = analyzedLog.userId; // Assuming userId is being sent as part of the log data
    // 4. SHOUT the data to all connected browsers
    try {
      const user = await User.findOne({ 
              where: { apiKey: apiKeyFromWorker } 
          });
      if (!user) {
          return res.status(404).json({ message: 'Invalid API Key' });
      }
      //io.emit('new_log_ready', analyzedLog);
      io.to(`user_${apiKeyFromWorker}`).emit('new_log_ready', analyzedLog);
      
      res.status(200).send('Notification broadcasted');

    } catch (error) { 
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

});

// IMPORTANT: Use httpServer.listen, NOT app.listen
httpServer.listen(port, () => {
  console.log('🚀 Dashboard & WebSocket Server running on port 3001');
});
