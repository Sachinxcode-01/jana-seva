#!/usr/bin/env node

/**
 * ==============================================================================
 * JANASEVA – VoiceStudio Service Integration & Multi-Lingual Test Suite
 * ==============================================================================
 * 
 * Verifies:
 *  1. Dynamic Service Discovery (Health, Models, Voices, Languages)
 *  2. Indian Female Voice Profiles (Kavya default, Priya, Neerja)
 *  3. TTS Synthesis for Kannada (kn), English (en), and Hindi (hi)
 *  4. Streaming Audio Generation (/api/voice/tts/stream)
 *  5. STT Transcription & Phonetic Civic Normalization (/api/voice/stt)
 *  6. Failure, timeout, and graceful fallback handling
 * ==============================================================================
 */

import http from 'node:http';

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
const VOICE_API = `${API_BASE}/voice`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`${colors.green}✓ [PASS]${colors.reset} ${message}`);
    passed++;
  } else {
    console.error(`${colors.red}✗ [FAIL]${colors.reset} ${message}`);
    failed++;
  }
}

async function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      timeout: options.timeout || 15000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function fetchBinary(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      timeout: options.timeout || 25000
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          buffer: Buffer.concat(chunks)
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Binary request timed out'));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  JANASEVA VOICESTUDIO INTEGRATION TEST SUITE       ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  try {
    // 1. Health & Capability Discovery
    console.log(`${colors.bold}--- 1. Service Health & Dynamic Discovery ---${colors.reset}`);
    const healthRes = await fetchJson(`${VOICE_API}/status`);
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
    assert(healthRes.data.success !== undefined, 'Health response contains success indicator');
    console.log(`   Service Status: ${healthRes.data.online ? 'Online (VoiceStudio Active)' : 'Offline (Browser Fallback Active)'}`);

    // 2. Dynamic Models Discovery
    console.log(`\n${colors.bold}--- 2. Dynamic Model Discovery ---${colors.reset}`);
    const modelsRes = await fetchJson(`${VOICE_API}/models`);
    assert(modelsRes.status === 200, 'GET /api/voice/models returns HTTP 200');
    assert(Array.isArray(modelsRes.data.models), 'Models response contains array of models');
    console.log(`   Discovered Models: ${modelsRes.data.models.map(m => m.id).join(', ') || 'Default'}`);

    // 3. Indian Female Voice Profiles
    console.log(`\n${colors.bold}--- 3. Voice Profiles & Languages ---${colors.reset}`);
    const profilesRes = await fetchJson(`${VOICE_API}/profiles`);
    assert(profilesRes.status === 200, 'GET /api/voice/profiles returns HTTP 200');
    assert(Array.isArray(profilesRes.data.profiles), 'Profiles response returns array');
    
    const hasKavya = profilesRes.data.profiles.some(p => p.id === 'kavya-indic');
    assert(hasKavya, "Default Indian female voice profile 'kavya-indic' is registered");
    assert(profilesRes.data.defaultVoice === 'kavya-indic', 'Default voice is configured as kavya-indic');

    const langsRes = await fetchJson(`${VOICE_API}/languages`);
    assert(langsRes.status === 200, 'GET /api/voice/languages returns HTTP 200');
    const langCodes = (langsRes.data.languages || []).map(l => l.code);
    assert(langCodes.includes('kn') && langCodes.includes('en') && langCodes.includes('hi'), 
      'Supported languages include Kannada (kn), English (en), and Hindi (hi)');

    // 4. TTS Synthesis: Test Kannada, English, and Hindi First
    console.log(`\n${colors.bold}--- 4. TTS Synthesis (Kannada, English, Hindi) ---${colors.reset}`);

    // 4a. Kannada TTS
    const knText = 'ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಯಡಿ ಕರ್ನಾಟಕದ ಮಹಿಳೆಯರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹2,000 ಹಣಕಾಸಿನ ನೆರವು ನೀಡಲಾಗುತ್ತದೆ.';
    const knRes = await fetchBinary(`${VOICE_API}/tts`, {
      body: { text: knText, language: 'kn', voice: 'kavya-indic' }
    });
    assert(knRes.status === 200 || knRes.status === 503, `Kannada TTS responded with status ${knRes.status}`);
    if (knRes.status === 200) {
      assert(knRes.buffer.length > 100, `Kannada audio generated (${knRes.buffer.length} bytes)`);
      assert(knRes.headers['x-voice-profile'] !== undefined, 'Kannada response includes X-Voice-Profile header');
    }

    // 4b. English TTS (Indian Civic Pronunciation)
    const enText = 'PM-KISAN provides 6,000 rupees per year directly to eligible farmers across three equal installments.';
    const enRes = await fetchBinary(`${VOICE_API}/tts`, {
      body: { text: enText, language: 'en', voice: 'kavya-indic' }
    });
    assert(enRes.status === 200 || enRes.status === 503, `English TTS responded with status ${enRes.status}`);
    if (enRes.status === 200) {
      assert(enRes.buffer.length > 100, `English audio generated (${enRes.buffer.length} bytes)`);
    }

    // 4c. Hindi TTS
    const hiText = 'आयुष्मान भारत योजना के तहत प्रत्येक पात्र परिवार को 5 लाख रुपये का स्वास्थ्य बीमा मिलता है।';
    const hiRes = await fetchBinary(`${VOICE_API}/tts`, {
      body: { text: hiText, language: 'hi', voice: 'kavya-indic' }
    });
    assert(hiRes.status === 200 || hiRes.status === 503, `Hindi TTS responded with status ${hiRes.status}`);
    if (hiRes.status === 200) {
      assert(hiRes.buffer.length > 100, `Hindi audio generated (${hiRes.buffer.length} bytes)`);
    }

    // 5. Streaming Audio Generation
    console.log(`\n${colors.bold}--- 5. Streaming Audio Generation ---${colors.reset}`);
    const streamRes = await fetchBinary(`${VOICE_API}/tts/stream`, {
      body: { text: 'Welcome to Janaseva Assistant. How may I help you today?', language: 'en', voice: 'kavya-indic' }
    });
    assert(streamRes.status === 200, 'Streaming TTS endpoint returns HTTP 200');
    assert(streamRes.buffer.length > 0, `Streaming TTS received audio stream (${streamRes.buffer.length} bytes)`);

    // 6. STT Transcription & Civic Phonetic Normalization
    console.log(`\n${colors.bold}--- 6. STT Transcription & Civic Normalization ---${colors.reset}`);
    // Create a dummy audio buffer (mocking 16kHz mono audio header)
    const dummyAudio = Buffer.alloc(1024, 0);
    const base64Audio = dummyAudio.toString('base64');

    const sttRes = await fetchJson(`${VOICE_API}/stt`, {
      method: 'POST',
      body: { audioBase64: base64Audio, language: 'kn' }
    });
    assert(sttRes.status === 200, 'POST /api/voice/stt returns HTTP 200');
    assert(sttRes.data.success === true, 'STT response contains success: true');
    console.log(`   Transcribed Text: "${sttRes.data.text}"`);

    // 7. Error Handling & Validation
    console.log(`\n${colors.bold}--- 7. Error Handling & Input Validation ---${colors.reset}`);
    const emptyTts = await fetchJson(`${VOICE_API}/tts`, {
      method: 'POST',
      body: { text: '' }
    });
    assert(emptyTts.status === 400, 'Empty TTS request correctly returns HTTP 400');

    const emptyStt = await fetchJson(`${VOICE_API}/stt`, {
      method: 'POST',
      body: { audioBase64: '' }
    });
    assert(emptyStt.status === 400, 'Empty STT request correctly returns HTTP 400');

  } catch (err) {
    console.error(`${colors.red}Fatal test suite error:${colors.reset}`, err.message);
    failed++;
  }

  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`TOTAL INTEGRATION TESTS: ${passed + failed} | ${colors.green}PASSED: ${passed}${colors.reset} | ${failed > 0 ? colors.red : colors.green}FAILED: ${failed}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  if (failed > 0) process.exit(1);
}

runTests();
