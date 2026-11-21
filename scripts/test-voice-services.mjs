#!/usr/bin/env node

/**
 * Unit verification of backend voice modules
 */
import { speechSynthesisService, OFFICIAL_INDIAN_FEMALE_VOICES } from '../backend/dist/modules/voice/speech-synthesis.service.js';
import { speechRecognitionService } from '../backend/dist/modules/voice/speech-recognition.service.js';
import { voiceService, SUPPORTED_INDIC_LANGUAGES } from '../backend/dist/modules/voice/voice.service.js';
import { voiceStudioClient } from '../backend/dist/modules/voice/voicestudio.client.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`✓ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`✗ [FAIL] ${msg}`);
    failed++;
  }
}

async function run() {
  console.log('--- Testing Voice Profiles ---');
  assert(OFFICIAL_INDIAN_FEMALE_VOICES.length >= 4, 'At least 4 verified Indian female voice profiles exist');
  const defaultVoice = OFFICIAL_INDIAN_FEMALE_VOICES.find(v => v.isDefault);
  assert(defaultVoice && defaultVoice.id === 'kavya-indic', "Default voice is 'kavya-indic'");

  console.log('\n--- Testing Multi-Lingual Instructions (Kannada, English, Hindi) ---');
  const knInst = speechSynthesisService.getVoiceInstructions('kn', 'kavya-indic');
  assert(knInst.includes('Kannada') && knInst.includes('Indian female voice'), 'Kannada prompt includes Indian female instruction and regional pronunciation');

  const enInst = speechSynthesisService.getVoiceInstructions('en', 'kavya-indic');
  assert(enInst.includes('Indian English') && enInst.includes('Rupees'), 'English prompt includes Indian English and currency pronunciation');

  const hiInst = speechSynthesisService.getVoiceInstructions('hi', 'kavya-indic');
  assert(hiInst.includes('Hindi') && hiInst.includes('respectful'), 'Hindi prompt includes respectful conversational Hindi');

  console.log('\n--- Testing Sentence Splitting for Low-Latency Streaming ---');
  const paragraph = 'ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಯಡಿ ₹2,000 ನೀಡಲಾಗುತ್ತದೆ. ದಾಖಲೆಗಳು ಯಾವುವು? ಆಧಾರ್ ಕಾರ್ಡ್ ಮತ್ತು ರೇಷನ್ ಕಾರ್ಡ್ ಅಗತ್ಯವಿದೆ।';
  const sentences = speechSynthesisService.splitIntoSentences(paragraph);
  assert(sentences.length >= 2, `Sentence splitter broke paragraph into ${sentences.length} chunks`);

  console.log('\n--- Testing Phonetic Terminology Normalization ---');
  const rawText = 'Tell me about grammar panchayat and gruha laxmi yojana documents for pm kissan';
  const normalized = speechRecognitionService.normalizeSpeechQuery(rawText);
  assert(normalized.includes('Gram Panchayat'), "Normalized 'grammar panchayat' -> 'Gram Panchayat'");
  assert(normalized.includes('Gruha Lakshmi'), "Normalized 'gruha laxmi' -> 'Gruha Lakshmi'");
  assert(normalized.includes('PM-KISAN'), "Normalized 'pm kissan' -> 'PM-KISAN'");

  console.log('\n--- Testing Supported Languages ---');
  const langs = voiceService.getSupportedLanguages();
  const codes = langs.map(l => l.code);
  assert(codes.includes('kn') && codes.includes('en') && codes.includes('hi'), 'Includes Kannada, English, and Hindi');

  console.log(`\nTOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
