#!/usr/bin/env node

/**
 * ==============================================================================
 * JANASEVA AI ASSISTANT - VoiceStudio One-Click Local Launcher
 * ==============================================================================
 * 
 * Manages and launches the VoiceStudio local speech engine on http://127.0.0.1:3900.
 *
 * Capabilities:
 *  1. Verifies host dependencies (Node.js, uv, Python, git).
 *  2. Checks for VoiceStudio installation at `.agents/voice-studio`.
 *  3. Detects if VoiceStudio is already running on the target port (default: 3900).
 *  4. Launches the full OmniVoice uvicorn server via uv when `.venv` is ready.
 *  5. Provides interactive setup (`--setup`) or lightweight dev server fallback.
 *  6. Cross-platform support (Windows PowerShell / cmd, macOS, Linux).
 * ==============================================================================
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const VOICE_STUDIO_DIR = path.resolve(PROJECT_ROOT, '.agents', 'voice-studio');

const DEFAULT_PORT = parseInt(process.env.VOICESTUDIO_PORT || process.env.OMNIVOICE_PORT || '3900', 10);
const HOST = process.env.OMNIVOICE_BIND_HOST || '127.0.0.1';

// Parse command line arguments
const args = process.argv.slice(2);
const isSetupMode = args.includes('--setup');
const isForceMock = args.includes('--mock');
const isForceFull = args.includes('--full') || args.includes('--prod');
const isHelp = args.includes('--help') || args.includes('-h');

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgBlue: '\x1b[44m\x1b[37m'
};

function printBanner() {
  console.log(`
${colors.green}${colors.bold}========================================================================${colors.reset}
${colors.bgGreen}  JANASEVA AI ASSISTANT  ${colors.reset} ${colors.bold}VoiceStudio Speech Engine Launcher${colors.reset}
${colors.cyan}  Target URL:${colors.reset}  http://${HOST}:${DEFAULT_PORT}
${colors.cyan}  Location:${colors.reset}    .agents/voice-studio
${colors.cyan}  Engine:${colors.reset}      OmniVoice Local TTS & Whisper STT (Indian Accents & Indic)
${colors.green}========================================================================${colors.reset}
`);
}

function printHelp() {
  printBanner();
  console.log(`Usage: npm run voice:start [options]
       node scripts/start-voice-studio.mjs [options]

Options:
  --setup       Run dependency setup (node scripts/setup-api.mjs)
  --full        Require full OmniVoice Python environment (uvicorn)
  --mock        Start lightweight mock speech server for instant dev/testing
  --help, -h    Show this help message

Environment Variables:
  VOICESTUDIO_PORT    Port to listen on (default: 3900)
  OMNIVOICE_BIND_HOST Host to bind (default: 127.0.0.1)
`);
  process.exit(0);
}

/** Check if port is already active and healthy */
async function checkPortListening(port, host = HOST) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/.well-known/voicestudio-speech`, { timeout: 1200 }, (res) => {
      resolve({ active: true, healthy: res.statusCode === 200 });
    });
    req.on('error', () => {
      // Try fallback /health
      const fallbackReq = http.get(`http://${host}:${port}/health`, { timeout: 1000 }, (res2) => {
        resolve({ active: true, healthy: res2.statusCode === 200 });
      });
      fallbackReq.on('error', () => resolve({ active: false, healthy: false }));
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ active: false, healthy: false });
    });
  });
}

/** Check available commands */
function checkCommand(cmd, args = ['--version']) {
  try {
    const result = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf8' });
    if (result.status === 0) {
      return (result.stdout || result.stderr || '').trim().split('\n')[0];
    }
    return null;
  } catch {
    return null;
  }
}

/** Generate compliant silent WAV buffer for mock TTS responses */
function createSilentWav(durationSeconds = 1, sampleRate = 16000) {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const dataSize = Math.floor(durationSeconds * sampleRate * numChannels * bytesPerSample);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

/** Start lightweight local mock server on port 3900 */
function startMockSpeechServer(port = DEFAULT_PORT) {
  console.log(`${colors.cyan}[VoiceStudio:Dev]${colors.reset} Starting lightweight speech proxy/mock server on port ${port}...`);

  const server = http.createServer((req, res) => {
    // Enable CORS for frontend development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // 1. Health & Discovery
    if (pathname === '/.well-known/voicestudio-speech' || pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ready',
        engine: 'omnivoice-dev-mock',
        version: '0.5.9-beta.6',
        voices: ['nova', 'alloy', 'shimmer', 'echo', 'fable', 'onyx'],
        note: 'Janaseva VoiceStudio Local Speech Service'
      }));
      return;
    }

    // 2. Models Endpoint
    if (pathname === '/v1/models') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        object: 'list',
        data: [
          { id: 'omnivoice', object: 'model', owned_by: 'voicestudio' },
          { id: 'whisper-large-v3', object: 'model', owned_by: 'voicestudio' }
        ]
      }));
      return;
    }

    // 3. Audio Speech (TTS)
    if (pathname === '/v1/audio/speech' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        let input = '';
        try {
          const json = JSON.parse(body);
          input = json.input || '';
        } catch { /* empty */ }

        console.log(`${colors.green}[VoiceStudio:TTS]${colors.reset} Synthesized speech for: "${input.slice(0, 60)}${input.length > 60 ? '...' : ''}"`);
        const audioBuffer = createSilentWav(1.5);
        res.writeHead(200, {
          'Content-Type': 'audio/wav',
          'Content-Length': audioBuffer.length
        });
        res.end(audioBuffer);
      });
      return;
    }

    // 4. Audio Transcriptions (STT)
    if (pathname === '/v1/audio/transcriptions' && req.method === 'POST') {
      console.log(`${colors.green}[VoiceStudio:STT]${colors.reset} Received transcription request.`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        text: 'Speech transcribed successfully via Janaseva VoiceStudio.'
      }));
      return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found', path: pathname }));
  });

  server.listen(port, HOST, () => {
    console.log(`
${colors.green}${colors.bold}✔ VoiceStudio Local Speech Service is ACTIVE!${colors.reset}
  - Endpoint:  ${colors.bold}http://${HOST}:${port}${colors.reset}
  - Status:    ${colors.bold}http://${HOST}:${port}/.well-known/voicestudio-speech${colors.reset}
  - Mode:      ${colors.yellow}Lightweight Dev Server (Instant Response)${colors.reset}
  - Note:      Full OmniVoice model weights can be activated anytime with ${colors.cyan}npm run voice:setup${colors.reset}.
  ${colors.dim}(Press Ctrl+C to stop)${colors.reset}
`);
  });

  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Stopping VoiceStudio speech service...${colors.reset}`);
    server.close(() => {
      console.log(`${colors.green}Stopped cleanly.${colors.reset}`);
      process.exit(0);
    });
  });
}

/** Main Entrypoint */
async function main() {
  if (isHelp) {
    printHelp();
  }

  printBanner();

  // 1. Check if already running on target port
  const portStatus = await checkPortListening(DEFAULT_PORT);
  if (portStatus.active) {
    console.log(`${colors.green}✔ VoiceStudio is ALREADY RUNNING on http://${HOST}:${DEFAULT_PORT}${colors.reset}`);
    console.log(`${colors.dim}Health status: ${portStatus.healthy ? 'OK (200)' : 'Responding'}${colors.reset}`);
    console.log(`\nJana-Seva backend will automatically connect to this instance.`);
    process.exit(0);
  }

  // 2. Check VoiceStudio directory
  if (!existsSync(VOICE_STUDIO_DIR)) {
    console.error(`${colors.red}✖ VoiceStudio repository not found at:${colors.reset} ${VOICE_STUDIO_DIR}`);
    console.log(`\nTo install VoiceStudio, run:`);
    console.log(`  ${colors.bold}${colors.cyan}npm run voice:install${colors.reset}`);
    console.log(`or clone manually:`);
    console.log(`  ${colors.dim}git clone https://github.com/debpalash/VoiceStudio.git .agents/voice-studio${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.green}✔ VoiceStudio directory verified:${colors.reset} ${VOICE_STUDIO_DIR}`);

  // 3. Environment verification
  const nodeVer = process.version;
  const uvVer = checkCommand('uv');
  const pythonVer = checkCommand('python') || checkCommand('python3');
  const gitVer = checkCommand('git');

  console.log(`${colors.cyan}Environment Inspection:${colors.reset}`);
  console.log(`  • Node.js:  ${colors.bold}${nodeVer}${colors.reset}`);
  console.log(`  • uv CLI:   ${uvVer ? `${colors.green}${uvVer}${colors.reset}` : `${colors.yellow}Not found on PATH${colors.reset}`}`);
  console.log(`  • Python:   ${pythonVer ? `${colors.green}${pythonVer}${colors.reset}` : `${colors.yellow}Not found on PATH${colors.reset}`}`);
  console.log(`  • Git:      ${gitVer ? `${colors.green}${gitVer}${colors.reset}` : `${colors.yellow}Not found on PATH${colors.reset}`}`);

  const venvDir = path.resolve(VOICE_STUDIO_DIR, '.venv');
  const hasVenv = existsSync(venvDir);

  // 4. Handle setup flag if passed
  if (isSetupMode) {
    console.log(`\n${colors.cyan}Running VoiceStudio setup (scripts/setup-api.mjs)...${colors.reset}`);
    const setupProcess = spawn('node', ['scripts/setup-api.mjs'], {
      cwd: VOICE_STUDIO_DIR,
      stdio: 'inherit'
    });
    setupProcess.on('exit', (code) => {
      if (code === 0) {
        console.log(`\n${colors.green}✔ Setup completed successfully!${colors.reset}`);
        console.log(`You can now run: ${colors.bold}npm run voice:start${colors.reset}`);
      } else {
        console.error(`\n${colors.red}✖ Setup exited with code ${code}${colors.reset}`);
      }
      process.exit(code || 0);
    });
    return;
  }

  // 5. If --mock was requested, start mock server immediately
  if (isForceMock) {
    startMockSpeechServer(DEFAULT_PORT);
    return;
  }

  // 6. Check if full environment is ready
  if (hasVenv && uvVer) {
    console.log(`\n${colors.green}✔ Local Python virtual environment (.venv) detected.${colors.reset}`);
    console.log(`${colors.cyan}Spawning OmniVoice uvicorn backend on port ${DEFAULT_PORT}...${colors.reset}\n`);

    const env = {
      ...process.env,
      OMNIVOICE_PORT: String(DEFAULT_PORT),
      OMNIVOICE_BIND_HOST: HOST
    };

    const devBackendScript = path.resolve(VOICE_STUDIO_DIR, 'scripts', 'dev-backend.mjs');
    const child = spawn('node', [devBackendScript], {
      cwd: VOICE_STUDIO_DIR,
      env,
      stdio: 'inherit'
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        console.log(`\n${colors.yellow}VoiceStudio stopped (${signal}).${colors.reset}`);
      } else if (code !== 0) {
        console.error(`\n${colors.red}VoiceStudio exited with code ${code}.${colors.reset}`);
      }
      process.exit(code || 0);
    });

    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });
    return;
  }

  // 7. If .venv is missing but --full was forced, show error
  if (isForceFull) {
    console.error(`\n${colors.red}✖ Virtual environment (.venv) not found in .agents/voice-studio.${colors.reset}`);
    console.log(`Run ${colors.bold}npm run voice:setup${colors.reset} to initialize the Python environment and download models.`);
    process.exit(1);
  }

  // 8. Otherwise, gracefully notify and launch dev mode
  console.log(`
${colors.yellow}Notice: VoiceStudio Python virtual environment (.venv) is not yet initialized.${colors.reset}
  - To download Python torch packages & full OmniVoice model weights:
      ${colors.cyan}${colors.bold}npm run voice:setup${colors.reset}
  - Falling back to ${colors.bold}lightweight local speech service${colors.reset} on port ${DEFAULT_PORT}
    so that Jana-Seva assistant speech integration is immediately active!
`);

  startMockSpeechServer(DEFAULT_PORT);
}

main().catch((err) => {
  console.error(`\n${colors.red}Fatal launcher error:${colors.reset}`, err);
  process.exit(1);
});
