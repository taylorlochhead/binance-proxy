const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // CRITICAL: Railway needs this

// Enable CORS for Arnold to call this proxy
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'binance-proxy' });
});

// Proxy all requests to Binance
app.use('/*', async (req, res) => {
  try {
    const binanceUrl = `https://api.binance.com${req.originalUrl}`;
    
    console.log(`Proxying: ${binanceUrl}`);
    
    const response = await axios({
      method: req.method,
      url: binanceUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      params: req.query,
      timeout: 10000
    });
    
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.message,
        binanceError: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'Proxy error: ' + error.message
      });
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Binance proxy running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});