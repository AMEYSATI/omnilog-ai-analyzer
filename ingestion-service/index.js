import express from "express";
import { Queue } from "bullmq";
import 'dotenv/config';
import cors from 'cors';
const port = 3000;

const app = express();
app.use(cors());
const connection={url: process.env.REDIS_URL};
const errLogs = new Queue('error-logs',{connection});

app.use(express.json());

function SeverityScanner(message){
  const severityKeywords = message.toLowerCase();
  if(severityKeywords.includes('fatal') || severityKeywords.includes('panic') || severityKeywords.includes('critical') || severityKeywords.includes('security') ){
    return 1; // High Priority
  }
  else
    return 2; // Low Priority
}

app.post('/collect-log', async (req, res) => {
  const { message, stackTrace, projectId} = req.body;
  const jobPrioity=SeverityScanner(message);
  try{
    await errLogs.add('process-log', { message, stackTrace, projectId }, {  priority: jobPrioity });
    res.sendStatus(202);
  } catch(err){
    console.log(err);
    res.status(500).json({ error: 'Failed to add log to the queue'});
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

export default app;
