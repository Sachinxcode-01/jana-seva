import React from 'react';
import {
  BookOpen, Target, CheckCircle2, Cpu,
  Database, Award, Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-12 text-[#f5f5f8]">
      {/* Hero Header */}
      <div className="bytune-card p-6 sm:p-10 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,_rgba(143,139,255,0.14),_transparent_70%)] pointer-events-none" />
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#8f8bff]/10 text-[#8f8bff] text-xs font-semibold border border-[#8f8bff]/20">
          <Award className="w-3.5 h-3.5 text-[#f3c64f]" />
          <span>Computer-Based Project (CBP) 2026</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f5f5f8]">
          JANASEVA – Government Scheme Awareness for Betterment of Livelihood
        </h1>
        <p className="text-xs sm:text-sm text-[#b6b6c2] leading-relaxed max-w-3xl font-normal">
          Department of Computer Science & Engineering. A full-stack civic technology initiative designed to eliminate informational asymmetry for rural citizens, farmers, women, and students across India and Karnataka.
        </p>
      </div>

      {/* Abstract & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bytune-card p-6 space-y-3">
          <div className="flex items-center space-x-2 text-[#8f8bff] font-medium text-sm">
            <BookOpen className="w-5 h-5 text-[#f3c64f]" />
            <h3 className="text-[#f5f5f8]">Project Abstract</h3>
          </div>
          <p className="text-xs text-[#b6b6c2] leading-relaxed">
            Despite hundreds of welfare and financial assistance programs launched by Central and State Governments, vulnerable demographic segments often fail to claim their entitlements due to fragmented portals, complex bureaucratic guidelines, language barriers, and predatory unauthorized intermediaries. JANASEVA addresses this civic crisis by providing a single-window, multilingual, rules-evaluated scheme discovery and preliminary eligibility assessment system.
          </p>
        </div>

        <div className="bytune-card p-6 space-y-3">
          <div className="flex items-center space-x-2 text-[#8f8bff] font-medium text-sm">
            <Target className="w-5 h-5 text-rose-400" />
            <h3 className="text-[#f5f5f8]">Problem Statement</h3>
          </div>
          <p className="text-xs text-[#b6b6c2] leading-relaxed">
            Citizens in semi-urban and rural areas lack access to a centralized, trustworthy platform explaining exact eligibility criteria, required documentation checklists, and step-by-step procedures in their native language (Kannada & Hindi). Many fall prey to fraudulent claims or miss application deadlines due to lack of timely notifications.
          </p>
        </div>
      </div>

      {/* Core Objectives */}
      <div className="bytune-card p-6 sm:p-8 space-y-5">
        <h3 className="font-medium text-base text-[#f5f5f8] flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-[#1ed760]" />
          <span>Core Engineering & Civic Objectives</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#b6b6c2]">
          <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.06] space-y-1">
            <h4 className="font-medium text-[#f5f5f8]">1. Single-Window Scheme Directory</h4>
            <p className="text-[#8a8a97]">Curate verified central and state initiatives across 6 essential welfare domains.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.06] space-y-1">
            <h4 className="font-medium text-[#f5f5f8]">2. Automated Smart Eligibility Engine</h4>
            <p className="text-[#8a8a97]">Evaluate user age, domicile, occupation, and income bracket against strict official conditions.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.06] space-y-1">
            <h4 className="font-medium text-[#f5f5f8]">3. Full Multilingual Inclusivity</h4>
            <p className="text-[#8a8a97]">Equal access in English, Kannada (ಕನ್ನಡ), and Hindi (हिंदी) with authentic Unicode typography.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.06] space-y-1">
            <h4 className="font-medium text-[#f5f5f8]">4. Transparent Privacy-Safe Architecture</h4>
            <p className="text-[#8a8a97]">No collection of Aadhaar biometric numbers, bank PINs, or private credentials.</p>
          </div>
        </div>
      </div>

      {/* System Architecture & Tech Stack */}
      <div className="bytune-card p-6 sm:p-8 space-y-6">
        <h3 className="font-medium text-base text-[#f5f5f8] flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#8f8bff]" />
          <span>Full-Stack Engineering Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <h4 className="font-medium text-[#8f8bff] flex items-center">
              <Cpu className="w-4 h-4 mr-1.5" /> Frontend Client
            </h4>
            <ul className="space-y-1.5 text-[#8a8a97]">
              <li>• React.js with TypeScript</li>
              <li>• Tailwind CSS & ByTune Glass System</li>
              <li>• Lucide React Icons & Recharts</li>
              <li>• Full responsive mobile-first UI</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <h4 className="font-medium text-[#1ed760] flex items-center">
              <Layers className="w-4 h-4 mr-1.5" /> Backend REST API
            </h4>
            <ul className="space-y-1.5 text-[#8a8a97]">
              <li>• Node.js & Express Architecture</li>
              <li>• JWT Token Authentication & BCrypt</li>
              <li>• Algorithmic Eligibility Rule Engine</li>
              <li>• Janaseva Assistant AI Service</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <h4 className="font-medium text-[#f3c64f] flex items-center">
              <Database className="w-4 h-4 mr-1.5" /> Database Layer
            </h4>
            <ul className="space-y-1.5 text-[#8a8a97]">
              <li>• PostgreSQL Relational Schema</li>
              <li>• JSON / SQLite persistent storage</li>
              <li>• User, Scheme, Assessment, Tracker tables</li>
              <li>• Relational Integrity & Audit Logging</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
