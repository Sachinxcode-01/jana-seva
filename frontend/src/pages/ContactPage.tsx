import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Scheme Inquiry');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-[#f5f5f8]">
      {/* Header */}
      <div className="bytune-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,_rgba(143,139,255,0.12),_transparent_70%)] pointer-events-none" />
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8f8bff]">
            Citizen Support & Inquiry
          </span>
          <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f5f5f8]">
            Contact & Citizen Grievance Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#b6b6c2] leading-relaxed font-normal">
            Have questions about scheme eligibility, documentation verification, or portal usage? Reach out to our public assistance cell or connect with official state helplines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="md:col-span-2 bytune-card p-6 sm:p-8 space-y-5">
          <div className="border-b border-white/[0.08] pb-3">
            <h3 className="font-medium text-base text-[#f5f5f8]">Submit a Citizen Inquiry</h3>
            <p className="text-xs text-[#8a8a97]">Our assistance team responds within 24 to 48 business hours.</p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-[#1ed760]/10 border border-[#1ed760]/20 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#1ed760] mx-auto" />
              <h4 className="font-medium text-[#f5f5f8] text-base">Inquiry Submitted Successfully</h4>
              <p className="text-xs text-[#b6b6c2] max-w-md mx-auto">
                Thank you for contacting JANASEVA. Your reference ticket #JS-2026-{Math.floor(1000 + Math.random() * 9000)} has been generated.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="mt-2 bytune-btn-solid px-5 py-2 text-xs font-semibold cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="citizen@example.com"
                    className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">Topic / Category</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none cursor-pointer"
                >
                  <option value="Scheme Inquiry">Scheme Eligibility Inquiry</option>
                  <option value="Document Query">Document Checklist Clarification</option>
                  <option value="Application Issue">Official Portal Application Assistance</option>
                  <option value="General Feedback">Feedback / Suggestion for JANASEVA</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your question or requirement..."
                  className="w-full py-2.5 px-4 rounded-2xl border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bytune-btn-solid flex items-center space-x-1.5 px-6 py-2.5 text-xs font-semibold cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#0a0a0c]" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Public Helplines Card */}
        <div className="space-y-4">
          <div className="bytune-card p-6 space-y-4">
            <h3 className="font-medium text-sm text-[#f5f5f8] border-b border-white/[0.08] pb-2">
              Official Helpline Directory
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-mono text-[#8f8bff]">Karnataka Guarantee Schemes</span>
                <p className="font-medium text-[#f5f5f8] mt-0.5">Seva Sindhu Citizen Helpline</p>
                <p className="text-[#1ed760] font-mono font-bold text-sm mt-1">1902</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-mono text-[#8f8bff]">Agriculture Direct Benefit</span>
                <p className="font-medium text-[#f5f5f8] mt-0.5">PM-KISAN Samman Toll-Free</p>
                <p className="text-[#1ed760] font-mono font-bold text-sm mt-1">155261 / 1800-115-526</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-mono text-[#8f8bff]">National Health Authority</span>
                <p className="font-medium text-[#f5f5f8] mt-0.5">Ayushman PM-JAY Helpdesk</p>
                <p className="text-[#1ed760] font-mono font-bold text-sm mt-1">14555</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-mono text-[#8f8bff]">Women Safety & Empowerment</span>
                <p className="font-medium text-[#f5f5f8] mt-0.5">National Women Helpline</p>
                <p className="text-rose-400 font-mono font-bold text-sm mt-1">181</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
