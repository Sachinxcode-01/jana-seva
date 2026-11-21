#!/usr/bin/env node

/**
 * ==============================================================================
 * JANASEVA – AI Intelligence Engine Unit & Integration Test Suite
 * ==============================================================================
 *
 * Verifies:
 *  1. Provider Architecture & Factory resolution
 *  2. Natural Language Understanding (NLU) & Intent Classification
 *  3. Context-Aware Multi-Turn Follow-Up Resolution (e.g. PM-KISAN -> Who is eligible?)
 *  4. Multi-Lingual Generation (Kannada, English, Hindi)
 *  5. Configurable Response Length (Concise, Standard, Detailed)
 *  6. Offline Deterministic Provider & Seamless Failure Fallback
 *  7. Streaming Token Generation
 * ==============================================================================
 */

import { aiService } from '../backend/dist/modules/ai/ai.service.js';
import { aiProviderFactory } from '../backend/dist/modules/ai/provider.factory.js';
import { nluService } from '../backend/dist/modules/ai/nlu.service.js';
import { responseFormatter } from '../backend/dist/modules/ai/response-formatter.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`✗ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  JANASEVA AI INTELLIGENCE ENGINE TEST SUITE        ');
  console.log('====================================================\n');

  // --- 1. Provider Factory Architecture ---
  console.log('--- 1. Provider Factory & Fallback Handling ---');
  const providers = await aiProviderFactory.getProvidersStatus();
  assert(providers.length >= 3, 'Factory lists OpenRouter, OpenAI-Compatible, and Offline providers');

  const offline = aiProviderFactory.getFallbackProvider();
  assert(offline && offline.getProviderName().includes('Offline'), 'Guaranteed offline fallback provider is registered');

  const activeProvider = await aiProviderFactory.getPrimaryProvider();
  assert(activeProvider !== null, `Primary provider resolved: "${activeProvider.getProviderName()}"`);

  // --- 2. Natural Language Understanding (NLU) & Intents ---
  console.log('\n--- 2. Natural Language Understanding (NLU) ---');
  const analysis1 = nluService.analyze('Tell me about PM-KISAN scheme', 'en');
  assert(analysis1.intent === 'SCHEME_OVERVIEW', 'Identified SCHEME_OVERVIEW intent for "Tell me about PM-KISAN"');
  assert(analysis1.identifiedSchemeSlug === 'pm-kisan-samman-nidhi', 'Resolved scheme slug "pm-kisan-samman-nidhi"');

  const analysis2 = nluService.analyze('Who is eligible for Gruha Lakshmi?', 'en');
  assert(analysis2.intent === 'ELIGIBILITY_CRITERIA', 'Identified ELIGIBILITY_CRITERIA intent');
  assert(analysis2.identifiedSchemeSlug === 'gruha-lakshmi-yojana', 'Resolved scheme slug "gruha-lakshmi-yojana"');

  const analysis3 = nluService.analyze('What documents do I need to apply for Shakti scheme?', 'en');
  assert(analysis3.intent === 'REQUIRED_DOCUMENTS', 'Identified REQUIRED_DOCUMENTS intent');

  // --- 3. Conversation-Aware Context & Follow-Up Questions ---
  console.log('\n--- 3. Multi-Turn Follow-Up Context Resolution ---');
  // Scenario from prompt:
  // User Turn 1: "Tell me about PM-KISAN."
  // Assistant Turn 1: Explains PM-KISAN.
  // User Turn 2: "Who is eligible?"
  const history = [
    { role: 'user', content: 'Tell me about PM-KISAN scheme.' },
    { role: 'assistant', content: 'PM-KISAN provides ₹6,000 yearly to farmer families in three installments.' }
  ];

  const followUpAnalysis = nluService.analyze('Who is eligible?', 'en', history);
  assert(followUpAnalysis.isFollowUp === true, 'Detected that "Who is eligible?" is an elliptic follow-up query');
  assert(followUpAnalysis.activeSchemeContext === 'pm-kisan-samman-nidhi',
    'Inherited active scheme context "pm-kisan-samman-nidhi" from conversation history');

  // End-to-end follow-up response generation
  const followUpResult = await aiService.processMessage('Who is eligible?', {
    language: 'en',
    history
  });
  assert(followUpResult.reply.toLowerCase().includes('kisan') || followUpResult.reply.toLowerCase().includes('farmer'),
    'Follow-up answer is grounded in PM-KISAN criteria (mentions farmer/kisan)');
  assert(followUpResult.suggestedSchemes.some(s => s.slug === 'pm-kisan-samman-nidhi'),
    'Suggested schemes include PM-KISAN for the follow-up turn');

  // Second follow-up: "What documents do I need?"
  const historyTurn2 = [
    ...history,
    { role: 'user', content: 'Who is eligible?' },
    { role: 'assistant', content: followUpResult.reply }
  ];
  const docFollowUp = await aiService.processMessage('What documents do I need?', {
    language: 'en',
    history: historyTurn2
  });
  assert(docFollowUp.reply.toLowerCase().includes('document') || docFollowUp.reply.toLowerCase().includes('aadhaar'),
    'Documents follow-up explains required documents specifically for active scheme');

  // --- 4. Multi-Lingual Generation (Kannada, English, Hindi) ---
  console.log('\n--- 4. Multi-Lingual Generation (Kannada, English, Hindi) ---');
  // 4a. Kannada
  const knResult = await aiService.processMessage('ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಯ ಬಗ್ಗೆ ತಿಳಿಸಿ', { language: 'kn' });
  assert(knResult.language === 'kn', 'Detected Kannada language');
  assert(/[\u0C80-\u0CFF]/.test(knResult.reply), 'Response generated in native Kannada Unicode script');
  assert(knResult.reply.includes('ಗೃಹ ಲಕ್ಷ್ಮಿ') || knResult.reply.includes('2,000'), 'Kannada reply contains accurate Gruha Lakshmi details');

  // 4b. English
  const enResult = await aiService.processMessage('Explain Shakti bus scheme benefits in Karnataka', { language: 'en' });
  assert(enResult.language === 'en', 'Detected English language');
  assert(enResult.reply.includes('Shakti') || enResult.reply.includes('bus'), 'English reply contains Shakti scheme details');

  // 4c. Hindi
  const hiResult = await aiService.processMessage('पीएम किसान योजना क्या है?', { language: 'hi' });
  assert(hiResult.language === 'hi', 'Detected Hindi language');
  assert(/[\u0900-\u097F]/.test(hiResult.reply), 'Response generated in native Hindi Devanagari script');

  // --- 5. Configurable Response Length ---
  console.log('\n--- 5. Configurable Response Length (Concise, Standard, Detailed) ---');
  const conciseResult = await aiService.processMessage('Tell me about Ayushman Bharat', {
    language: 'en',
    responseLength: 'concise'
  });
  const detailedResult = await aiService.processMessage('Tell me about Ayushman Bharat', {
    language: 'en',
    responseLength: 'detailed'
  });
  assert(conciseResult.reply.length < detailedResult.reply.length,
    `Concise length (${conciseResult.reply.length} chars) is shorter than detailed (${detailedResult.reply.length} chars)`);

  // --- 6. Speech Formatting & Pronunciation ---
  console.log('\n--- 6. Speech Phonetic Normalization & Currency ---');
  const sampleWithRupees = 'Beneficiaries receive ₹2,000 per month under PM-KISAN.';
  const spokenEn = responseFormatter.formatForSpeech(sampleWithRupees, 'en');
  assert(spokenEn.includes('2,000 rupees') && !spokenEn.includes('₹'), 'Replaced ₹ with phonetic "rupees" in English');

  const knSample = 'ಮಾಸಿಕ ₹2,000 ಹಣ ಸಹಾಯ.';
  const spokenKn = responseFormatter.formatForSpeech(knSample, 'kn');
  assert(spokenKn.includes('ರೂಪಾಯಿಗಳು'), 'Replaced ₹ with phonetic "ರೂಪಾಯಿಗಳು" in Kannada');

  // --- 7. Streaming Token Generation ---
  console.log('\n--- 7. Streaming Token Generation ---');
  let streamedTokens = [];
  const streamResult = await aiService.streamMessage(
    'What is Yuva Nidhi scheme?',
    { language: 'en' },
    (token) => {
      streamedTokens.push(token);
    }
  );
  assert(streamedTokens.length > 0, `Streamed ${streamedTokens.length} tokens via token callback`);
  assert(streamResult.reply.length > 0, 'Stream finished with full reply object');

  console.log('\n====================================================');
  console.log(`TOTAL AI ENGINE TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
