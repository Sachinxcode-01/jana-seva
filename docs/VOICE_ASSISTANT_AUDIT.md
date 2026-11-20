# JANASEVA – Conversational AI Voice Assistant Audit Report
**Document:** `docs/VOICE_ASSISTANT_AUDIT.md`  
**Date:** November 2026  
**Auditor:** Senior AI Engineer, Voice AI Architect, Full-Stack Developer  
**Status:** COMPLETE (Baseline for Production Upgrade)

---

## 1. Executive Summary

This comprehensive audit evaluates the existing conversational assistant within the JANASEVA Civic Welfare Portal against modern conversational voice AI standards (e.g., ChatGPT Voice, Claude conversational interfaces). The objective is to identify existing architecture, capabilities, and gaps before implementing a production-grade, multilingual, real-time voice assistant powered by VoiceStudio and an intelligent RAG conversation engine.

---

## 2. Comprehensive 10-Point Technical Inspection

### 2.1 Existing JANASEVA Assistant UI
* **Location:** `frontend/src/components/JanasevaAssistant.tsx`
* **Current Implementation:**
  * Floating bottom-right widget with toggle modal (`w-[92vw] sm:w-[440px] h-[580px]`).
  * Basic text chat interface with suggested schemes bubbles, quick prompts, and plain copy/export actions.
  * Microphone button that initiates browser `SpeechRecognition` or basic MediaRecorder base64 audio upload.
  * Audio playback relies on single-blob full playback (`new Audio(url)`) or browser `speechSynthesis`.
* **Identified Gaps:**
  * No visual state machine differentiating `Idle`, `Connecting`, `Listening`, `Transcribing`, `Thinking`, `Retrieving`, `Speaking`, `Interrupted`, `Error`, and `Reconnecting`.
  * Lacks real-time audio waveform / frequency spectrum visualizer during listening and speaking.
  * No live interim transcription streaming in the UI while citizen speaks.
  * Lacks instant barge-in interrupt control and sentence-level streaming playback queue.
  * Voice controls are buried or binary; manual language switching is tied to portal language rather than inline conversational language switching.

### 2.2 Current Assistant API Routes
* **Location:** `backend/src/routes/assistantRoutes.ts`
* **Current Endpoints:**
  * `POST /api/assistant/chat` (processes message + language + history, returns JSON).
  * `GET /api/assistant/voice/status` (checks if VoiceStudio is reachable).
  * `POST /api/assistant/voice/tts` (generates monolithic audio buffer from input text).
  * `POST /api/assistant/voice/stt` (transcribes base64 webm audio).
* **Identified Gaps:**
  * No persistent conversation lifecycle endpoints (`/conversations`, `/conversations/:id`, `/conversations/:id/messages`).
  * No streaming endpoint (SSE or WebSocket) for real-time AI token generation or audio chunks.
  * Unauthenticated routes allow anonymous overuse without rate limits or user session binding.
  * Missing voice profile discovery (`GET /api/assistant/voice/profiles`) and engine telemetry.

### 2.3 Existing AI Model Integration
* **Location:** `backend/src/services/assistantService.ts`
* **Current Implementation:**
  * Calls OpenRouter API (`nvidia/nemotron-3.5-lightning:free` or `openrouter/auto`) via HTTPS POST.
  * Waits synchronously for the complete completion before returning.
  * Provides a deterministic fallback rule engine when OpenRouter is unreachable or unconfigured.
* **Identified Gaps:**
  * No token streaming (Time-To-First-Token is throttled by waiting for the entire generation).
  * No sentence boundary chunking for concurrent TTS synthesis (which is necessary to achieve <500ms time-to-first-audio).
  * The system prompt lacked strict RAG boundaries, source verification badges, and advisory eligibility disclaimers.
  * Raw markdown formatting (asterisks, URLs) is sent directly to TTS without phonetic speech normalization.

### 2.4 Current Knowledge Base & Scheme Data
* **Location:** `janaseva_db.json`, `backend/src/database/schemesData.ts`, `backend/src/database/db.ts`
* **Current Implementation:**
  * High-quality structured repository of 50+ central and Karnataka state government welfare schemes (Gruha Lakshmi, Shakti, PM-KISAN, Ayushman Bharat, Anna Bhagya, SSP Post-Matric, etc.).
  * Comprehensive schema: `benefits`, `eligibilityCriteria` (rules, income limits, age bounds), `requiredDocuments`, `applicationProcedure` (steps, links), `officialWebsite`, `sourceVerificationStatus`.
* **Identified Gaps:**
  * Retrieval is currently basic substring matching on scheme names and broad categories.
  * No structured scoring/ranking pipeline that extracts specific criteria (e.g., student vs. farmer vs. woman head of household) to retrieve top candidates.
  * Lack of source attribution metadata in responses (advisory disclaimer, verification timestamp).

### 2.5 Existing Language Support
* **Current Implementation:**
  * Script range regexes detect Devanagari, Kannada, Telugu, Tamil, Malayalam, Bengali, Gujarati, Punjabi, and Urdu.
  * Some prompt instructions mapped for Kannada, Hindi, and English.
* **Identified Gaps:**
  * Code-switching (e.g., "Gruha Lakshmi ge yaru eligible?") is partially addressed by phonetic regex, but lacks formal bilingual context management.
  * Frontend only offers English, Kannada, and Hindi language contexts; missing first-class support for Telugu, Tamil, Malayalam, Marathi, Bengali, and Gujarati voice synthesis and prompts.
  * No fallback prompt to clarify language when confidence is low.

### 2.6 VoiceStudio Integration
* **Location:** `.agents/voice-studio` (Local service on `http://localhost:3900`), `backend/src/services/voiceStudioService.ts`, `scripts/start-voice-studio.mjs`
* **Current Implementation:**
  * VoiceStudio code repository exists with FastAPI endpoints (`/v1/audio/speech`, `/v1/audio/transcriptions`, `/v1/models`, `/ws/tts`, `/v1/audio/transcriptions/stream`).
  * Backend has simple HTTP client checking `/.well-known/voicestudio-speech` and posting to `/v1/audio/speech`.
* **Identified Gaps:**
  * Models, engines, and voice profiles are partially hardcoded or assumed rather than dynamically discovered via `GET /v1/models` and `GET /v1/audio/voices`.
  * No WebSocket streaming client for real-time transcription (`/v1/audio/transcriptions/stream` or `/ws/transcribe`) or streaming speech (`/ws/tts`).
  * No secure session token handling for remote or sandboxed deployments.
  * No automated failover or graceful fallback to high-quality browser Web Speech API when VoiceStudio is offline.

### 2.7 Backend Architecture
* **Current Implementation:**
  * Monolithic flat services: `assistantService.ts` contains language detection, phonetic replacement, OpenRouter HTTP client, prompt templates, rule engine, and scheme queries all in one 565-line file.
  * `voiceStudioService.ts` contains ad-hoc HTTP requests without connection pooling or retry policies.
* **Identified Gaps:**
  * Lacks modular separation of concerns specified in Phase 9:
    * `backend/src/modules/assistant/` (orchestration, conversations, context, response formatting)
    * `backend/src/modules/voice/` (VoiceStudio adapter, STT, TTS, streaming, voice profiles)
    * `backend/src/modules/knowledge/` (scheme retrieval, semantic scoring, advisory grounding)

### 2.8 Existing Authentication & Authorization
* **Location:** `backend/src/auth/authMiddleware.ts`
* **Current Implementation:**
  * Robust JWT middleware (`authenticate`, `requireAdmin`, `optionalAuthenticate`) checking Bearer token against `CONFIG.JWT_SECRET` and user active sessions.
* **Identified Gaps:**
  * Assistant routes are currently completely unauthenticated (`app.use(['/api/assistant', '/api/v1/assistant'], assistantRoutes)`).
  * No validation ensuring a user only accesses their own conversation records.
  * Need hybrid security: Authenticated users persist and sync their conversations across devices; guest users can use temporary ephemeral sessions.

### 2.9 Current Conversation Storage
* **Location:** `backend/src/database/db.ts`
* **Current Implementation:**
  * Database schema includes `users`, `schemes`, `savedSchemes`, `applications`, `assessments`, `savedEligibilityRecords`, `notifications`, `logs`.
  * **Conversations are completely absent from the database!**
  * All chat history currently exists solely in client-side React component memory.
* **Identified Gaps:**
  * Refreshing the browser or switching routes loses the conversation context.
  * Follow-up questions fail if the client session reloads.
  * No audit trail or ability for citizens to resume past advisory consultations.

### 2.10 Existing Frontend Audio Handling
* **Current Implementation:**
  * Uses browser `webkitSpeechRecognition` with a 2.5-second silence timeout.
  * Fallback uses `MediaRecorder`, records until manual stop, base64 encodes the entire file, and uploads to `/api/assistant/voice/stt`.
  * Audio playback creates an `Audio` instance from blob or uses `speechSynthesis.speak()`.
* **Identified Gaps:**
  * No AudioContext analyser node to extract real-time frequency data for voice waveform visualization.
  * No barge-in mechanism: when the assistant is speaking, citizen input does not immediately cut off the audio or notify the backend to cancel downstream generation.
  * No sentence audio buffering: citizen must wait for complete paragraph synthesis instead of streaming sentences smoothly.

---

## 3. Implementation Plan & Target Architecture

Based on these findings, we will implement the 11 phases without disrupting any existing features:

1. **Database Schema Upgrade:** Add `conversations` and `messages` entities to `db.ts` with ownership enforcement.
2. **Knowledge Retrieval Module:** Build `backend/src/modules/knowledge/` for multi-field RAG search, eligibility extraction, and verified citations.
3. **VoiceStudio Adapter Module:** Build `backend/src/modules/voice/` featuring dynamic model/voice discovery, Indian female voice configurations, sentence-level TTS synthesis, and WebSocket/HTTP streaming.
4. **Multilingual AI Orchestration Module:** Build `backend/src/modules/assistant/` with streaming token generation, speech-ready text normalization, language detection across 9+ Indian languages, and multi-turn context memory.
5. **Real-Time Voice Streaming & WebSocket Gateway:** Provide bidirectional audio streaming, VAD, and interruption cancellation.
6. **Polished Conversational UI:** Revamp `frontend/src/components/JanasevaAssistant.tsx` with animated waveform, modern ChatGPT Voice style interaction states, mobile layout, audio replay, and barge-in controls.
7. **Comprehensive Testing & Validation:** E2E test suite covering multi-turn, multi-lingual, voice synthesis, RAG accuracy, and failover.
