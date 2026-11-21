import { Router, Response } from 'express';
import { assistantService } from './assistant.service.js';
import { conversationService } from './conversation.service.js';
import { optionalAuthenticate, AuthenticatedRequest } from '../../auth/authMiddleware.js';

const router = Router();

// 1. List conversations (Authenticated or Guest session)
router.get('/conversations', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversations = conversationService.listUserConversations(userId);
    return res.json({
      success: true,
      conversations
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Create a new conversation
router.post('/conversations', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, language = 'kn' } = req.body;
    const conversation = conversationService.createConversation(userId, title, language);
    return res.status(201).json({
      success: true,
      conversation
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Get single conversation history (Enforcing ownership)
router.get('/conversations/:id', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversation = conversationService.getConversation(String(req.params.id), userId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied.' });
    }
    return res.json({
      success: true,
      conversation
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Delete conversation (Enforcing ownership)
router.delete('/conversations/:id', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const deleted = conversationService.deleteConversation(String(req.params.id), userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied.' });
    }
    return res.json({
      success: true,
      message: 'Conversation deleted successfully.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Send message within conversation session
router.post('/conversations/:id/messages', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversation = conversationService.getConversation(String(req.params.id), userId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied.' });
    }

    const { message, language } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    // Record citizen message in conversation store
    conversationService.addMessage(conversation.id, {
      role: 'user',
      content: message.trim(),
      language: language || conversation.language
    });

    // Process with history context
    const historyTurns = conversation.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const result = await assistantService.processQuery(
      message.trim(),
      language || conversation.language,
      historyTurns
    );

    // Record assistant reply in conversation store
    const savedAssistantMsg = conversationService.addMessage(conversation.id, {
      role: 'assistant',
      content: result.reply,
      speechText: result.speechText,
      language: result.language,
      suggestedSchemes: result.suggestedSchemes,
      modelUsed: result.modelUsed
    });

    return res.json({
      success: true,
      message: savedAssistantMsg,
      reply: result.reply,
      speechText: result.speechText,
      language: result.language,
      suggestedSchemes: result.suggestedSchemes,
      modelUsed: result.modelUsed,
      sentences: result.sentences
    });
  } catch (err: any) {
    console.error('[AssistantController] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process message.' });
  }
});

// 6. Real-Time Streaming Message Endpoint (Server-Sent Events - SSE)
router.post('/conversations/:id/messages/stream', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversation = conversationService.getConversation(String(req.params.id), userId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const { message, language } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // 1. Send state event: transcribing/thinking
    res.write(`data: ${JSON.stringify({ event: 'state', state: 'thinking' })}\n\n`);

    // Record user message
    conversationService.addMessage(conversation.id, {
      role: 'user',
      content: message.trim(),
      language: language || conversation.language
    });

    const historyTurns = conversation.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Send state event: retrieving
    res.write(`data: ${JSON.stringify({ event: 'state', state: 'retrieving' })}\n\n`);

    const { responseLength } = req.body;

    const result = await assistantService.streamQuery(
      message.trim(),
      language || conversation.language,
      historyTurns,
      (token: string) => {
        res.write(`data: ${JSON.stringify({ event: 'token', token })}\n\n`);
      },
      responseLength
    );

    // Send metadata and schemes event
    res.write(`data: ${JSON.stringify({
      event: 'metadata',
      language: result.language,
      suggestedSchemes: result.suggestedSchemes,
      modelUsed: result.modelUsed
    })}\n\n`);

    // Send sentences for immediate audio synthesis & playback
    res.write(`data: ${JSON.stringify({ event: 'state', state: 'speaking' })}\n\n`);
    for (let i = 0; i < result.sentences.length; i++) {
      res.write(`data: ${JSON.stringify({
        event: 'sentence',
        index: i,
        total: result.sentences.length,
        text: result.sentences[i]
      })}\n\n`);
    }

    // Send full reply and finish
    conversationService.addMessage(conversation.id, {
      role: 'assistant',
      content: result.reply,
      speechText: result.speechText,
      language: result.language,
      suggestedSchemes: result.suggestedSchemes,
      modelUsed: result.modelUsed
    });

    res.write(`data: ${JSON.stringify({
      event: 'done',
      reply: result.reply,
      speechText: result.speechText,
      sentences: result.sentences
    })}\n\n`);

    return res.end();
  } catch (err: any) {
    console.error('[Assistant Stream] Error:', err);
    res.write(`data: ${JSON.stringify({ event: 'error', message: err.message })}\n\n`);
    return res.end();
  }
});

// 7. Backward-Compatible /chat endpoint (PRESERVES EXISTING WORKING FUNCTIONALITY)
router.post('/chat', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, language, history = [], responseLength } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const result = await assistantService.processQuery(message.trim(), language, history, responseLength);

    return res.json({
      success: true,
      reply: result.reply,
      speechText: result.speechText,
      suggestedSchemes: result.suggestedSchemes,
      language: result.language,
      modelUsed: result.modelUsed,
      sentences: result.sentences
    });
  } catch (err: any) {
    console.error('[Assistant /chat] Error:', err);
    return res.status(500).json({ success: false, message: 'Error processing assistant query.' });
  }
});

export default router;

