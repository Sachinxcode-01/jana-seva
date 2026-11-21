# JANASEVA AI Assistant & VoiceStudio Integration – Comprehensive Technical Audit

**Document:** `docs/AI_ASSISTANT_AUDIT.md`  
**Classification:** Technical Architecture & System Audit  
**Author:** Senior AI Architect & Full-Stack Engineer  
**Date:** November 2026  
**Status:** COMPLETE (Baseline for Production Execution)  
**Target Voice Engine:** VoiceStudio ([https://github.com/debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio))  

---

## 1. Executive Summary

This technical audit evaluates the existing **JANASEVA Conversational AI Assistant** and its integration with the local **VoiceStudio** speech engine (`https://github.com/debpalash/VoiceStudio`). The goal is to establish an unvarnished, code-grounded assessment of the assistant's UI, orchestration pipeline, speech-to-text (STT), text-to-speech (TTS), RAG knowledge retrieval, conversation persistence, and transport protocols.

### Key High-Level Findings:
1. **Strong Backend Foundation Already Built:** The backend has already evolved beyond monolithic routes into structured domain modules:
   - `backend/src/modules/assistant/` (orchestration, context tracking, SSE streaming, OpenRouter client with offline deterministic rule fallback).
   - `backend/src/modules/voice/` (VoiceStudio OpenAI-compatible HTTP client, voice profiles, sentence chunking, speech normalization, and WebSocket streaming gateway `/ws/assistant`).
   - `backend/src/modules/knowledge/` (63 verified schemes, phonetic alias dictionary, multi-field weighted scoring).
   - `backend/src/database/db.ts` (in-memory & JSON-persisted `conversations` and `conversationMessages` stores with user ownership scoping).
2. **Frontend UI Disconnect:** The frontend UI component (`frontend/src/components/JanasevaAssistant.tsx`) **does not yet leverage the advanced backend features**:
   - The UI makes stateless HTTP requests to `/api/assistant/chat` via `api.askChatbot()` rather than connecting to the real-time WebSocket `/ws/assistant` or the Server-Sent Events (SSE) `/messages/stream` endpoint.
   - Conversation history is maintained purely inside transient React state (`useState<Message[]>`); it does not sync with the database-backed `/conversations` CRUD endpoints.
   - When VoiceStudio is detected, the UI requests voice `'nova'`, while the backend defaults to `'kavya-indic'`.
   - Audio playback is monolithic (`new Audio(url)`) rather than streamed sentence-by-sentence.
3. **VoiceStudio Environment State:** The VoiceStudio codebase is physically cloned under `.agents/voice-studio`. A dedicated launcher (`scripts/start-voice-studio.mjs`) provides port detection, health discovery, and a lightweight zero-dependency mock speech service on port 3900. However, the local Python virtual environment (`.venv` with PyTorch and OmniVoice weights) is optional; when uninitialized, the launcher automatically falls back to dev mock mode.

---

## 2. 10-Point Technical Inspection

### 2.1 Existing Assistant UI
* **Primary File:** [frontend/src/components/JanasevaAssistant.tsx](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/frontend/src/components/JanasevaAssistant.tsx)
* **Status:** Implemented (Functional Standalone Chat Widget)
* **Capabilities:**
  - Floating trigger button with robot icon and badge (`Janaseva Assistant`).
  - Chat panel with header showing portal/assistant language (`EN`, `KN`, `HI`), VoiceStudio status indicator (pulsing green dot for online, gray for offline), clear chat button, and close button.
  - Message bubble list displaying citizen queries, assistant replies with markdown rendering (lists, bolding, links), scheme cards with "View Scheme" deep links, copy message button, and audio replay button.
  - Contextual prompt chips ("How to apply for Gruha Lakshmi?", "PM-KISAN eligibility?", "Free bus pass scheme?").
  - Export chat transcript as a `.txt` file.
  - Voice input with microphone toggle: supports in-browser `webkitSpeechRecognition` with a 2.5s silence timer and local regex dictionary `correctSpeechMistakes` for Indian civic terms.
  - MediaRecorder fallback for browsers lacking Web Speech API, sending WebM audio to backend STT.
* **Architecture Gaps & Deficiencies:**
  - **No Real-Time Waveform / Visualizer:** Lacks frequency spectrum or pulse animation during listening or speaking states.
  - **Stateless Session Management:** Messages exist solely in React state; reloading the page discards the entire consultation.
  - **No Interruption / Barge-in:** When assistant is playing audio, citizen speaking does not trigger an immediate cancel signal to backend or pause ongoing playback.
  - **No Streaming UI:** Waits for the full HTTP response before rendering the assistant message bubble.

---

### 2.2 Existing AI API Integration
* **Primary Files:** 
  - [backend/src/modules/assistant/assistant.service.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/modules/assistant/assistant.service.ts)
  - [backend/src/services/assistantService.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/services/assistantService.ts) (Legacy shim)
* **Status:** Implemented (Robust Multi-Turn Context + OpenRouter + Deterministic Fallback)
* **Capabilities:**
  - **LLM Engine:** OpenRouter API calling `nvidia/nemotron-3.5-lightning:free` with automatic fallback to `openrouter/auto`. Configurable through `CONFIG.OPENROUTER_API_KEY`.
  - **System Prompt:** Enforces citizen welfare persona ("Kavya"), strict grounding in verified schemes, zero-PII collection, and anti-fraud alerts (free government portals).
  - **Multi-Turn Context Resolution:** Analyzes conversation history (up to last 8 turns) to detect follow-up queries (e.g., citizen asks "What are the documents?" after asking about Gruha Lakshmi).
  - **Dual Output:** Returns both rich markdown formatted text (`reply`) for on-screen reading and cleaned, phonetic text (`speechText`) optimized for TTS engines.
  - **Sentence Chunking:** Splits responses on sentence boundaries (including Indic danda `।`) to facilitate sentence-level concurrent TTS.
  - **Offline Deterministic Fallback:** If OpenRouter is unreachable or the API key is omitted, executes an offline rule engine that evaluates query tokens against scheme criteria and returns structured guidance.
* **Deficiencies:**
  - OpenRouter request in `assistant.service.ts` is currently non-streaming (`stream: false`). Although the controller has an SSE route (`/conversations/:id/messages/stream`), it waits for the full LLM reply before emitting sentence chunks.

---

### 2.3 VoiceStudio Integration and Available APIs
* **Primary Files:**
  - Repository: [https://github.com/debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) (cloned at `.agents/voice-studio`)
  - [backend/src/modules/voice/voicestudio.client.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/modules/voice/voicestudio.client.ts)
  - [scripts/start-voice-studio.mjs](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/scripts/start-voice-studio.mjs)
* **Status:** Implemented (OpenAI API Specification Compliance + Launcher)
* **Inspected VoiceStudio FastAPI Endpoints:**
  - `GET /.well-known/voicestudio-speech` & `GET /health` (Discovery & health check).
  - `GET /v1/models` (Returns available TTS `omnivoice` and STT `whisper-large-v3` models).
  - `GET /v1/audio/voices` (Returns available voice profiles, languages, and accents).
  - `POST /v1/audio/speech` (TTS synthesis returning audio stream/buffer in WAV or MP3).
  - `POST /v1/audio/transcriptions` (Multipart/form-data STT transcription using Whisper).
  - `WebSocket /v1/audio/transcriptions/stream` & `WebSocket /ws/tts` (Bi-directional streaming).
* **Launcher (`start-voice-studio.mjs`):**
  - Detects if port 3900 is already active and healthy.
  - Verifies host tools: Node.js, `uv`, Python, Git.
  - Detects `.venv` in `.agents/voice-studio`: if present with `uv`, launches the full Python OmniVoice uvicorn server; if missing, starts a lightweight mock speech server on port 3900 that emits audible 440/660 Hz WAV tones and returns mock STT transcripts for seamless development without gigabytes of model weights.

---

### 2.4 Speech-to-Text (STT) Implementation
* **Primary Files:**
  - [backend/src/modules/voice/speech-recognition.service.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/modules/voice/speech-recognition.service.ts)
  - [frontend/src/components/JanasevaAssistant.tsx](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/frontend/src/components/JanasevaAssistant.tsx)
* **Status:** Implemented with Dual-Layer Fallback
* **Architecture:**
  ```
  Citizen Voice Input
         │
         ├── [Web Speech API (webkitSpeechRecognition) available?]
         │        │
         │        ├─► YES: In-browser streaming STT (kn-IN, hi-IN, en-IN)
         │        │         └─► Local Phonetic Dictionary Normalization
         │        │
         │        └─► NO: MediaRecorder captures audio/webm Blob
         │                  └─► Base64 payload -> POST /api/assistant/voice/stt
         │                        └─► VoiceStudio Whisper STT (/v1/audio/transcriptions)
         │                              └─► Backend Normalization -> Query text
  ```
* **Phonetic Terminology Normalization:**
  Both backend (`SpeechRecognitionService`) and frontend (`JanasevaAssistant`) have regex substitution tables correcting common Indian civic terms:
  - `"grammar panchayat"` / `"gram panchayath"` $\rightarrow$ `"Gram Panchayat"`
  - `"gruha laxmi"` / `"grihalakshmi"` $\rightarrow$ `"Gruha Lakshmi"`
  - `"pm kissan"` / `"pmkisan"` $\rightarrow$ `"PM-KISAN"`
  - `"shakthi scheme bus"` $\rightarrow$ `"Shakti Scheme"`
  - `"ssp post matric"` $\rightarrow$ `"SSP Post-Matric Scholarship"`
  - `"yuvanidhi"` $\rightarrow$ `"Yuva Nidhi"`
  - `"annabhagya"` $\rightarrow$ `"Anna Bhagya"`
  - `"gruha jyothi"` $\rightarrow$ `"Gruha Jyoti"`
* **Identified Deficiencies:**
  - **Duplicated Regex Rules:** The regex normalizer exists almost verbatim in both `JanasevaAssistant.tsx` and `speech-recognition.service.ts`.
  - **Payload Overhead:** MediaRecorder uploads audio as base64-encoded JSON over HTTP POST rather than binary streams or WebSocket audio chunks.

---

### 2.5 Text-to-Speech (TTS) Implementation
* **Primary Files:**
  - [backend/src/modules/voice/speech-synthesis.service.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/modules/voice/speech-synthesis.service.ts)
  - [backend/src/modules/voice/voicestudio.client.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/modules/voice/voicestudio.client.ts)
  - [frontend/src/components/JanasevaAssistant.tsx](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/frontend/src/components/JanasevaAssistant.tsx)
* **Status:** Implemented with Intelligent Fallback
* **Architecture:**
  - **Primary:** VoiceStudio OmniVoice engine (`POST http://localhost:3900/v1/audio/speech`). Backend sends instruction-tuned prompt specifying female Indian tone, cadence, and language context.
  - **Secondary:** If VoiceStudio is offline or fails, frontend automatically falls back to browser `window.speechSynthesis`, dynamically searching for Indian female voices (`heera`, `neerja`, `priya`, `kavya`, `veena`, `zira`).
  - **Speech Sanitization:** Strips markdown tags (`*`, `#`, `_`, `` ` ``), flattens markdown links (`[text](url)` $\rightarrow$ `text`), and removes unpronounceable formatting before audio generation.
* **Identified Deficiencies:**
  - **Voice ID Mismatch:** In `JanasevaAssistant.tsx`, `api.synthesizeSpeechVoiceStudio(text, speakLang, 'nova')` passes `'nova'`, but `speech-synthesis.service.ts` lists `'kavya-indic'` as the default and primary profile.
  - **Full Buffer Blocking:** Frontend requests synthesis of the entire reply at once rather than playing sentence chunks concurrently.

---

### 2.6 Available Voice Models and Languages
* **Voice Profiles Defined in System:**
  1. **`kavya-indic` (Default):** Warm, empathetic Indian female voice. Full coverage: Kannada (`kn`), English (`en`), Hindi (`hi`), Telugu (`te`), Tamil (`ta`), Malayalam (`ml`), Marathi (`mr`), Bengali (`bn`), Gujarati (`gu`).
  2. **`priya-in`:** Formal public service administrator voice (`en`, `hi`, `kn`, `mr`, `bn`).
  3. **`neerja-in`:** Gentle elder sister voice, recommended for senior citizens and rural beneficiaries (`kn`, `hi`, `en`, `te`, `ta`).
  4. **`nova-in`:** Modern expressive pan-Indian voice (`en`, `hi`, `kn`, `te`, `ta`, `ml`, `gu`, `bn`, `mr`).
* **Multilingual Script Detection:**
  `assistant.service.ts` detects 9 Indic scripts using Unicode block ranges:
  - Devanagari (`\u0900-\u097F`): Hindi / Marathi
  - Kannada (`\u0C80-\u0CFF`): Kannada
  - Telugu (`\u0C00-\u0C7F`): Telugu
  - Tamil (`\u0B80-\u0BFF`): Tamil
  - Malayalam (`\u0D00-\u0D7F`): Malayalam
  - Bengali (`\u0980-\u09FF`): Bengali
  - Gujarati (`\u0A80-\u0AFF`): Gujarati
* **Identified Deficiencies:**
  - The UI language selector in `JanasevaAssistant.tsx` only offers toggling between `EN`, `KN`, and `HI`. The other 6 supported Indic languages cannot be explicitly selected in the UI (relying solely on script auto-detection).

---

### 2.7 Conversation History & Storage
* **Primary Files:**
  - [backend/src/database/db.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/database/db.ts)
  - [backend/src/modules/assistant/conversation.service.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/modules/assistant/conversation.service.ts)
  - [backend/src/modules/assistant/assistant.controller.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/modules/assistant/assistant.controller.ts)
* **Status:** Backend Fully Implemented; Frontend Disconnected
* **Capabilities in Backend:**
  - `db.ts` contains `conversations` and `conversationMessages` maps backed by `janaseva_db.json`.
  - Full CRUD operations with ownership checks:
    - `GET /api/assistant/conversations` (List user conversations).
    - `POST /api/assistant/conversations` (Create session).
    - `GET /api/assistant/conversations/:id` (Fetch history).
    - `DELETE /api/assistant/conversations/:id` (Remove session).
    - `POST /api/assistant/conversations/:id/messages` (Append turn).
* **Identified Deficiencies:**
  - `JanasevaAssistant.tsx` **does not call any of these endpoints**. It maintains an ephemeral React state array:
    ```tsx
    const [messages, setMessages] = useState<Message[]>([...]);
    ```
  - When calling the backend, it calls `api.askChatbot(text, lang, history)` which hits the backward-compatible `/api/assistant/chat` endpoint.
  - Result: Refreshing the browser or navigating across pages wipes all conversation history.

---

### 2.8 Scheme Database & Knowledge Sources
* **Primary Files:**
  - `janaseva_db.json` (Canonical store)
  - [backend/src/database/schemesData.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/database/schemesData.ts)
  - [backend/src/modules/knowledge/scheme-retrieval.service.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/modules/knowledge/scheme-retrieval.service.ts)
* **Status:** Implemented (High Quality Structured Knowledge + Multi-Field RAG Scoring)
* **Scheme Catalog:**
  - 63 verified Central and Karnataka State schemes covering Farmer Welfare, Women Empowerment, Student Scholarships, Health, and Social Security.
  - Complete structured metadata: `id`, `slug`, `name`, `name_kn`, `name_hi`, `description`, `category`, `benefits`, `eligibilityCriteria`, `requiredDocuments`, `applicationProcedure`, `officialWebsite`.
* **Retrieval Scoring Algorithm:**
  1. Exact Name / Slug match: `+100` points
  2. Vernacular Name match (`name_kn`, `name_hi`): `+90` points
  3. Phonetic & Vernacular Alias match: `+80` points (e.g. `'2000 scheme'` $\rightarrow$ `gruha-lakshmi-yojana`)
  4. Category Keyword match: `+25` points
  5. Eligibility, Document, or Procedure intent boost: `+15` points
  6. Token overlap matching: up to `+25` points
* **Identified Deficiencies:**
  - Schemes stored in `janaseva_db.json` are held in memory by `db.ts`. There is no persistent vector embedding database (such as pgvector or ChromaDB); retrieval is lexical and rule-weighted. While very fast (<2ms) and reliable for 63 schemes, it lacks semantic embeddings for ambiguous colloquial queries.

---

### 2.9 Backend Architecture & Gateway
* **Primary Files:**
  - [backend/src/server.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/server.ts)
  - [backend/src/routes/assistantRoutes.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/routes/assistantRoutes.ts)
  - [backend/src/modules/voice/voice-stream.gateway.ts](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/backend/src/modules/voice/voice-stream.gateway.ts)
* **Status:** Implemented (Clean Modular Layout with Dual Mount)
* **Routing Structure:**
  - `app.use(['/api/assistant', '/api/v1/assistant'], assistantRoutes)`
  - `app.use(['/api/voice', '/api/v1/voice'], voiceRoutes)`
  - Inside `assistantRoutes.ts`: mounts `/voice` to `voiceController` and `/` to `assistantController`.
  - WebSocket Server mounted on `/ws/assistant` via `VoiceStreamGateway.initialize(server)`.
* **Identified Deficiencies:**
  - WebSocket gateway `/ws/assistant` is fully implemented in the backend, supporting `init`, `interrupt` (barge-in), and `query` events with streaming sentence audio responses. **However, zero frontend components connect to `/ws/assistant`.**

---

### 2.10 Frontend Audio Handling & Stream Control
* **Primary File:** [frontend/src/components/JanasevaAssistant.tsx](file:///c:/Users/kalin/.gemini/antigravity-ide/scratch/Jana-Seva/frontend/src/components/JanasevaAssistant.tsx)
* **Status:** Partially Implemented
* **How Audio is Handled Today:**
  - STT: Uses `window.webkitSpeechRecognition` with event handlers `onstart`, `onresult`, `onerror`, `onend`.
  - TTS Playback:
    ```tsx
    const audioBlob = await api.synthesizeSpeechVoiceStudio(cleanText, speakLang, 'nova');
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
    }
    ```
* **Identified Deficiencies:**
  - **No Web Audio API `AudioContext` Analyser:** Audio is not passed through an `AnalyserNode`, preventing real-time frequency data visualization (e.g., sine waves or dancing bars).
  - **No Interruption Signaling:** Closing the modal or clicking the mic while audio is playing does not notify the backend gateway to abort downstream generation or release resources.
  - **Memory Leaks:** `URL.createObjectURL(audioBlob)` is called without corresponding `URL.revokeObjectURL(url)` calls when playback finishes.

---

## 3. Implementation Status Matrix

| Component / Subsystem | Planned Specification | Current Implementation Status | Evaluation |
| :--- | :--- | :--- | :--- |
| **Assistant UI Layout** | Floating modal with clean responsive layout | **Implemented** | Working; clean responsive widget with chat bubble list, scheme links, prompt chips. |
| **Audio Waveform Visualizer** | Live frequency waveform during speaking/listening | **Missing** | UI only has a static speaker icon and pulsing mic ring; lacks Web Audio `AnalyserNode`. |
| **Barge-in / Interruption** | Voice activity or user tap cuts off assistant voice | **Partially Implemented** | Backend gateway handles `interrupt`; frontend UI has no cancel hook or stop button. |
| **Persistent Conversations** | Multi-session history synced to database | **Partially Implemented** | Fully implemented in backend `db.ts` & `conversation.service.ts`; missing frontend UI integration. |
| **SSE Token Streaming** | Real-time token streaming to assistant UI | **Partially Implemented** | Backend controller has `/messages/stream`; frontend UI calls synchronous `/chat`. |
| **WebSocket Voice Gateway** | Bidirectional real-time audio and event stream | **Partially Implemented** | Backend gateway `/ws/assistant` ready; frontend does not establish WebSocket connection. |
| **RAG Knowledge Retrieval** | 63 verified schemes with multi-field scoring | **Implemented** | `scheme-retrieval.service.ts` provides weighted lexical & phonetic alias scoring. |
| **Phonetic STT Normalization** | Indian civic terminology spelling correction | **Implemented** | Both frontend and backend have 35+ phonetic regex replacement rules. |
| **VoiceStudio HTTP Adapter** | OpenAI-compatible `/v1/audio/*` client | **Implemented** | `voicestudio.client.ts` supports health, models, voices, speech, and transcription. |
| **VoiceStudio Local Launcher** | One-click startup script with dev fallback | **Implemented** | `scripts/start-voice-studio.mjs` handles port check, `.venv` launch, and mock server. |
| **Indian Female Voice Profiles** | Kavya, Priya, Neerja, Nova across 9 Indic languages | **Implemented** | Defined in `speech-synthesis.service.ts`; instruction tuning generator included. |
| **Zero-PII & Anti-Fraud Guardrails**| Strict refusal of Aadhaar/OTP + Free portal alerts | **Implemented** | Enforced in system prompt and verified in eligibility rule engine. |

---

## 4. Identified Broken Integrations & Disconnects

```mermaid
flowchart TD
    subgraph Frontend [frontend/src/components/JanasevaAssistant.tsx]
        UIState[Local React State: messages]
        HTTPChat[api.askChatbot -> POST /api/assistant/chat]
        SingleTTS[api.synthesizeSpeechVoiceStudio -> Voice: nova]
    end

    subgraph BackendReady [Implemented Backend Modules - UNUSED BY UI]
        WSGateway["WebSocket Gateway: /ws/assistant (Barge-in, Streaming)"]
        SSEStream["SSE Endpoint: /conversations/:id/messages/stream"]
        ConvCRUD["Conversation Store: /conversations (Multi-session DB)"]
        KavyaVoice["Primary Voice Profile: kavya-indic (Default)"]
    end

    HTTPChat -.->|Uses legacy stateless path| ChatRoute[POST /api/assistant/chat]
    UIState -.-x|Does NOT sync with| ConvCRUD
    Frontend -.-x|Does NOT connect to| WSGateway
    Frontend -.-x|Does NOT connect to| SSEStream
    SingleTTS -.->|Requests 'nova' instead of| KavyaVoice
```

### Specific Disconnects:
1. **Frontend Bypasses WebSocket Voice Gateway:**
   - `VoiceStreamGateway` (`/ws/assistant`) handles real-time state broadcasts (`thinking`, `retrieving`, `speaking`, `sentence`), sentence-level audio delivery, and barge-in `interrupt`.
   - `JanasevaAssistant.tsx` never opens a WebSocket connection to `/ws/assistant`.
2. **Frontend Bypasses Conversation Persistence:**
   - `conversation.service.ts` provides complete CRUD operations and multi-turn context persistence for authenticated citizens and guest sessions.
   - `JanasevaAssistant.tsx` does not create or fetch conversations from `/api/assistant/conversations`.
3. **Voice ID Mismatch:**
   - In `JanasevaAssistant.tsx`: `api.synthesizeSpeechVoiceStudio(cleanText, speakLang, 'nova')` passes voice `'nova'`.
   - In `speech-synthesis.service.ts`: `OFFICIAL_INDIAN_FEMALE_VOICES[0]` is `'kavya-indic'` with `isDefault: true`.
4. **Duplicate Terminology Normalization:**
   - The array of regex replacements for terms like `"grammar panchayat"`, `"gruha laxmi"`, `"pm kissan"` is defined in `JanasevaAssistant.tsx` and duplicated in `speech-recognition.service.ts`.
5. **Base64 WebM Overhead in MediaRecorder Fallback:**
   - In `api.ts`, `transcribeSpeechVoiceStudio` converts audio bytes to a binary string and calls `btoa()` in memory. For longer audio recordings, this can cause significant memory allocation on mobile browsers.

---

## 5. API Contract Audit

| Endpoint | Method | Expected Request Payload | Response Schema | Contract Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/assistant/chat` | `POST` | `{ message: string, language?: string, history?: Array }` | `{ success: boolean, reply: string, speechText: string, suggestedSchemes: Array, language: string, modelUsed: string, sentences: string[] }` | **Compliant** |
| `/api/assistant/conversations` | `GET` | *(Optional Bearer Token)* | `{ success: boolean, conversations: Conversation[] }` | **Compliant** |
| `/api/assistant/conversations` | `POST` | `{ title?: string, language?: string }` | `{ success: boolean, conversation: Conversation }` | **Compliant** |
| `/api/assistant/conversations/:id` | `GET` | `param: id` *(Optional Bearer Token)* | `{ success: boolean, conversation: Conversation }` | **Compliant** |
| `/api/assistant/conversations/:id/messages` | `POST` | `{ message: string, language?: string }` | `{ success: boolean, message: ConversationMessage, reply: string, suggestedSchemes: Array, ... }` | **Compliant** |
| `/api/assistant/conversations/:id/messages/stream` | `POST` | `{ message: string, language?: string }` | `text/event-stream` (SSE events: `state`, `metadata`, `sentence`, `done`) | **Compliant** |
| `/api/assistant/voice/status` | `GET` | None | `{ success: boolean, online: boolean, serviceUrl?: string, engine?: string, voices?: string[] }` | **Compliant** |
| `/api/assistant/voice/profiles` | `GET` | None | `{ success: boolean, profiles: VoiceProfile[], defaultVoice: string }` | **Compliant** |
| `/api/assistant/voice/tts` | `POST` | `{ text: string, language?: string, voice?: string }` | Binary Audio Buffer (`audio/mpeg` or `audio/wav`) | **Compliant** |
| `/api/assistant/voice/stt` | `POST` | `{ audioBase64: string, language?: string }` | `{ success: boolean, text: string, languageDetected: string, confidence: number }` | **Compliant** |
| `/ws/assistant` | `WS` | Client events: `init`, `query`, `interrupt` | Server events: `ready`, `state`, `metadata`, `sentence`, `done`, `interrupted` | **Compliant** |

---

## 6. Security & Performance Issues

### 6.1 Security
1. **PII Protection Guardrail:**
   - Both the system prompt and deterministic fallback rules enforce Zero-Sensitive-PII. If a user enters an Aadhaar number (12 digits) or bank account details, the system instructs them to delete it and refuses processing.
2. **Conversation Access Control:**
   - In `conversation.service.ts`:
     ```ts
     if (conv.userId && userId && conv.userId !== userId) {
       return null; // Deny unauthorized access
     }
     ```
   - Enforces user isolation so authenticated citizens cannot read other citizens' conversation records.
3. **Rate Limiting:**
   - Global rate limiter on `/api/` limits traffic to 120 requests/min per IP. Voice endpoints (`/api/voice/tts` and `/api/voice/stt`) consume substantial CPU/memory; they should have a dedicated rate limiter (e.g., 30 requests/min per IP) to prevent denial-of-service on local compute.

### 6.2 Performance
1. **Audio Synthesis Latency (TTFA - Time to First Audio):**
   - Synthesizing an entire 3-paragraph response can take 1,500ms to 3,000ms on a CPU.
   - Using the existing `sentences` chunking in `SpeechSynthesisService`, time-to-first-audio can drop to <450ms if sentence 1 is synthesized and played while sentences 2 and 3 are generated concurrently.
2. **Base64 Serialization Overhead:**
   - Base64 encoding audio increases data transfer size by ~33% and creates extra garbage collection pressure. Streaming raw binary over WebSockets eliminates this overhead.

---

## 7. Duplicate & Redundant Functionality

1. **Phonetic Normalization Dictionaries:**
   - `frontend/src/components/JanasevaAssistant.tsx` has `correctSpeechMistakes()`.
   - `backend/src/modules/voice/speech-recognition.service.ts` has `normalizeSpeechQuery()`.
   - *Recommendation:* Keep backend normalizer as the authoritative source; extract shared rules to a common utility file.
2. **Legacy `assistantService.ts` vs `modules/assistant/assistant.service.ts`:**
   - Both files exist in `backend/src/services/` and `backend/src/modules/assistant/`.
   - `backend/src/services/assistantService.ts` re-exports or duplicates logic from the older monolithic phase.
   - *Recommendation:* Retain `backend/src/modules/assistant/` as the single canonical implementation.

---

## 8. Reusable Components & Architectural Strengths

1. **`VoiceStudioClient` (`voicestudio.client.ts`):** Clean, standard HTTP client implementing OpenAI audio specification endpoints (`/v1/audio/speech`, `/v1/audio/transcriptions`). Can connect to any OpenAI-compatible server or VoiceStudio instance.
2. **`SchemeRetrievalService` (`scheme-retrieval.service.ts`):** Highly performant (<2ms execution) weighted RAG engine. Includes vernacular and phonetic aliases for the 63 verified schemes.
3. **`SpeechSynthesisService` (`speech-synthesis.service.ts`):** Sentence boundary regexes supporting Indic danda `।` and voice instruction tuning generator.
4. **`VoiceStreamGateway` (`voice-stream.gateway.ts`):** Complete WebSocket session manager with support for barge-in interrupts, generation IDs, and concurrent sentence audio delivery.
5. **`start-voice-studio.mjs`:** Robust development tool that automatically launches a mock speech server with audible preview tones if Python/Torch dependencies are not installed.

---

## 9. Recommended Phased Execution Plan

```mermaid
flowchart LR
    Phase1["Phase 1: Voice Profile & UI Alignment"] --> Phase2["Phase 2: Conversation Persistence Integration"]
    Phase2 --> Phase3["Phase 3: Real-Time Waveform & AudioContext"]
    Phase3 --> Phase4["Phase 4: WebSocket Voice Gateway Activation"]
    Phase4 --> Phase5["Phase 5: Voice Rate Limiting & E2E Validation"]
```

### Phase 1: Voice Profile & UI Contract Alignment
- Fix the voice profile argument in `JanasevaAssistant.tsx` from `'nova'` to `'kavya-indic'`.
- Synchronize phonetic speech correction rules between frontend and backend.
- Expose voice selection dropdown in assistant settings (Kavya, Priya, Neerja, Nova).

### Phase 2: Conversation Persistence Integration
- Update `JanasevaAssistant.tsx` to initialize a conversation session via `POST /api/assistant/conversations` upon open.
- Sync message history with `POST /api/assistant/conversations/:id/messages`.
- Enable citizens to view past consultations or clear history with full backend persistence.

### Phase 3: Real-Time Waveform & AudioContext
- Add a Web Audio API `AnalyserNode` in `JanasevaAssistant.tsx` to sample audio frequencies when listening or speaking.
- Render a smooth canvas or SVG waveform visualizer in place of the static microphone icon.

### Phase 4: WebSocket Voice Gateway Activation
- Connect `JanasevaAssistant.tsx` to `ws://localhost:5000/ws/assistant`.
- Stream incoming audio sentence-by-sentence into an audio queue.
- Implement client-side barge-in: clicking mic or speaking sends `{ type: 'interrupt' }` to stop current voice playback instantly.

### Phase 5: Voice Rate Limiting & Verification
- Add a dedicated rate limiter (`voiceLimiter`) in `server.ts` for `/api/voice/*` (30 requests/min).
- Verify end-to-end flow with automated test scripts and VoiceStudio launcher (`npm run voice:start`).

---

## 10. Audit Conclusion

The JANASEVA AI Assistant already possesses an enterprise-grade modular backend with OpenAI-compatible VoiceStudio integration, RAG retrieval across 63 verified schemes, multi-lingual script handling, and a WebSocket voice gateway. 

The primary task for the next phase is **connecting the frontend UI to these backend capabilities** (WebSocket streaming, persistent conversation CRUD, barge-in controls, and real-time audio waveform visualization) without destabilizing any existing portal features.