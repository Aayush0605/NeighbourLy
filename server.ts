import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

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

  // AI Assistant API endpoint
  app.post('/api/gemini/assistant', async (req, res) => {
    try {
      const { prompt, localServices, taskRequests, userLocation, activeCategory } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      // If Gemini API is configured, call gemini-3.8-flash
      if (ai) {
        const systemPrompt = `You are "Neighborly AI Assistant", the friendly and hyper-local intelligence for NeighborLy — a peer-to-peer neighborhood skills & task marketplace (like Fiverr & Freelancer combined with hyperlocal GPS proximity and Escrow-Lite security).

Current User Context:
- User Location: ${JSON.stringify(userLocation || 'Nearby neighborhood')}
- Current Filter/Category: ${activeCategory || 'All'}
- Available Local Services Sample: ${JSON.stringify(
          (localServices || []).slice(0, 10).map((s: any) => ({
            id: s.id,
            title: s.title,
            category: s.category,
            price: s.price,
            provider: s.provider?.name,
            neighborhood: s.location?.neighborhood,
            distanceKm: s.distanceKm,
            rating: s.rating,
          }))
        )}
- Active Open Task Requests: ${JSON.stringify(
          (taskRequests || []).slice(0, 5).map((r: any) => ({
            id: r.id,
            title: r.title,
            budget: r.budget,
            category: r.category,
            deadline: r.deadline,
          }))
        )}

Your capabilities:
1. Recommend specific local neighbor listings that match what the user is looking for (quote prices in ₹ INR, provider name, and approximate distance).
2. Give pricing estimates and advice for hiring neighbors for home repairs, tech setup, pet sitting, tutoring, errands, etc.
3. Help users draft task requests or write catchy descriptions for offering their skills.
4. Explain Neighborly's Escrow-Lite payment protection (money held safely until buyer confirms completion, 0% platform fee, direct UPI payout).
5. Always be warm, neighborhood-focused, concise, and helpful. Use formatting with bullet points and bold highlights. Keep responses concise (under 200 words).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const reply = response.text || 'I am here to help you connect with skilled neighbors in your area!';
        res.json({ reply, provider: 'gemini-3.8-flash' });
        return;
      }

      // Fallback intelligent local matcher if GEMINI_API_KEY is not set
      const lower = prompt.toLowerCase();
      let matchedServices = (localServices || []).filter((s: any) => {
        return (
          lower.includes(s.title.toLowerCase()) ||
          lower.includes(s.category.toLowerCase()) ||
          (s.skills && s.skills.some((sk: string) => lower.includes(sk.toLowerCase())))
        );
      });

      if (matchedServices.length === 0 && (localServices || []).length > 0) {
        matchedServices = (localServices || []).slice(0, 2);
      }

      let reply = '';
      if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('charge') || lower.includes('how much')) {
        reply = `💡 **Neighborhood Pricing Guide for ${userLocation?.neighborhood || 'Your Area'}**:\n\n` +
          `• **Home & Repairs**: ₹300 – ₹700 (standard fixtures, plumbing, furniture assembly)\n` +
          `• **Tech & Digital Setup**: ₹350 – ₹800 (Wi-Fi, printer, software, laptop cleanup)\n` +
          `• **Pet Care & Dog Walking**: ₹150 – ₹400 per walk / day\n` +
          `• **Lessons & Tutoring**: ₹300 – ₹600 per hour\n\n` +
          `*Note: All payments are held in Neighborly Escrow-Lite until you approve the finished task!*`;
      } else if (lower.includes('escrow') || lower.includes('safe') || lower.includes('pay') || lower.includes('refund')) {
        reply = `🛡️ **How Escrow-Lite Protects You**:\n\n` +
          `1. When you book a neighbor, your payment (₹) is locked in our secure Escrow-Lite vault.\n` +
          `2. The neighbor works on the task and marks it as delivered.\n` +
          `3. Only when you inspect and click **"Approve & Release"** is the money paid out directly to their UPI.\n` +
          `4. If an issue arises, our Community Admin team can refund the escrow back to you.`;
      } else if (matchedServices.length > 0) {
        reply = `📍 **Here are the best neighbor matches near ${userLocation?.neighborhood || 'your location'}**:\n\n` +
          matchedServices.map((s: any) => 
            `• **${s.title}** by *${s.provider?.name || 'Neighbor'}* — **₹${s.price}** (${s.distanceKm || '1.2'} km away, ⭐ ${s.rating.toFixed(1)})\n  _${s.description.slice(0, 80)}..._`
          ).join('\n\n') +
          `\n\nWould you like me to help you contact them or post a custom task request?`;
      } else {
        reply = `Hello neighbor! 👋 I'm your **Neighborly AI Assistant**.\n\n` +
          `I can help you:\n` +
          `• 🔍 Find skilled neighbors near **${userLocation?.neighborhood || 'your location'}**\n` +
          `• 💰 Estimate fair market rates for neighborhood tasks\n` +
          `• 📝 Draft a task request to broadcast to local helpers\n` +
          `• 🛡️ Explain escrow payment protection\n\n` +
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

  // Admin summary API endpoint
  app.get('/api/admin/metrics', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
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
