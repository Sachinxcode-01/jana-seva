import { Router, Request, Response } from 'express';
import { voiceService } from './voice.service.js';
import { optionalAuthenticate } from '../../auth/authMiddleware.js';

const router = Router();

// GET /api/v1/voice/status - Health and capability status
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const health = await voiceService.getHealth();
    return res.json({
      success: true,
      ...health
    });
  } catch (err: any) {
    return res.json({
      success: false,
      online: false,
      error: err.message
    });
  }
});

// GET /api/v1/voice/profiles - List Indian female voice profiles
router.get('/profiles', (_req: Request, res: Response) => {
  const profiles = voiceService.getVoiceProfiles();
  return res.json({
    success: true,
    profiles
  });
});

// POST /api/v1/voice/tts - Text-to-speech synthesis
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, language = 'en', voice = 'kavya-indic' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Text is required for TTS synthesis.' });
    }

    const result = await voiceService.synthesizeText(text.trim(), language, voice);
    if (!result) {
      return res.status(503).json({
        success: false,
        message: 'VoiceStudio local speech synthesis is currently unavailable.'
      });
    }

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Length', result.audioBuffer.length);
    res.setHeader('X-Voice-Profile', voice);
    return res.send(result.audioBuffer);
  } catch (err: any) {
    console.error('[VoiceController TTS] Error:', err);
    return res.status(500).json({ success: false, message: 'Speech synthesis error.' });
  }
});

// POST /api/v1/voice/stt - Speech-to-text transcription
router.post('/stt', async (req: Request, res: Response) => {
  try {
    const { audioBase64, language = 'en', mimeType = 'audio/webm' } = req.body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ success: false, message: 'audioBase64 is required for transcription.' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const result = await voiceService.transcribeAudio(audioBuffer, language, mimeType);

    return res.json({
      success: true,
      text: result.text,
      languageDetected: result.languageDetected
    });
  } catch (err: any) {
    console.error('[VoiceController STT] Error:', err);
    return res.status(500).json({ success: false, message: 'Speech transcription error.' });
  }
});

export default router;
