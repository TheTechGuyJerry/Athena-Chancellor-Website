const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const rateLimiterCode = `
  // Simple in-memory rate limiter
  const ipRequests = new Map();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 5; // 5 requests per minute

  const rateLimitMiddleware = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, { count: 1, firstRequest: now });
      return next();
    }
    
    const record = ipRequests.get(ip);
    if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
      ipRequests.set(ip, { count: 1, firstRequest: now });
      return next();
    }
    
    if (record.count >= MAX_REQUESTS) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment before trying again." });
    }
    
    record.count += 1;
    next();
  };
`;

serverCode = serverCode.replace('  // Newsletter Subscribe Routes', rateLimiterCode + '\n  // Newsletter Subscribe Routes');

serverCode = serverCode.replace('app.post("/api/subscribe/start", async (req, res) => {', 'app.post("/api/subscribe/start", rateLimitMiddleware, async (req, res) => {');
serverCode = serverCode.replace('app.post("/api/subscribe/resend", async (req, res) => {', 'app.post("/api/subscribe/resend", rateLimitMiddleware, async (req, res) => {');
serverCode = serverCode.replace('app.post("/api/subscribe/complete", async (req, res) => {', 'app.post("/api/subscribe/complete", rateLimitMiddleware, async (req, res) => {');

fs.writeFileSync('server.ts', serverCode);
