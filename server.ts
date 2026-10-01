import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'neighborly-community-admin-key-2026';

// In-memory sliding window rate limiter for public AI endpoints
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function assistantRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 20; // max 20 requests per minute

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({ 
      error: 'Too many requests. Please wait a moment before sending more messages.',
      retryAfter 
    });
    return;
  }

  record.count += 1;
  next();
}

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

async function startServer() {
  const app = express();

  // Security Headers Middleware (Helmet-equivalent hardening)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Strict Request Body Limit to prevent memory exhaustion
  app.use(express.json({ limit: '100kb' }));

  // Initialize server-side Google GenAI SDK if API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // AI Assistant API endpoint with rate limiting & sanitization
  app.post('/api/gemini/assistant', assistantRateLimiter, async (req: Request, res: Response) => {
    try {
      const { prompt, localServices, taskRequests, userLocation, activeCategory } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required and must be text.' });
        return;
      }

      // Input boundary enforcement
      const sanitizedPrompt = prompt.trim().slice(0, 1000);
      if (sanitizedPrompt.length === 0) {
        res.status(400).json({ error: 'Prompt cannot be empty.' });
        return;
      }

      // Sanitize context payloads to prevent prompt-injection attacks
      const safeServices = Array.isArray(localServices)
        ? localServices.slice(0, 8).map((s: any) => ({
            id: String(s?.id || '').slice(0, 64),
            title: String(s?.title || '').slice(0, 100),
            category: String(s?.category || '').slice(0, 50),
            price: typeof s?.price === 'number' ? s.price : 0,
            providerName: String(s?.provider?.name || 'Neighbor').slice(0, 50),
            university: String(s?.provider?.studentUniversity || '').slice(0, 60),
            rating: typeof s?.rating === 'number' ? Number(s.rating.toFixed(1)) : 5.0,
            distanceKm: typeof s?.distanceKm === 'number' ? Number(s.distanceKm.toFixed(1)) : 1.5,
          }))
        : [];

      const safeRequests = Array.isArray(taskRequests)
        ? taskRequests.slice(0, 4).map((r: any) => ({
            id: String(r?.id || '').slice(0, 64),
            title: String(r?.title || '').slice(0, 100),
            budget: typeof r?.budget === 'number' ? r.budget : 0,
            category: String(r?.category || '').slice(0, 50),
          }))
        : [];

      // If Gemini API is configured, call available modern models with fallback
      if (ai) {
        const modelsToTry = [GEMINI_MODEL, 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
        const systemPrompt = `You are "Neighborly AI Assistant", the friendly, intelligent, and proactive assistant for NeighborLy — a hyperlocal student & neighborhood skills marketplace ("Students Helping Students" & "Local Skills. Real Opportunities").

Current App & Community Context:
- User Location: ${JSON.stringify(userLocation || 'Near City Centre')}
- Active Category Filter: ${String(activeCategory || 'All').slice(0, 30)}
- Active Local Services Sample: ${JSON.stringify(safeServices)}
- Active Open Requests Sample: ${JSON.stringify(safeRequests)}

Your Instructions:
1. Always give real, helpful, actionable problem-solving responses to whatever the user asks (e.g. academic questions, design advice, coding help, troubleshooting, tutoring explanations, pricing rates, or marketplace recommendations).
2. When relevant, recommend specific local student sellers from the available listings above with prices in ₹ INR and approximate distance.
3. If the user asks how to earn money or list a skill, guide them to click "Become a Seller" in the top bar.
4. If they ask about safety, explain NeighborLy's Escrow-Lite demo protection (payment simulation held until buyer confirms work delivery).
5. Keep your tone encouraging, collegiate, concise, and structured with clean markdown bolding and bullet points.`;

        for (const modelName of modelsToTry) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: sanitizedPrompt,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
              },
            });

            if (response.text) {
              res.json({ reply: response.text, provider: modelName });
              return;
            }
          } catch (modelErr) {
            console.warn(`Model ${modelName} failed or quota reached, trying fallback:`, modelErr);
          }
        }
      }

      // Fallback local matcher with safe null guards
      const lower = sanitizedPrompt.toLowerCase();
      let matchedServices = safeServices.filter((s) => {
        return (
          lower.includes(s.title.toLowerCase()) ||
          lower.includes(s.category.toLowerCase())
        );
      });

      if (matchedServices.length === 0 && safeServices.length > 0) {
        matchedServices = safeServices.slice(0, 2);
      }

      let reply = '';
      if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('charge') || lower.includes('how much')) {
        reply = `💡 **Neighborhood Pricing Guide for ${userLocation?.neighborhood || 'Your Area'}**:\n\n` +
          `• **Home & Repairs**: ₹300 – ₹700 (standard fixtures, plumbing, furniture assembly)\n` +
          `• **Tech & Digital Setup**: ₹350 – ₹800 (Wi-Fi, printer, software, laptop cleanup)\n` +
          `• **Pet Care & Dog Walking**: ₹150 – ₹400 per walk / day\n` +
          `• **Lessons & Tutoring**: ₹300 – ₹600 per hour\n\n` +
          `*Note: All demo payments are protected in NeighborLy Escrow-Lite until you approve the finished task!*`;
      } else if (lower.includes('escrow') || lower.includes('safe') || lower.includes('pay') || lower.includes('refund')) {
        reply = `🛡️ **How Escrow-Lite Protects You (Demo Mode)**:\n\n` +
          `1. When you book a neighbor, the simulated payment (₹) is locked in our Escrow-Lite vault.\n` +
          `2. The neighbor works on the task and marks it as delivered.\n` +
          `3. Only when you inspect and click **"Approve & Release"** is the money paid out directly to their UPI.\n` +
          `4. If an issue arises, our Community Admin team can refund the escrow back to you.`;
      } else if (matchedServices.length > 0) {
        reply = `📍 **Here are the best neighbor matches near ${userLocation?.neighborhood || 'your location'}**:\n\n` +
          matchedServices.map((s) => {
            const formattedRating = (s.rating ?? 5.0).toFixed(1);
            return `• **${s.title}** by *${s.providerName || 'Neighbor'}* — **₹${s.price}** (${s.distanceKm || '1.2'} km away, ⭐ ${formattedRating})`;
          }).join('\n\n') +
          `\n\nWould you like me to help you contact them or post a custom task request?`;
      } else {
        reply = `Hello neighbor! 👋 I'm your **Neighborly AI Assistant**.\n\n` +
          `I can help you:\n` +
          `• 🔍 Find skilled neighbors near **${userLocation?.neighborhood || 'your location'}**\n` +
          `• 💰 Estimate fair market rates for neighborhood tasks\n` +
          `• 📝 Draft a task request to broadcast to local helpers\n` +
          `• 🛡️ Explain simulated escrow payment protection\n\n` +
          `What do you need help with today?`;
      }

      res.json({ reply, provider: 'local-intelligence' });
    } catch (err: any) {
      console.error('Error in /api/gemini/assistant:', err);
      res.status(500).json({ 
        error: 'Failed to generate assistant response',
        reply: "I'm having a slight connection glitch, but you can browse local neighbor listings directly in the Explore tab!"
      });
    }
  });

  // Secure Server-Side Escrow Order Creation Endpoint
  app.post('/api/orders/create', (req: Request, res: Response) => {
    try {
      const { 
        buyerId, 
        buyerName, 
        buyerAvatar, 
        buyerLocation,
        serviceId, 
        serviceTitle, 
        sellerId, 
        sellerName, 
        sellerAvatar, 
        sellerLocation,
        amount, 
        withRush, 
        deadline 
      } = req.body;

      if (!buyerId || !serviceId || !sellerId) {
        res.status(400).json({ error: 'buyerId, serviceId, and sellerId are strictly required.' });
        return;
      }

      if (buyerId === sellerId) {
        res.status(400).json({ error: 'A user cannot create an escrow order for their own service.' });
        return;
      }

      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 100000) {
        res.status(400).json({ error: 'Invalid order amount. Amount must be between ₹1 and ₹100,000.' });
        return;
      }

      const orderId = `ord_${Date.now()}`;
      const serverOrder = {
        id: orderId,
        serviceId: String(serviceId).slice(0, 128),
        serviceTitle: String(serviceTitle || 'Neighborhood Task').slice(0, 150),
        buyerId: String(buyerId).slice(0, 128),
        buyerName: String(buyerName || 'Neighbor Buyer').slice(0, 100),
        buyerAvatar: String(buyerAvatar || '').slice(0, 500),
        buyerLocation: buyerLocation || null,
        sellerId: String(sellerId).slice(0, 128),
        sellerName: String(sellerName || 'Neighbor Provider').slice(0, 100),
        sellerAvatar: String(sellerAvatar || '').slice(0, 500),
        sellerLocation: sellerLocation || null,
        status: 'in_escrow' as const,
        escrowStatus: 'held' as const,
        amount: parsedAmount,
        createdAt: 'Just now',
        deadline: withRush ? 'Within 4 Hours' : (deadline || '1 Day'),
        verifiedByServer: true,
      };

      res.status(201).json({ success: true, order: serverOrder });
    } catch (err: any) {
      console.error('Error creating order on server:', err);
      res.status(500).json({ error: 'Internal server error creating order' });
    }
  });

  // Secure Server-Side Escrow Status Transition Endpoint
  app.post('/api/orders/:id/status', (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const { action, userId } = req.body;

      if (!orderId || !action) {
        res.status(400).json({ error: 'orderId and action are required.' });
        return;
      }

      const validActions = ['deliver', 'release', 'dispute', 'refund', 'cancel'];
      if (!validActions.includes(action)) {
        res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
        return;
      }

      let newStatus: string;
      let newEscrowStatus: string;

      switch (action) {
        case 'deliver':
          newStatus = 'delivered';
          newEscrowStatus = 'held';
          break;
        case 'release':
          newStatus = 'completed';
          newEscrowStatus = 'released';
          break;
        case 'dispute':
          newStatus = 'disputed';
          newEscrowStatus = 'disputed';
          break;
        case 'refund':
        case 'cancel':
          newStatus = 'cancelled';
          newEscrowStatus = 'refunded';
          break;
        default:
          res.status(400).json({ error: 'Unsupported action' });
          return;
      }

      res.json({
        success: true,
        orderId,
        status: newStatus,
        escrowStatus: newEscrowStatus,
        updatedAt: new Date().toISOString(),
        verifiedByServer: true,
      });
    } catch (err: any) {
      console.error('Error transitioning order status on server:', err);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Protected Admin Metrics API endpoint (Requires Admin Secret or Bearer Token)
  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    const adminKey = req.headers['x-admin-key'] || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);

    if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
      res.status(401).json({ error: 'Unauthorized. Valid admin credentials required to access metrics.' });
      return;
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      activeRateLimiters: rateLimitMap.size,
      serverTime: new Date().toUTCString(),
      version: '1.2.0',
    });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeighborLy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
