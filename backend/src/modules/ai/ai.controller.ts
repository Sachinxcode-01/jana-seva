import { Router, Request, Response } from 'express';
import { aiService } from './ai.service.js';
import { aiProviderFactory } from './provider.factory.js';
import { nluService } from './nlu.service.js';

const router = Router();

// 1. GET /api/ai/providers - List status of all configured AI providers
router.get('/providers', async (_req: Request, res: Response) => {
  try {
    const providers = await aiProviderFactory.getProvidersStatus();
    return res.json({
      success: true,
      providers
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. POST /api/ai/nlu - Natural language understanding analysis
router.post('/nlu', (req: Request, res: Response) => {
  try {
    const { query, language, history = [] } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'query is required.' });
    }

    const analysis = nluService.analyze(query, language, history);
    return res.json({
      success: true,
      analysis
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. POST /api/ai/generate - Generate intelligence response
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { message, language, history = [], responseLength, providerPreference } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message is required.' });
    }

    const result = await aiService.processMessage(message, {
      language,
      history,
      responseLength,
      providerPreference
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST /api/ai/stream - Real-time SSE token streaming
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { message, language, history = [], responseLength, providerPreference } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message is required.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const result = await aiService.streamMessage(
      message,
      {
        language,
        history,
        responseLength,
        providerPreference
      },
      (token: string) => {
        res.write(`data: ${JSON.stringify({ event: 'token', token })}\n\n`);
      }
    );

    res.write(`data: ${JSON.stringify({ event: 'done', result })}\n\n`);
    return res.end();
  } catch (err: any) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.write(`data: ${JSON.stringify({ event: 'error', message: err.message })}\n\n`);
    return res.end();
  }
});

export default router;
