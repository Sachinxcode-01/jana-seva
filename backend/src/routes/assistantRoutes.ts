import { Router, Request, Response } from 'express';
import { processAssistantQuery } from '../services/assistantService.js';
import { checkVoiceStudioHealth, synthesizeSpeechVoiceStudio, transcribeSpeechVoiceStudio } from '../services/voiceStudioService.js';

const router = Router();

// POST /api/assistant/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, language, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const response = await processAssistantQuery(message.trim(), language, history);
    return res.json({
      success: true,
      ...response
    });
  } catch (err) {
    console.error('Assistant error:', err);
    return res.status(500).json({ success: false, message: 'Server error generating assistant response.' });
  }
});

// GET /api/assistant/voice/status - Check if VoiceStudio is active locally
router.get('/voice/status', async (_req: Request, res: Response) => {
  try {
    const status = await checkVoiceStudioHealth();
    return res.json({
      success: true,
      ...status
    });
  } catch (err: any) {
    return res.json({
      success: false,
      online: false,
      error: err.message
    });
  }
});

// POST /api/assistant/voice/tts - Synthesize high-quality speech with VoiceStudio
router.post('/voice/tts', async (req: Request, res: Response) => {
  try {
    const { text, language, voice = 'nova' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Text is required for TTS.' });
    }

    const result = await synthesizeSpeechVoiceStudio(text.trim(), language, voice);
    if (!result) {
      return res.status(503).json({
        success: false,
        message: 'VoiceStudio local speech service is unavailable. Please ensure VoiceStudio is running.'
      });
    }

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Length', result.audioBuffer.length);
    return res.send(result.audioBuffer);
  } catch (err: any) {
    console.error('[VoiceStudio TTS Route] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to synthesize speech.' });
  }
});

// POST /api/assistant/voice/stt - Transcribe speech audio with VoiceStudio Whisper
router.post('/voice/stt', async (req: Request, res: Response) => {
  try {
    const { audioBase64, language } = req.body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ success: false, message: 'audioBase64 is required for transcription.' });
    }

    const buffer = Buffer.from(audioBase64, 'base64');
    const result = await transcribeSpeechVoiceStudio(buffer, language);

    if (!result) {
      return res.status(503).json({
        success: false,
        message: 'VoiceStudio transcription service is unavailable.'
      });
    }

    return res.json({
      success: true,
      text: result.text
    });
  } catch (err: any) {
    console.error('[VoiceStudio STT Route] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to transcribe audio.' });
  }
});

export default router;
