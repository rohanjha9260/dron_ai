import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Key, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { UserCareerProfile } from '../types';

interface SettingsPageProps {
  profile: UserCareerProfile;
  onUpdateProfile: (profile: UserCareerProfile) => void;
  onResetToDemo: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  onUpdateProfile,
  onResetToDemo,
  showToast
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [githubUser, setGithubUser] = useState(profile.githubUsername);
  const [leetCodeUser, setLeetCodeUser] = useState(profile.leetCodeUsername);
  const [apiKey, setApiKey] = useState('cai_live_894210_sk_neural_99x');

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      name,
      email,
      targetRole,
      githubUsername: githubUser,
      leetCodeUsername: leetCodeUser
    });
    showToast('Settings saved and profile re-calibrated successfully!', 'success');
  };

  const handleReset = () => {
    onResetToDemo();
    showToast('Profile restored to default realistic demo baseline.', 'info');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          System Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Settings & Connected Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Manage your personal profile, developer handles, API keys, and notification triggers.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 max-w-3xl">
        
        {/* Personal Details */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-display block">
            User Credentials
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Developer Integration Handles */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-display block">
            Developer Account Handles
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">GitHub Handle</label>
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">LeetCode Handle</label>
              <input
                type="text"
                value={leetCodeUser}
                onChange={(e) => setLeetCodeUser(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* API Integration Key */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-display block">
            CareerAI Backend Service Endpoint Key
          </span>

          <div className="text-xs">
            <label className="block text-slate-300 font-semibold mb-1.5">Neural API Key</label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Used to securely synchronize with GitHub Webhooks and LeetCode GraphQL endpoints.
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Demo Profile (Aman)</span>
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </div>

    </div>
  );
};
