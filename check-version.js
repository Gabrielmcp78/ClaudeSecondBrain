// Add a version endpoint to check which code is running
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/version', (req, res) => {
  res.json({
    version: 'FIXED-VERSION-1.0',
    timestamp: new Date().toISOString(),
    fixes: ['session-management', 'timeouts', 'error-handling']
  });
});

app.listen(3457, () => {
  console.log('Version check server on port 3457');
});
