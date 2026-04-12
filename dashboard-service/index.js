import express from 'express';
import cors from 'cors';
import { connectDB, AnalysisResult } from './db.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

connectDB();

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

app.listen(port, () => {
  console.log(`📊 Dashboard API running at http://localhost:${port}`);
});