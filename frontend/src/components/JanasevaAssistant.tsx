import React, { useState, useRef, useEffect } from 'react';
import {
  X, Send, Bot, Sparkles, User, ExternalLink,
  Mic, MicOff, Volume2, VolumeX, Trash2, Download,
  Eye, CheckCircle2, RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface JanasevaAssistantProps {
  onViewSchemeDetails?: (schemeIdOrSlug: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedSchemes?: Array<{ id: string; name: string; category: string; slug: string; officialWebsite: string }>;
  timestamp: string;
  modelUsed?: string;
}

export const JanasevaAssistant: React.FC<JanasevaAssistantProps> = ({ onViewSchemeDetails }) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [voiceStudioOnline, setVoiceStudioOnline] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const speechSilenceTimerRef = useRef<any>(null);
  const transcriptBufferRef = useRef<string>('');
  const inputRef = useRef<string>('');

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // Contextual speech recognition correction for Indian civic terms
  const correctSpeechMistakes = (raw: string): string => {
    let text = raw;
    const rules: [RegExp, string][] = [
      [/\bgrammar\s+panchayat\b/gi, 'Gram Panchayat'],
      [/\bpanchyaksham\b/gi, 'Panchayat'],
      [/\bpanchayath\b/gi, 'Panchayat'],
      [/\bgruha\s+laxmi\b/gi, 'Gruha Lakshmi'],
      [/\bgriha\s+lakshmi\b/gi, 'Gruha Lakshmi'],
      [/\bgriha\s+laxmi\b/gi, 'Gruha Lakshmi'],
      [/\bgruhalakshmi\b/gi, 'Gruha Lakshmi'],
      [/\bgrihalakshmi\b/gi, 'Gruha Lakshmi'],
      [/\baayushman\b/gi, 'Ayushman Bharat'],
      [/\bayushman\s+card\b/gi, 'Ayushman Bharat Card'],
      [/\bayushman(?!\s+bharat)\b/gi, 'Ayushman Bharat'],
      [/\bpm\s+kissan\b/gi, 'PM-KISAN'],
      [/\bpmkisan\b/gi, 'PM-KISAN'],
      [/\bpm\s+kisan\s+yojana\b/gi, 'PM-KISAN'],
      [/\bshakti\s+scheme\s+bus\b/gi, 'Shakti Scheme'],
      [/\bshakthi\s+scheme\b/gi, 'Shakti Scheme'],
      [/\bshakthi\s+bus\b/gi, 'Shakti Scheme'],
      [/\bssp\s+scholarship\s+portal\b/gi, 'SSP Scholarship'],
      [/\bssp\s+post\s+matric\b/gi, 'SSP Post-Matric Scholarship'],
      [/\bssp\s+pre\s+matric\b/gi, 'SSP Pre-Matric Scholarship'],
      [/\byuvanidhi\b/gi, 'Yuva Nidhi'],
      [/\byuva\s+nidhi\s+yojana\b/gi, 'Yuva Nidhi'],
      [/\bannabhagya\b/gi, 'Anna Bhagya'],
      [/\banna\s+bhagya\s+rice\b/gi, 'Anna Bhagya'],
      [/\bgruha\s+jyothi\b/gi, 'Gruha Jyoti'],
      [/\bgriha\s+jyoti\b/gi, 'Gruha Jyoti'],
      [/\bgruhajyothi\b/gi, 'Gruha Jyoti'],
      [/\bration\s+card\s+bpl\b/gi, 'BPL Ration Card'],
      [/\baadhar\b/gi, 'Aadhaar'],
      [/\badhar\b/gi, 'Aadhaar']
    ];
    for (const [pattern, replacement] of rules) {
      text = text.replace(pattern, replacement);
    }
    return text;
  };

  const getWelcomeText = () => {
    if (language === 'kn') {
      return "👋 ಜನಸೇವಾ ಎಐ ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ\n\nಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ರಾಜ್ಯದ ಕಲ್ಯಾಣ ಕಾರ್ಯಕ್ರಮಗಳ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಪ್ರಮಾಣಪತ್ರಗಳು, ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಮತ್ತು ಅರ್ಜಿ ವಿಧಾನಗಳ ಕುರಿತು ಮಾಹಿತಿ ಪಡೆಯಿರಿ.\n\nಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?";
    }
    if (language === 'hi') {
      return "👋 जनसेवा एआई सहायक में आपका स्वागत है\n\nकेंद्र और कर्नाटक राज्य के कल्याणकारी कार्यक्रमों की सरकारी योजनाओं, प्रमाणपत्रों, पात्रता मानदंडों और आवेदन प्रक्रियाओं के बारे में जानकारी प्राप्त करें।\n\nआज मैं आपकी क्या सहायता कर सकता हूँ?";
    }
    return "👋 Welcome to Janaseva AI Assistant\n\nGet information about government schemes, certificates, eligibility criteria, and application procedures for Central and Karnataka state welfare programs.\n\nHow may I assist you today?";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-01',
      sender: 'assistant',
      text: getWelcomeText(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update initial message if language changes and only welcome message exists
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome-01') {
        return [{
          id: 'welcome-01',
          sender: 'assistant',
          text: getWelcomeText(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Initialize Speech Recognition with Continuous Capture & Smart Silence Detection
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript + ' ';
          } else {
            interimChunk += item[0].transcript;
          }
        }

        if (finalChunk) {
          transcriptBufferRef.current = (transcriptBufferRef.current + ' ' + finalChunk).trim();
        }

        const combinedText = (transcriptBufferRef.current + (interimChunk ? ' ' + interimChunk : '')).trim();
        const corrected = correctSpeechMistakes(combinedText);
        setInput(corrected);

        // Smart pause detection: 2.5 seconds of silence after complete speech
        if (speechSilenceTimerRef.current) {
          clearTimeout(speechSilenceTimerRef.current);
        }

        if (transcriptBufferRef.current.trim().length > 0) {
          speechSilenceTimerRef.current = setTimeout(() => {
            const completeSentence = transcriptBufferRef.current.trim();
            if (completeSentence) {
              if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch {}
              }
              setIsListening(false);
              transcriptBufferRef.current = '';
              handleSend(completeSentence);
            }
          }, 2500);
        }
      };

      recognition.onerror = () => {
        if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAllAudio();
    };
  }, []);

  // Check VoiceStudio local server status
  useEffect(() => {
    let isMounted = true;
    const checkVoiceStatus = async () => {
      try {
        const res = await api.getVoiceStudioStatus();
        if (isMounted) {
          setVoiceStudioOnline(Boolean(res.online));
        }
      } catch {
        if (isMounted) setVoiceStudioOnline(false);
      }
    };

    checkVoiceStatus();
    const timer = setInterval(checkVoiceStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isOpen]);

  // Stop any active audio (VoiceStudio player or browser speechSynthesis)
  const stopAllAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setIsSynthesizing(false);
  };

  // Update speech recognition language when platform language changes
  useEffect(() => {
    if (recognitionRef.current) {
      const langCode = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.lang = langCode;
    }
  }, [language]);

  const toggleListening = async () => {
    // 1. If SpeechRecognition is supported in browser, use continuous real-time capture
    if (recognitionRef.current) {
      if (isListening) {
        if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
        try { recognitionRef.current.stop(); } catch {}
        setIsListening(false);
        const sentenceToSend = (transcriptBufferRef.current || inputRef.current).trim();
        transcriptBufferRef.current = '';
        if (sentenceToSend) {
          handleSend(sentenceToSend);
        }
      } else {
        try {
          transcriptBufferRef.current = '';
          const langCode = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
          recognitionRef.current.lang = langCode;
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
      }
      return;
    }

    // 2. MediaRecorder fallback for VoiceStudio Whisper STT
    if (isRecordingAudio) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingAudio(false);
    } else {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 0) {
            setLoading(true);
            const transcribed = await api.transcribeSpeechVoiceStudio(audioBlob, language);
            setLoading(false);
            if (transcribed && transcribed.trim()) {
              const corrected = correctSpeechMistakes(transcribed.trim());
              setInput(corrected);
              handleSend(corrected);
            }
          }
        };

        mediaRecorder.start();
        setIsRecordingAudio(true);
      } catch (err) {
        console.warn('Microphone error:', err);
        setIsRecordingAudio(false);
      }
    }
  };

  // Pre-load and cache browser voices for accurate Indian female voice selection
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Helper to match an authentic Indian female voice from available speech engines
  const getIndianFemaleVoice = (lang: 'en' | 'kn' | 'hi'): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const targetCode = lang === 'kn' ? 'kn' : lang === 'hi' ? 'hi' : 'en';
    const femaleNames = ['heera', 'neerja', 'swara', 'kalpana', 'sapna', 'priya', 'kavya', 'raveena', 'zira', 'female'];

    // 1. Try Indian female voice matching target language
    const match = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      const vName = v.name.toLowerCase();
      const isTargetLang = vLang.startsWith(targetCode);
      const isIndian = vLang.includes('in') || vName.includes('india') || vName.includes('hindi') || vName.includes('kannada');
      const isFemale = femaleNames.some(f => vName.includes(f));
      return isTargetLang && (isIndian || isFemale);
    });
    if (match) return match;

    // 2. Try any voice matching target language
    const langMatch = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(targetCode));
    if (langMatch) return langMatch;

    // 3. Fallback to Indian English female voice (Heera / Neerja / English India)
    const indianFallback = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      const vName = v.name.toLowerCase();
      return (vLang.includes('en-in') || vName.includes('india')) && femaleNames.some(f => vName.includes(f));
    });

    return indianFallback || null;
  };

  // Text-to-Speech handler: VoiceStudio AI speech with Web Speech fallback (Indian Female Voice)
  const handleSpeak = async (messageId: string, text: string, langOverride?: 'en' | 'kn' | 'hi') => {
    const speakLang = langOverride || language;
    if (speakingMessageId === messageId) {
      stopAllAudio();
      return;
    }

    stopAllAudio();

    // 1. VoiceStudio Local AI Speech Engine (High Fidelity Neural Audio - Indian Female Voice)
    if (voiceStudioOnline) {
      setSpeakingMessageId(messageId);
      setIsSynthesizing(true);
      try {
        const audioBlob = await api.synthesizeSpeechVoiceStudio(text, speakLang, 'nova');
        if (audioBlob) {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;

          audio.onended = () => {
            setSpeakingMessageId(null);
            setIsSynthesizing(false);
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            setSpeakingMessageId(null);
            setIsSynthesizing(false);
            URL.revokeObjectURL(audioUrl);
          };

          setIsSynthesizing(false);
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('[VoiceStudio] Playback failed, falling back to Web Speech:', err);
      } finally {
        setIsSynthesizing(false);
      }
    }

    // 2. Fallback: Browser Web Speech API with Indian Female Voice
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech audio is not supported in your browser.");
      setSpeakingMessageId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speakLang === 'kn' ? 'kn-IN' : speakLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1.08; // Tuned for clear, pleasant female vocal tone

    const femaleVoice = getIndianFemaleVoice(speakLang);
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText?: string) => {
    const rawText = queryText || input;
    if (!rawText.trim() || loading) return;

    const textToSend = correctSpeechMistakes(rawText.trim());

    // Stop ongoing speech & silence timers
    if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
    stopAllAudio();
    transcriptBufferRef.current = '';

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      // Build conversation history (excluding initial welcome message, taking up to last 8 turns)
      const history = messages
        .filter(m => m.id !== 'welcome-01' && (m.sender === 'user' || m.sender === 'assistant'))
        .slice(-8)
        .map(m => ({
          role: m.sender as 'user' | 'assistant',
          content: m.text
        }));

      const res = await api.askChatbot(textToSend, language, history);
      if (res.success) {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: res.reply,
          suggestedSchemes: res.suggestedSchemes,
          modelUsed: res.modelUsed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);

        // Auto-play voice output if enabled
        if (autoSpeak) {
          handleSpeak(botMsg.id, botMsg.text, (res as any).language || language);
        }
      }
    } catch {
      const errorMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: language === 'kn'
          ? "ಕ್ಷಮಿಸಿ, ಪೋರ್ಟಲ್ ಸಹಾಯಕ ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಯೋಜನೆಗಳ ಪಟ್ಟಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಗೃಹ ಲಕ್ಷ್ಮಿ ಅಥವಾ ಪಿಎಂ ಕಿಸಾನ್ ಬಗ್ಗೆ ಕೇಳಿ."
          : language === 'hi'
            ? "क्षमा करें, सहायक सर्वर से जुड़ने में समस्या हुई। कृपया योजना सूची देखें या गृह लक्ष्मी अथवा पीएम-किसान के बारे में पूछें।"
            : "I am having trouble connecting to the portal assistant server. Please check the scheme directory or try asking about Gruha Lakshmi or PM-KISAN.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
    transcriptBufferRef.current = '';
    stopAllAudio();
    setMessages([
      {
        id: 'welcome-01',
        sender: 'assistant',
        text: getWelcomeText(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleClearChat = () => {
    handleNewChat();
  };

  const handleExportChat = () => {
    const formattedTranscript = messages.map(m => {
      const speaker = m.sender === 'user' ? 'Citizen' : 'Janaseva AI Assistant';
      return `[${m.timestamp}] ${speaker}:\n${m.text}\n${m.suggestedSchemes?.map(s => `  - Suggested: ${s.name} (${s.officialWebsite})`).join('\n') || ''}\n`;
    }).join('\n----------------------------------------\n\n');

    const header = `JANASEVA CIVIC WELFARE PORTAL - ASSISTANT TRANSCRIPT\nExported: ${new Date().toLocaleString()}\nLanguage: ${language.toUpperCase()}\n\n========================================\n\n`;
    const fullText = header + formattedTranscript;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `janaseva_assistant_chat_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setCopiedNotification('Chat transcript downloaded!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const quickPrompts = language === 'kn' ? [
    { icon: "📄", label: "ಗೃಹ ಲಕ್ಷ್ಮಿ ದಾಖಲೆಗಳು", query: "ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಗೆ ಯಾವ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?" },
    { icon: "🎓", label: "ಎಸ್‌ಎಸ್‌ಪಿ ವಿದ್ಯಾರ್ಥಿವೇತನ", query: "ಕರ್ನಾಟಕ ಎಸ್‌ಎಸ್‌ಪಿ ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನಕ್ಕೆ ಯಾರು ಅರ್ಹರು?" },
    { icon: "🌾", label: "ಪಿಎಂ ಕಿಸಾನ್ ₹6,000", query: "ಪಿಎಂ ಕಿಸಾನ್ ಯೋಜನೆಯಲ್ಲಿ ನೋಂದಣಿ ಮಾಡುವುದು ಮತ್ತು ಕಂತು ಪಡೆಯುವುದು ಹೇಗೆ?" },
    { icon: "🚌", label: "ಶಕ್ತಿ ಉಚಿತ ಬಸ್", query: "ಶಕ್ತಿ ಯೋಜನೆಯಡಿ ಮಹಿಳೆಯರು ಉಚಿತ ಬಸ್ ಪ್ರಯಾಣ ಪಡೆಯುವುದು ಹೇಗೆ?" },
  ] : language === 'hi' ? [
    { icon: "📄", label: "गृह लक्ष्मी दस्तावेज", query: "गृह लक्ष्मी योजना के लिए आवश्यक दस्तावेज क्या हैं?" },
    { icon: "🎓", label: "एसएसपी छात्रवृत्ति", query: "कर्नाटक एसएसपी पोस्ट-मैट्रिक छात्रवृत्ति के लिए कौन पात्र है?" },
    { icon: "🌾", label: "पीएम-किसान ₹6,000", query: "पीएम-किसान योजना में किस्त कैसे प्राप्त करें?" },
    { icon: "🚌", label: "शक्ति मुफ्त बस", query: "शक्ति योजना के तहत महिलाओं को मुफ्त बस यात्रा कैसे मिलती है?" },
  ] : [
    { icon: "📄", label: "Gruha Lakshmi Docs", query: "What documents are required for Gruha Lakshmi Yojana?" },
    { icon: "🎓", label: "SSP Scholarship", query: "Who is eligible for Karnataka SSP Post-Matric Scholarship?" },
    { icon: "🌾", label: "PM-KISAN ₹6,000", query: "How to register and receive PM-KISAN installment?" },
    { icon: "🚌", label: "Shakti Free Bus", query: "How do women get free bus travel under Shakti Scheme Karnataka?" },
  ];

  // Helper to format assistant message content with clean paragraph & bullet layout
  const renderFormattedMessageText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Bullet points
          if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.replace(/^([•\-\*]\s*)/, '');
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1 text-[11.5px]">
                <span className="text-[#22C55E] font-bold text-xs select-none">•</span>
                <span className="flex-1 text-[#F8FAFC]">{formatBoldText(content)}</span>
              </div>
            );
          }

          // Numbered points (e.g. 1. 2. 3.)
          const numMatch = trimmed.match(/^(\d+[\.\)])\s*(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1 text-[11.5px]">
                <span className="text-[#3B82F6] font-mono font-semibold text-[11px] select-none shrink-0">{numMatch[1]}</span>
                <span className="flex-1 text-[#F8FAFC]">{formatBoldText(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs text-[#F8FAFC]">
              {formatBoldText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to parse **bold** fragments safely
  const formatBoldText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-[#F8FAFC] font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 bg-[#121826]/95 hover:bg-[#161D2E] backdrop-blur-xl text-[#F8FAFC] px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_35px_rgba(34,197,94,0.25)] hover:scale-105 transition-all duration-300 border border-[#243045] hover:border-[#22C55E]/40 cursor-pointer group"
          aria-label="Open Janaseva Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#22C55E] transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#22C55E] rounded-full shadow-[0_0_8px_#22C55E] animate-pulse"></span>
          </div>
          <span className="font-medium text-xs tracking-tight text-[#F8FAFC]">{t('janasevaAssistant')}</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-[#161D2E] text-[#22C55E] border border-[#243045]">
            {language.toUpperCase()}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[#0B0F17] w-[92vw] sm:w-[440px] h-[580px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] border border-[#243045] animate-in fade-in zoom-in-95 duration-200">
          {/* Chat Header */}
          <div className="bg-[#121826] px-4 py-3.5 flex items-center justify-between border-b border-[#243045]">
            {/* Left Section */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] font-bold text-xs">
                JS
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#F8FAFC] tracking-tight leading-none">
                  Janaseva AI Assistant
                </h3>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Government Services & Welfare Schemes
                </p>
              </div>
            </div>

            {/* Right Section: Essential Controls Only */}
            <div className="flex items-center space-x-1.5">
              {/* Voice Toggle */}
              <button
                onClick={() => setAutoSpeak(prev => !prev)}
                title={autoSpeak ? "Voice Output: ON" : "Voice Output: OFF"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border cursor-pointer ${
                  autoSpeak
                    ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40'
                    : 'bg-[#161D2E] hover:bg-[#243045] text-[#94A3B8] hover:text-[#F8FAFC] border-[#243045]'
                }`}
                aria-label="Toggle Auto Voice Output"
              >
                {autoSpeak ? <Volume2 className="w-4 h-4 text-[#22C55E]" /> : <VolumeX className="w-4 h-4 text-[#94A3B8]" />}
              </button>

              {/* New Chat */}
              <button
                onClick={handleNewChat}
                title="New Chat"
                className="w-8 h-8 rounded-lg bg-[#161D2E] hover:bg-[#243045] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center transition-colors border border-[#243045] cursor-pointer"
                aria-label="New Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearChat}
                title="Clear Chat"
                className="w-8 h-8 rounded-lg bg-[#161D2E] hover:bg-[#243045] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center transition-colors border border-[#243045] cursor-pointer"
                aria-label="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  stopAllAudio();
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-lg bg-[#161D2E] hover:bg-[#243045] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center transition-colors border border-[#243045] cursor-pointer"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Download Toast Notification */}
          {copiedNotification && (
            <div className="bg-[#22C55E]/15 border-b border-[#22C55E]/30 px-3 py-1.5 text-[11px] text-[#22C55E] flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{copiedNotification}</span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#0B0F17]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#161D2E] border border-[#243045] text-[#22C55E] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    JS
                  </div>
                )}

                <div className={`max-w-[85%] rounded-[16px] px-4 py-3 leading-relaxed relative ${
                  m.sender === 'user'
                    ? 'bg-[#22C55E] text-[#0B0F17] font-medium rounded-tr-sm shadow-sm'
                    : 'bg-[#161D2E] text-[#F8FAFC] border border-[#243045] rounded-tl-sm shadow-sm'
                }`}>
                  {m.sender === 'user' ? (
                    <p className="text-xs text-[#0B0F17] whitespace-pre-wrap font-medium">{m.text}</p>
                  ) : (
                    renderFormattedMessageText(m.text)
                  )}

                  {/* Scheme Recommendation links with direct modal inspection */}
                  {m.suggestedSchemes && m.suggestedSchemes.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#243045] space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">
                        <span className="flex items-center gap-1 text-[#22C55E]">
                          <Sparkles className="w-3 h-3 text-[#22C55E]" />
                          Matching Scheme Portals:
                        </span>
                        <span className="text-[9px] text-[#3B82F6]">Official Govt</span>
                      </div>
                      {m.suggestedSchemes.map((s) => (
                        <div key={s.id} className="p-2.5 rounded-xl bg-[#121826] border border-[#243045] hover:border-[#22C55E]/40 transition-all flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-1.5">
                            <button
                              onClick={() => onViewSchemeDetails && onViewSchemeDetails(s.id || s.slug)}
                              className="font-semibold text-[11.5px] text-[#F8FAFC] hover:text-[#22C55E] hover:underline text-left truncate flex-1 cursor-pointer transition-colors"
                              title="Inspect scheme eligibility, rules and documents"
                            >
                              {s.name}
                            </button>
                            <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#161D2E] text-[#94A3B8] border border-[#243045] shrink-0">
                              {s.category}
                            </span>
                          </div>

                          <div className="flex items-center justify-end space-x-1.5 pt-1.5 border-t border-[#243045]/60">
                            {onViewSchemeDetails && (
                              <button
                                onClick={() => onViewSchemeDetails(s.id || s.slug)}
                                className="px-2.5 py-1 rounded-full bg-[#161D2E] hover:bg-[#243045] text-[#F8FAFC] text-[10px] font-medium transition-colors flex items-center space-x-1 cursor-pointer border border-[#243045]"
                              >
                                <Eye className="w-2.5 h-2.5 text-[#22C55E]" />
                                <span>View Details</span>
                              </button>
                            )}
                            <a
                              href={s.officialWebsite}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-full bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-medium transition-colors flex items-center space-x-1 border border-[#22C55E]/30"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center justify-between mt-2 pt-1 border-t text-[9px] ${
                    m.sender === 'user' ? 'border-[#0B0F17]/20 text-[#0B0F17]/70' : 'border-[#243045] text-[#94A3B8]'
                  }`}>
                    <div className="flex items-center space-x-1.5">
                      {m.sender === 'assistant' && (
                        <button
                          onClick={() => handleSpeak(m.id, m.text)}
                          title={
                            speakingMessageId === m.id
                              ? "Stop voice readout"
                              : "Listen to audio readout"
                          }
                          className={`flex items-center space-x-1 px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                            speakingMessageId === m.id
                              ? 'bg-[#22C55E] text-[#0B0F17] font-semibold animate-pulse'
                              : 'bg-[#121826] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#243045] border border-[#243045]'
                          }`}
                        >
                          {speakingMessageId === m.id ? (
                            isSynthesizing ? (
                              <>
                                <span className="w-2 h-2 border border-[#0B0F17] border-t-transparent rounded-full animate-spin"></span>
                                <span>VoiceStudio...</span>
                              </>
                            ) : (
                              <>
                                <VolumeX className="w-2.5 h-2.5" />
                                <span>Stop</span>
                              </>
                            )
                          ) : (
                            <>
                              <Volume2 className="w-2.5 h-2.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <span className="font-mono">
                      {m.timestamp}
                    </span>
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#161D2E] border border-[#243045] text-[#F8FAFC] flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2.5 text-[#94A3B8] text-xs">
                <div className="w-7 h-7 rounded-full bg-[#161D2E] border border-[#243045] text-[#22C55E] font-bold text-[11px] flex items-center justify-center">
                  JS
                </div>
                <div className="bg-[#161D2E] border border-[#243045] rounded-[16px] px-4 py-3 flex items-center space-x-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Listening / Recording Banner */}
          {(isListening || isRecordingAudio) && (
            <div className="bg-[#121826] border-t border-b border-[#243045] px-4 py-2 flex items-center justify-between text-xs text-[#22C55E]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-medium text-[11px] text-[#F8FAFC]">
                  {isRecordingAudio
                    ? "Voice Studio Audio Input Active... Speak now!"
                    : `Listening in ${language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}...`}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#243045] hover:bg-[#243045]/80 text-[#F8FAFC] transition-colors cursor-pointer"
              >
                Stop & Send
              </button>
            </div>
          )}

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-[#121826]/80 border-t border-[#243045] flex items-center space-x-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.query)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#161D2E] hover:bg-[#121826] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#243045] hover:border-[#22C55E]/40 transition-all font-medium shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>{q.icon}</span>
                <span>{q.label}</span>
              </button>
            ))}
          </div>

          {/* Input Box with Microphone Voice Control */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#121826] border-t border-[#243045] flex items-center space-x-2"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              title={
                isListening || isRecordingAudio
                  ? "Stop listening"
                  : `Speak question in ${language.toUpperCase()}`
              }
              className={`p-2.5 rounded-xl transition-all duration-300 cursor-pointer border ${
                isListening || isRecordingAudio
                  ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                  : 'bg-[#161D2E] hover:bg-[#243045] text-[#22C55E] border-[#243045]'
              }`}
            >
              {isListening || isRecordingAudio ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening to your voice..." : t('askQuestion')}
              className="flex-1 bg-[#161D2E] border border-[#243045] focus:border-[#22C55E] rounded-xl px-4 py-2.5 text-xs focus:outline-none text-[#F8FAFC] placeholder-[#94A3B8] transition-all"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B0F17] disabled:opacity-40 p-2.5 rounded-xl transition-all cursor-pointer font-semibold flex items-center justify-center shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4 text-[#0B0F17]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
