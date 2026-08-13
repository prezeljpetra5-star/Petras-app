const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const digestRoute = require('./src/routes/digest');
const recipeRoute = require('./src/routes/recipe');
const simplifyRoute = require('./src/routes/simplify');
const chatRoute = require('./src/routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api', digestRoute);
app.use('/api', recipeRoute);
app.use('/api', simplifyRoute);
app.use('/api', chatRoute);

app.use((err, req, res, next) => {
  console.error('[server] unhandled error', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`Petra's App proxy server listening on http://localhost:${PORT}`);
});
