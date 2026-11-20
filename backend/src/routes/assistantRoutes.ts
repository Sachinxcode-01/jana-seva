import { Router } from 'express';
import assistantController from '../modules/assistant/assistant.controller.js';
import voiceController from '../modules/voice/voice.controller.js';

const router = Router();

        // 1. Mount modular Voice API endpoints under /voice
        router.use('/voice', voiceController);

        // 2. Mount modular Assistant & Conversation endpoints at root
        router.use('/', assistantController);

export default router;
