import axios from 'axios';

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'female' | 'male';
  accent: string;
  languageSupport: string[];
  description: string;
  isDefault?: boolean;
}

export interface VoiceStudioStatus {
  online: boolean;
  serviceUrl?: string;
  engine?: string;
  version?: string;
  voices?: string[];
  models?: string[];
  latencyMs?: number;
  lastChecked?: string;
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  isSynthesizing: boolean;
  currentMessageId: string | null;
  voiceUsed: string | null;
  volumeLevel: number;
}

export interface MicrophonePermissionResult {
  state: 'granted' | 'denied' | 'prompt' | 'unsupported';
  error?: string;
  userGuidance?: string;
}

class VoiceStudioService {
  private activeAudio: HTMLAudioElement | null = null;
  private activeStream: MediaStream | null = null;
  private activeMediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private activeObjectUrls = new Set<string>();
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private currentPlayingId: string | null = null;
  private stateChangeListeners = new Set<(state: AudioPlaybackState) => void>();

  private cachedVoices: VoiceProfile[] | null = null;
  private cachedHealth: VoiceStudioStatus | null = null;
  private lastHealthCheck = 0;

  /**
   * Safe discovery of VoiceStudio engine health and status
   */
  public async getStatus(forceRefresh = false): Promise<VoiceStudioStatus> {
    const now = Date.now();
    if (!forceRefresh && this.cachedHealth && (now - this.lastHealthCheck < 10000)) {
      return this.cachedHealth;
    }

    try {
      const res = await axios.get('/api/voice/status', { timeout: 3500 });
      const data = res.data;
      this.cachedHealth = {
        online: !!data.online,
        serviceUrl: data.serviceUrl,
        engine: data.engine,
        version: data.version,
        voices: data.voices || [],
        models: data.models || [],
        latencyMs: data.latencyMs,
        lastChecked: new Date().toISOString()
      };
      this.lastHealthCheck = now;
      return this.cachedHealth;
    } catch {
      this.cachedHealth = {
        online: false,
        lastChecked: new Date().toISOString()
      };
      this.lastHealthCheck = now;
      return this.cachedHealth;
    }
  }

  /**
   * Dynamically fetch available Indian female and engine voice profiles
   */
  public async getVoiceProfiles(): Promise<VoiceProfile[]> {
    if (this.cachedVoices) return this.cachedVoices;

    try {
      const res = await axios.get('/api/voice/profiles', { timeout: 4000 });
      const profiles = res.data?.profiles || [];
      this.cachedVoices = profiles;
      return profiles;
    } catch {
      return [
        {
          id: 'kavya-indic',
          name: 'Kavya (Primary Indian Female Voice)',
          gender: 'female',
          accent: 'Indian English & Indic Warm Conversational',
          languageSupport: ['kn', 'en', 'hi', 'te', 'ta', 'ml', 'mr', 'bn', 'gu'],
          description: 'Natural, warm, polite tone tailored for Indian civic welfare and citizen support.',
          isDefault: true
        },
        {
          id: 'priya-in',
          name: 'Priya (Professional Public Service)',
          gender: 'female',
          accent: 'Clear Indian Formal Accent',
          languageSupport: ['en', 'hi', 'kn', 'mr', 'bn'],
          description: 'Clear, crisp, authoritative yet empathetic public administration voice.'
        },
        {
          id: 'neerja-in',
          name: 'Neerja (Empathetic Elder Sister)',
          gender: 'female',
          accent: 'Gentle Indian Accent',
          languageSupport: ['kn', 'hi', 'en', 'te', 'ta'],
          description: 'Patient and encouraging voice recommended for elderly citizens and rural beneficiaries.'
        },
        {
          id: 'nova-in',
          name: 'Nova (Modern Expressive)',
          gender: 'female',
          accent: 'Modern Pan-Indian Accent',
          languageSupport: ['en', 'hi', 'kn'],
          description: 'Modern, dynamic speech synthesis profile with high clarity across technical names.'
        }
      ];
    }
  }

  /**
   * Check and verify microphone permission status before initiating capture
   */
  public async checkMicrophonePermission(): Promise<MicrophonePermissionResult> {
    if (!navigator.permissions || !navigator.permissions.query) {
      return { state: 'prompt' };
    }

    try {
      const perm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (perm.state === 'denied') {
        return {
          state: 'denied',
          error: 'Microphone permission blocked',
          userGuidance: 'Please enable microphone access in your browser settings or click the lock/settings icon in the URL bar.'
        };
      }
      return { state: perm.state as 'granted' | 'denied' | 'prompt' };
    } catch {
      return { state: 'prompt' };
    }
  }

  /**
   * Request microphone stream with error mapping and automatic resource tracking
   */
  public async acquireMicrophoneStream(): Promise<{ stream: MediaStream | null; error?: string }> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        stream: null,
        error: 'Voice input is not supported in this browser environment. Please use modern Chrome, Edge, Firefox, or Safari.'
      };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      this.activeStream = stream;
      return { stream };
    } catch (err: any) {
      let message = 'Unable to access microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Microphone permission was denied. Please allow microphone access in your browser to speak.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No microphone device was detected on your computer or mobile device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Your microphone is currently in use by another software application.';
      } else if (err.name === 'SecurityError') {
        message = 'Microphone recording requires a secure HTTPS connection or localhost.';
      }
      return { stream: null, error: message };
    }
  }

  /**
   * Synthesize text to speech using VoiceStudio engine with intelligent fallback
   */
  public async speakText(
    messageId: string,
    text: string,
    language: 'en' | 'kn' | 'hi' = 'en',
    voice = 'kavya-indic',
    onComplete?: () => void
  ): Promise<boolean> {
    // 1. If currently speaking this message, toggle stop
    if (this.currentPlayingId === messageId) {
      this.stopAllAudio();
      return false;
    }

    this.stopAllAudio();
    this.currentPlayingId = messageId;
    this.notifyStateChange({
      isPlaying: true,
      isSynthesizing: true,
      currentMessageId: messageId,
      voiceUsed: voice,
      volumeLevel: 0
    });

    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    // 2. Try VoiceStudio server first
    try {
      const res = await axios.post('/api/voice/tts', {
        text: cleanText,
        language,
        voice
      }, {
        responseType: 'blob',
        timeout: 22000
      });

      if (res.data && res.data.size > 0) {
        const audioUrl = URL.createObjectURL(res.data);
        this.activeObjectUrls.add(audioUrl);

        const audio = new Audio(audioUrl);
        this.activeAudio = audio;

        this.notifyStateChange({
          isPlaying: true,
          isSynthesizing: false,
          currentMessageId: messageId,
          voiceUsed: voice,
          volumeLevel: 0.5
        });

        audio.onended = () => {
          this.cleanupPlayback(audioUrl);
          onComplete?.();
        };

        audio.onerror = () => {
          this.cleanupPlayback(audioUrl);
          this.fallbackWebSpeech(messageId, cleanText, language, onComplete);
        };

        await audio.play();
        return true;
      }
    } catch {
      // VoiceStudio failed or timed out: fall back gracefully
    }

    // 3. Fallback: Browser Web Speech API with Indian Female Voice
    return this.fallbackWebSpeech(messageId, cleanText, language, onComplete);
  }

  /**
   * Browser SpeechSynthesis fallback with tuned Indian female voice attributes
   */
  private fallbackWebSpeech(
    messageId: string,
    text: string,
    language: 'en' | 'kn' | 'hi',
    onComplete?: () => void
  ): boolean {
    if (!('speechSynthesis' in window)) {
      this.cleanupPlayback();
      return false;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.94; // Calm, respectful pace
    utterance.pitch = 1.06; // Pleasant female pitch

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => {
      const vLang = v.lang.toLowerCase();
      const vName = v.name.toLowerCase();
      const isTargetLang = vLang.startsWith(language);
      const isFemale = ['heera', 'neerja', 'priya', 'kavya', 'veena', 'zira', 'female'].some(f => vName.includes(f));
      return isTargetLang && (vLang.includes('in') || isFemale);
    }) || voices.find(v => v.lang.toLowerCase().startsWith(language));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      this.cleanupPlayback();
      onComplete?.();
    };

    utterance.onerror = () => {
      this.cleanupPlayback();
    };

    this.notifyStateChange({
      isPlaying: true,
      isSynthesizing: false,
      currentMessageId: messageId,
      voiceUsed: femaleVoice?.name || 'Browser Voice',
      volumeLevel: 0.5
    });

    window.speechSynthesis.speak(utterance);
    return true;
  }

  /**
   * Transcribe recorded audio blob via VoiceStudio Whisper STT
   */
  public async transcribeAudio(
    audioBlob: Blob,
    language: 'en' | 'kn' | 'hi' = 'en'
  ): Promise<{ text: string; confidence: number } | null> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const audioBase64 = window.btoa(binary);

      const res = await axios.post('/api/voice/stt', {
        audioBase64,
        language,
        mimeType: audioBlob.type || 'audio/webm'
      }, {
        timeout: 25000
      });

      if (res.data?.success && res.data.text) {
        return {
          text: res.data.text,
          confidence: res.data.confidence || 0.95
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Full Audio and Resource Cleanup
   * Cancels active playback, resets HTML5 audio, closes audio contexts, revokes Object URLs,
   * and terminates active microphone tracks to prevent memory leaks and stuck microphone icons.
   */
  public stopAllAudio(): void {
    // 1. Pause and reset active HTML5 Audio
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.src = '';
      } catch {}
      this.activeAudio = null;
    }

    // 2. Cancel SpeechSynthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // 3. Revoke all Object URLs to release browser memory
    for (const url of this.activeObjectUrls) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    this.activeObjectUrls.clear();

    // 4. Terminate microphone tracks
    if (this.activeStream) {
      try {
        this.activeStream.getTracks().forEach(track => track.stop());
      } catch {}
      this.activeStream = null;
    }

    if (this.activeMediaRecorder && this.activeMediaRecorder.state === 'recording') {
      try {
        this.activeMediaRecorder.stop();
      } catch {}
      this.activeMediaRecorder = null;
    }

    // 5. Reset playing ID and notify
    this.currentPlayingId = null;
    this.notifyStateChange({
      isPlaying: false,
      isSynthesizing: false,
      currentMessageId: null,
      voiceUsed: null,
      volumeLevel: 0
    });
  }

  private cleanupPlayback(urlToRevoke?: string) {
    if (urlToRevoke && this.activeObjectUrls.has(urlToRevoke)) {
      try {
        URL.revokeObjectURL(urlToRevoke);
        this.activeObjectUrls.delete(urlToRevoke);
      } catch {}
    }
    this.currentPlayingId = null;
    this.notifyStateChange({
      isPlaying: false,
      isSynthesizing: false,
      currentMessageId: null,
      voiceUsed: null,
      volumeLevel: 0
    });
  }

  public subscribeState(listener: (state: AudioPlaybackState) => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  private notifyStateChange(state: AudioPlaybackState) {
    for (const listener of this.stateChangeListeners) {
      try {
        listener(state);
      } catch {}
    }
  }
}

export const voiceStudioService = new VoiceStudioService();
