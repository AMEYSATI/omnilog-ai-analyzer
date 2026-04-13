import express from 'express';
import cors from 'cors';
import { connectDB, AnalysisResult } from './db.js';
import { createServer } from 'http'; // Built-in Node module
import { Server } from 'socket.io';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

connectDB();

const httpServer = createServer(app);

// 2. Initialize Socket.io on that server
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, you'd put your frontend URL here
    methods: ["GET", "POST"]
  }
});

app.get('/logs', async (req, res) => {
  try {
    // We use .findAll() to get all records
    const logs = await AnalysisResult.findAll({
      order: [['createdAt', 'DESC']] // The "Senior" touch: newest first
    });
    
    res.json(logs); // Send the data back as a list
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/internal/notify', (req, res) => {
    const analyzedLog = req.body;
    
    // 4. SHOUT the data to all connected browsers
    io.emit('new_log_ready', analyzedLog);
    
    res.status(200).send('Notification broadcasted');
});

// IMPORTANT: Use httpServer.listen, NOT app.listen
httpServer.listen(port, () => {
  console.log('🚀 Dashboard & WebSocket Server running on port 3001');
});
