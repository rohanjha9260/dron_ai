import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  MessageSquare, 
  Globe, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { UserCareerProfile } from '../types';

interface ReferralGeneratorPageProps {
  profile: UserCareerProfile;
}

export const ReferralGeneratorPage: React.FC<ReferralGeneratorPageProps> = ({ profile }) => {
  const [targetCompany, setTargetCompany] = useState('Google');
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE-1)');
  const [recipientType, setRecipientType] = useState<'Senior SDE' | 'Engineering Manager' | 'Alumni' | 'Technical Recruiter'>('Senior SDE');
  const [jobId, setJobId] = useState('REQ-894210');
  const [copied, setCopied] = useState(false);

  const generateMessage = () => {
    if (recipientType === 'Senior SDE' || recipientType === 'Alumni') {
      return `Hi [Engineer Name],

Hope you are having a productive week! I came across your engineering work at ${targetCompany} and was deeply inspired by your team's architecture.

I am an incoming 2026 CS graduate with an 8.2 CGPA and 147+ LeetCode problems solved. I recently built CloudSync (a collaborative real-time canvas handling 1.2k concurrent WebSockets via Redis) and FinLedger (a high-throughput Java Spring Boot banking microservice with ACID safety).

I noticed the ${targetRole} role (Job ID: ${jobId}) at ${targetCompany} and believe my backend and algorithmic background align strongly with your engineering bar.

If you have 2 minutes, would you be open to reviewing my resume or sharing a referral link? I would be grateful for your consideration.

Portfolio & GitHub: github.com/${profile.githubUsername}
LeetCode Profile: leetcode.com/${profile.leetCodeUsername}

Thank you for your time,
${profile.name}`;
    } else if (recipientType === 'Engineering Manager') {
      return `Hi [Manager Name],

I hope this note finds you well. I've been following ${targetCompany}'s technical blog and appreciate the high-scale engineering challenges your team is solving.

I am writing to express my strong interest in the ${targetRole} position (Job ID: ${jobId}). As a software engineer proficient in Java, React, SQL, and microservices, I have built production-deployed systems including a real-time collaborative platform with Redis Pub/Sub buffer synchronization.

I have attached my single-page resume highlighting my quantitative project metrics and 147+ algorithmic problem milestones. Would you be open to a quick 5-minute conversation or passing my profile to your recruiting team?

Best regards,
${profile.name} • github.com/${profile.githubUsername}`;
    } else {
      return `Hi [Recruiter Name],

I hope you're having a great day! I noticed you manage technical recruitment for early-career engineering at ${targetCompany}.

I am an active applicant for the ${targetRole} opening (Job ID: ${jobId}). My core stack is Java, Spring Boot, React, and SQL with 147+ LeetCode problems solved and an 8.2 CGPA. My flagship projects demonstrate experience with WebSocket concurrency and ACID transaction indexing.

I would love to connect and share my resume for consideration in upcoming interview batches.

Warm regards,
${profile.name} • ${profile.email}`;
    }
  };

  const messageText = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Outreach & Cold Referral Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          AI LinkedIn & Cold Email Referral Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Convert cold LinkedIn connections and employee emails into interview referrals with personalized, high-converting messages citing real project metrics.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Input Configuration Controls (1 Column) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 text-xs">
          <span className="font-bold text-indigo-300 uppercase tracking-wider font-display block">
            Target Outreach Parameters
          </span>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Company</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Job Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Job Opening ID / Req #</label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Recipient Category</label>
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
            >
              <option value="Senior SDE">Senior SDE / Tech Lead</option>
              <option value="Engineering Manager">Engineering Manager (EM)</option>
              <option value="Alumni">College Alumni at Company</option>
              <option value="Technical Recruiter">Technical Recruiter / HR</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300">
            ⚡ <strong>Pro Tip:</strong> Reaching out to Alumni or Senior SDEs yields a 4x higher response rate than generic job applications.
          </div>
        </div>

        {/* Right: Generated Message Box (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Generated Message</span>
                <h3 className="text-base font-bold text-white font-display mt-0.5">High-Conversion Personalized Script</h3>
              </div>

              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : '1-Click Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#030408] border border-white/5 mt-4">
              <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                {messageText}
              </pre>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Estimated response rate: <strong>32% – 45%</strong></span>
            <span className="text-indigo-400 font-semibold font-mono">Character Count: {messageText.length}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
