import { Router, Request, Response } from 'express';
import { voiceService } from './voice.service.js';
import { voiceStudioClient } from './voicestudio.client.js';

const router = Router();

  // 1. GET /api/voice/status (or /health) - Health check and capability status
  const handleHealth = async (_req: Request, res: Response) => {
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
  };

  router.get('/status', handleHealth);
  router.get('/health', handleHealth);

  // 2. GET /api/voice/models - List dynamically discovered VoiceStudio models
  router.get('/models', async (_req: Request, res: Response) => {
    try {
      const models = await voiceStudioClient.listModels();
      return res.json({
        success: true,
        models
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

    // 3. GET /api/voice/profiles (or /voices) - List Indian female and dynamic voice profiles
    const handleProfiles = async (_req: Request, res: Response) => {
      try {
        const profiles = await voiceService.getVoiceProfiles();
        return res.json({
          success: true,
          profiles,
          defaultVoice: 'kavya-indic'
        });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    };

    router.get('/profiles', handleProfiles);
    router.get('/voices', handleProfiles);

    // 4. GET /api/voice/languages - Supported Indian and regional languages
    router.get('/languages', (_req: Request, res: Response) => {
      const languages = voiceService.getSupportedLanguages();
      return res.json({
        success: true,
    languages
      });
    });

    // 5. POST /api/voice/tts - Text-to-speech synthesis (full buffer)
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
        res.setHeader('X-Voice-Profile', result.voiceUsed);
        return res.send(result.audioBuffer);
      } catch (err: any) {
        console.error('[VoiceController TTS] Error:', err);
        return res.status(500).json({ success: false, message: 'Speech synthesis error.' });
      }
    });

    // 6. POST /api/voice/tts/stream - Text-to-speech chunked streaming
    router.post('/tts/stream', async (req: Request, res: Response) => {
      try {
        const { text, language = 'en', voice = 'kavya-indic' } = req.body;

        if (!text || typeof text !== 'string') {
          return res.status(400).json({ success: false, message: 'Text is required for streaming TTS.' });
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('X-Voice-Profile', voice);

        const success = await voiceService.synthesizeTextStream(text.trim(), language, voice, (chunk: Buffer) => {
          res.write(chunk);
        });

        if (!success) {
          // Fallback: try full synthesis if streaming fails
          const fallback = await voiceService.synthesizeText(text.trim(), language, voice);
          if (fallback) {
            res.write(fallback.audioBuffer);
          }
        }

        return res.end();
      } catch (err: any) {
        console.error('[VoiceController TTS Stream] Error:', err);
        if (!res.headersSent) {
          return res.status(500).json({ success: false, message: 'Speech streaming error.' });
        }
        return res.end();
      }
    });

    // 7. POST /api/voice/stt - Speech-to-text transcription
    router.post('/stt', async (req: Request, res: Response) => {
      try {
        const { audioBase64, language = 'en', mimeType = 'audio/webm' } = req.body;

        if (!audioBase64 || typeof audioBase64 !== 'string') {
          return res.status(400).json({ success: false, message: 'audioBase64 is required for transcription.' });
        }

        const audioBuffer = Buffer.from(audioBase64, 'base64');
        if (audioBuffer.length === 0) {
          return res.status(400).json({ success: false, message: 'Audio buffer is empty.' });
        }

        const result = await voiceService.transcribeAudio(audioBuffer, language, mimeType);

        return res.json({
          success: true,
          text: result.text,
      languageDetected: result.languageDetected,
          confidence: result.confidence
        });
      } catch (err: any) {
        console.error('[VoiceController STT] Error:', err);
        return res.status(500).json({ success: false, message: 'Speech transcription error.' });
      }
    });

    export default router;
