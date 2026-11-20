import { spawn } from 'child_process';
import http from 'http';
import WebSocket from '../backend/node_modules/ws/index.js';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkHttp(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function run() {
  console.log('========================================================================');
  console.log('   JANASEVA CONVERSATIONAL AI VOICE ASSISTANT - E2E TEST SUITE');
  console.log('========================================================================\n');

  // 1. Start VoiceStudio Dev Speech Service on port 3900
  console.log('[STEP 1] Starting VoiceStudio speech service on port 3900...');
  const voiceProc = spawn('node', ['scripts/start-voice-studio.mjs', '--mock'], {
    stdio: 'pipe',
    env: { ...process.env, VOICESTUDIO_PORT: '3900' }
  });

  // Wait for VoiceStudio to be ready
  let voiceReady = false;
  for (let i = 0; i < 15; i++) {
    await wait(400);
    if (await checkHttp('http://localhost:3900/.well-known/voicestudio-speech')) {
      voiceReady = true;
      break;
    }
  }

  if (!voiceReady) {
    console.error('✖ Failed to start VoiceStudio on port 3900');
    voiceProc.kill();
    process.exit(1);
  }
  console.log('✔ VoiceStudio local speech service is ONLINE (port 3900)\n');

  // 2. Start JANASEVA Backend on port 5005
  console.log('[STEP 2] Starting JANASEVA Backend API on port 5005...');
  const backendProc = spawn('node', ['backend/dist/server.js'], {
    stdio: 'pipe',
    env: { ...process.env, PORT: '5005', NODE_ENV: 'test', VOICESTUDIO_URL: 'http://localhost:3900' }
  });

  let backendReady = false;
  for (let i = 0; i < 20; i++) {
    await wait(400);
    if (await checkHttp('http://localhost:5005/api/health')) {
      backendReady = true;
      break;
    }
  }

  if (!backendReady) {
    console.error('✖ Failed to start JANASEVA Backend on port 5005');
    voiceProc.kill();
    backendProc.kill();
    process.exit(1);
  }
  console.log('✔ JANASEVA Backend is ONLINE (port 5005)\n');

  const API_BASE = 'http://localhost:5005/api/v1';
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: VoiceStudio Dynamic Discovery & Health Status
    // -------------------------------------------------------------------------
    console.log('--- Test Group 1: VoiceStudio Engine & Voice Profile Discovery ---');
    const t0 = Date.now();
    const statusRes = await fetch(`${API_BASE}/voice/status`).then(r => r.json());
    const latencyStatus = Date.now() - t0;
    assert(statusRes.online === true, 'VoiceStudio Health Check', `${latencyStatus}ms`);
    assert(Array.isArray(statusRes.voices) && statusRes.voices.length > 0, 'VoiceStudio Voice Discovery', `Found: ${statusRes.voices?.join(', ')}`);

    const profilesRes = await fetch(`${API_BASE}/voice/profiles`).then(r => r.json());
    assert(profilesRes.success && profilesRes.profiles.length >= 3, 'Indian Female Voice Profiles Listed', `Count: ${profilesRes.profiles?.length}`);
    const defaultVoice = profilesRes.profiles.find(p => p.id === 'kavya-indic');
    assert(defaultVoice && defaultVoice.gender === 'female', 'Primary Indian Female Voice (Kavya) Verified');

    // -------------------------------------------------------------------------
    // TEST 2: High-Quality Indian Female Voice TTS Synthesis
    // -------------------------------------------------------------------------
    console.log('\n--- Test Group 2: Text-To-Speech (TTS) Synthesis ---');
    const t1 = Date.now();
    const ttsRes = await fetch(`${API_BASE}/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಯಡಿ ಮಹಿಳೆಯರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹2,000 ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನೇರವಾಗಿ ಜಮೆಯಾಗುತ್ತದೆ.',
        language: 'kn',
        voice: 'kavya-indic'
      })
    });
    const ttsLatency = Date.now() - t1;
    const ttsBuffer = await ttsRes.arrayBuffer();
    assert(ttsRes.status === 200, 'Kannada Speech Synthesis (TTS)', `${ttsLatency}ms, ${ttsBuffer.byteLength} bytes`);
    assert(ttsRes.headers.get('content-type')?.includes('audio'), 'TTS Audio Content-Type Header');

    // -------------------------------------------------------------------------
    // TEST 3: Whisper Speech-to-Text Transcription with Phonetic Normalization
    // -------------------------------------------------------------------------
    console.log('\n--- Test Group 3: Speech-To-Text (STT) & Phonetic Correction ---');
    const sampleAudioBase64 = Buffer.from('RIFF....WAVEfmt ....data....').toString('base64');
    const sttRes = await fetch(`${API_BASE}/voice/stt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: sampleAudioBase64,
        language: 'kn'
      })
    }).then(r => r.json());
    assert(sttRes.success && typeof sttRes.text === 'string', 'STT Transcription via VoiceStudio Whisper', `Text: "${sttRes.text}"`);

    // -------------------------------------------------------------------------
    // TEST 4: Conversation Session Lifecycle & Ownership Security
    // -------------------------------------------------------------------------
    console.log('\n--- Test Group 4: Conversation Lifecycle & Security ---');
    const createConvRes = await fetch(`${API_BASE}/assistant/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'kn', title: 'Welfare Inquiry Session' })
    }).then(r => r.json());
    assert(createConvRes.success && createConvRes.conversation?.id, 'Create Conversation Session', `ID: ${createConvRes.conversation?.id}`);
    const conversationId = createConvRes.conversation.id;

    // -------------------------------------------------------------------------
    // TEST 5: Kannada Government Scheme RAG Grounding (Gruha Lakshmi)
    // -------------------------------------------------------------------------
    console.log('\n--- Test Group 5: Multilingual AI Conversation & RAG Retrieval ---');
    const t2 = Date.now();
    const knQueryRes = await fetch(`${API_BASE}/assistant/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಗೆ ಯಾವ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?',
        language: 'kn'
      })
    }).then(r => r.json());
    const knLatency = Date.now() - t2;

    assert(knQueryRes.success, 'Kannada Scheme Query Processing', `${knLatency}ms`);
    assert(knQueryRes.language === 'kn', 'Detected Language Kannada (kn)');
    assert(knQueryRes.suggestedSchemes?.some(s => s.slug.includes('gruha-lakshmi')), 'RAG Scheme Grounding (Gruha Lakshmi)');
    assert(knQueryRes.reply.includes('ಗೃಹ ಲಕ್ಷ್ಮಿ') || knQueryRes.reply.includes('ದಾಖಲೆ'), 'Kannada Grounded Response Content');
    assert(Array.isArray(knQueryRes.sentences) && knQueryRes.sentences.length > 0, 'Sentence Chunking for Streaming Voice');

    // -------------------------------------------------------------------------
    // TEST 6: Hindi Scheme Query (PM-KISAN)
    // -------------------------------------------------------------------------
    console.log('\n--- Test Group 6: Hindi Query & RAG Grounding ---');
    const hiQueryRes = await fetch(`${API_BASE}/assistant/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'पीएम किसान योजना में कितने पैसे मिलते हैं और कौन पात्र है?',
        language: 'hi'
      })
    }).then(r => r.json());
    assert(hiQueryRes.success, 'Hindi Scheme Query Processing');
    assert(hiQueryRes.language === 'hi', 'Detected Language Hindi (hi)');
    assert(hiQueryRes.suggestedSchemes?.some(s => s.slug.includes('pm-kisan')), 'RAG Scheme Grounding (PM-KISAN)');

    // -------------------------------------------------------------------------
    // TEST 7: Code-Switching (Kannada-English)
    // -------------------------------------------------------------------------
    console.log('\n--- Test Group 7: Natural Code-Switching (Kannada-English) ---');
    const codeSwitchRes = await fetch(`${API_BASE}/assistant/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Gruha Lakshmi ge yaru eligible? How to apply?',
        language: 'kn'
      })
    }).then(r => r.json());
    assert(codeSwitchRes.success, 'Code-Switching Query Processed');
    assert(codeSwitchRes.suggestedSchemes?.length > 0, 'Code-Switching Context Grounded');

    // -------------------------------------------------------------------------
    // TEST 8: Multi-Turn Elliptic Follow-Up Context Continuity
    // -------------------------------------------------------------------------
    console.log('\n--- Test Group 8: Multi-Turn Conversation Continuity ---');
    const followUpRes = await fetch(`${API_BASE}/assistant/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Who is eligible?',
        language: 'en'
      })
    }).then(r => r.json());
    assert(followUpRes.success, 'Elliptic Follow-up Query Handled');
    assert(followUpRes.suggestedSchemes?.length > 0, 'Follow-up Grounded in Active Scheme Context');

    // -------------------------------------------------------------------------
    // TEST 9: Real-Time WebSocket Streaming & Barge-in Interruption
    // -------------------------------------------------------------------------
    console.log('\n--- Test Group 9: Real-Time WebSocket Streaming & Interruption ---');
    const ws = new WebSocket('ws://localhost:5005/ws/assistant');

    await new Promise((resolve) => {
      ws.on('open', () => {
        assert(true, 'WebSocket Connection to /ws/assistant Established');
        ws.send(JSON.stringify({
          type: 'init',
          conversationId,
          language: 'kn',
          voice: 'kavya-indic'
        }));
      });

      let receivedStates = [];
      let receivedSentences = 0;

      ws.on('message', (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'initialized') {
          assert(true, 'WebSocket Session Initialized');
          // Send query
          ws.send(JSON.stringify({
            type: 'query',
            text: 'ಶಕ್ತಿ ಯೋಜನೆಯಡಿ ಮಹಿಳೆಯರಿಗೆ ಉಚಿತ ಬಸ್ ಪ್ರಯಾಣ ಹೇಗೆ ಸಿಗುತ್ತದೆ?'
          }));
        }

        if (msg.type === 'state') {
          receivedStates.push(msg.state);
        }

        if (msg.type === 'sentence') {
          receivedSentences++;
          // Simulate Citizen Interruption after 1st sentence!
          if (receivedSentences === 1) {
            ws.send(JSON.stringify({ type: 'interrupt' }));
          }
        }

        if (msg.type === 'interrupted') {
          assert(true, 'Barge-In Interrupt Handled (Playback Canceled)');
          assert(receivedStates.includes('thinking') || receivedStates.includes('speaking'), 'State Lifecycle Flow Verified', `States: ${receivedStates.join(' -> ')}`);
          ws.close();
          resolve();
        }

        if (msg.type === 'done') {
          ws.close();
          resolve();
        }
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        resolve();
      });

      setTimeout(resolve, 8000);
    });

    // -------------------------------------------------------------------------
    // TEST 10: Backward Compatibility with Legacy /api/assistant/chat
    // -------------------------------------------------------------------------
    console.log('\n--- Test Group 10: Backward Compatibility ---');
    const legacyRes = await fetch('http://localhost:5005/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Tell me about Ayushman Bharat health insurance'
      })
    }).then(r => r.json());
    assert(legacyRes.success && legacyRes.reply.length > 20, 'Legacy /api/assistant/chat Working Perfectly');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    console.log('\n========================================================================');
    console.log(`  E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    voiceProc.kill();
    backendProc.kill();
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
