# JANASEVA – Conversational AI Voice Assistant Setup & Operations Guide
**Document:** `docs/VOICE_ASSISTANT_SETUP.md`  
**Version:** 2.0.0 (Production)  
**Target Environment:** Local Workstation & Production Server Deployment  

---

## 1. Quick Start (Instant 2-Minute Setup)

Run the following commands from the root directory:

```bash
# 1. Install all dependencies (Backend + Frontend)
npm run install:all

# 2. Start VoiceStudio Speech Service (Port 3900)
npm run voice:start

# 3. In a second terminal, start Backend API (Port 5000)
npm run backend:dev

# 4. In a third terminal, start Frontend Vite Dev Server (Port 5173)
npm run frontend:dev
```

Open `http://localhost:5173` in your browser. Click the floating green **Janaseva Assistant** button in the bottom right corner to begin voice interaction.

---

## 2. Environment Variables Configuration

The backend reads configuration from `backend/.env`. A recommended configuration template is provided below:

```env
# Server Network Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Security & JWT Authentication
JWT_SECRET=janaseva_super_secret_jwt_key_2026_cbp_lab

# VoiceStudio Speech Service Adapter
VOICESTUDIO_URL=http://localhost:3900

# AI Provider Configuration (Optional for Neural LLM; Fallback Rule Engine active by default)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=nvidia/nemotron-3.5-lightning:free
```

> [!NOTE]
> If `OPENROUTER_API_KEY` is not provided, the assistant automatically falls back to the **Janaseva Advisory Rule Engine (Offline Grounded)**. All government scheme queries, required documents, eligibility rules, and official portal links remain 100% operational offline.

---

## 3. VoiceStudio Speech Service Modes

VoiceStudio can operate in two modes depending on your hardware specifications:

### Mode A: Lightweight Dev/Test Speech Server (Default)
Ideal for fast development, continuous integration, and machines without NVIDIA GPUs:
```bash
npm run voice:mock
# or
node scripts/start-voice-studio.mjs --mock
```
* **Port**: `3900`
* **Features**: Responds immediately to `/.well-known/voicestudio-speech`, `GET /v1/models`, `GET /v1/audio/voices`, `POST /v1/audio/speech`, and `POST /v1/audio/transcriptions`.
* **Audio**: Returns real audible synthesized WAV audio (440Hz/660Hz Indic harmonic chord) with dynamic duration matching the input text length.

### Mode B: Full OmniVoice Neural Engine (PyTorch / GPU)
For production deployments requiring local neural weights:
```bash
# Set up Python virtual environment and dependencies using uv
npm run voice:setup

# Start full OmniVoice Python backend
node scripts/start-voice-studio.mjs --full
```

---

## 4. API Endpoints Reference

### 4.1 Voice API (`/api/v1/voice/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/voice/status` | Checks VoiceStudio connection health and discovered engines | No |
| `GET` | `/api/v1/voice/profiles` | Lists verified Indian female voice profiles (`kavya-indic`, `priya-in`, etc.) | No |
| `POST` | `/api/v1/voice/tts` | Synthesizes text into high-quality speech audio buffer | No |
| `POST` | `/api/v1/voice/stt` | Transcribes base64 WebM audio into text using Whisper STT | No |

### 4.2 Assistant & Conversation API (`/api/v1/assistant/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/assistant/chat` | Legacy backward-compatible chat endpoint | No |
| `GET` | `/api/v1/assistant/conversations` | Lists conversations for the current citizen session | Optional JWT |
| `POST` | `/api/v1/assistant/conversations` | Creates a new conversation session | Optional JWT |
| `GET` | `/api/v1/assistant/conversations/:id` | Retrieves conversation history (enforcing ownership) | Optional JWT |
| `DELETE` | `/api/v1/assistant/conversations/:id` | Deletes a conversation session (DPDP Act § 12) | Optional JWT |
| `POST` | `/api/v1/assistant/conversations/:id/messages` | Sends a citizen message and returns grounded scheme response | Optional JWT |
| `POST` | `/api/v1/assistant/conversations/:id/messages/stream`| Server-Sent Events (SSE) streaming tokens, metadata, and sentences | Optional JWT |

### 4.3 Real-Time WebSocket Gateway (`/ws/assistant`)
* **URL**: `ws://localhost:5000/ws/assistant`
* **Protocol**:
  * Send: `{"type": "init", "conversationId": "...", "language": "kn", "voice": "kavya-indic"}`
  * Send: `{"type": "query", "text": "ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಗೆ ಯಾರು ಅರ್ಹರು?"}`
  * Receive: `{"type": "state", "state": "thinking"}`
  * Receive: `{"type": "state", "state": "retrieving"}`
  * Receive: `{"type": "state", "state": "speaking"}`
  * Receive: `{"type": "sentence", "index": 0, "text": "...", "audioBase64": "..."}`
  * Send: `{"type": "interrupt"}` (instantly halts audio delivery and resets state to idle)
  * Receive: `{"type": "done", "reply": "..."}`

---

## 5. Automated Verification & Testing

To execute the complete 25-point automated verification test suite:

```bash
node scripts/test-voice-assistant.mjs
```

This automated runner verifies:
1. VoiceStudio engine discovery.
2. Indian female voice profile configuration.
3. Kannada TTS audio buffer synthesis.
4. Whisper STT transcription.
5. Conversation lifecycle persistence in `janaseva_db.json`.
6. RAG knowledge grounding for Gruha Lakshmi, PM-KISAN, Shakti, and SSP Scholarship.
7. Multilingual code-switching handling.
8. Multi-turn elliptic follow-up context resolution.
9. Real-time WebSocket streaming and barge-in interruption.
10. Backward-compatible legacy `/api/assistant/chat` support.

---

## 6. Remote Production Deployment Hardening

For production environments (e.g. AWS, GCP, Azure, or DigitalOcean):

1. **HTTPS / TLS Mandatory**: Browser microphone APIs (`navigator.mediaDevices.getUserMedia`) strictly require a secure origin (`https://` or `localhost`). Remote deployments must terminate TLS at Nginx, Cloudflare, or an Application Load Balancer.
2. **Reverse Proxy Configuration**:
   ```nginx
   # Route WebSocket streaming traffic
   location /ws/assistant {
       proxy_pass http://127.0.0.1:5000/ws/assistant;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "Upgrade";
       proxy_set_header Host $host;
   }

   # Route Backend API traffic
   location /api/ {
       proxy_pass http://127.0.0.1:5000/api/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```
3. **Internal VoiceStudio Isolation**: VoiceStudio (`localhost:3900`) must **never** be exposed directly to the public internet. It should only be accessible locally by the JANASEVA Node.js backend.
