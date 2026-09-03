import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Code2, 
  Layers, 
  UserCheck, 
  FolderGit2, 
  Target, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { UserCareerProfile, TechnicalSkill, ProjectItem, SkillLevel } from '../types';

interface ProfileWizardPageProps {
  initialProfile: UserCareerProfile;
  onSubmit: (profile: UserCareerProfile) => void;
  onCancel: () => void;
}

export const ProfileWizardPage: React.FC<ProfileWizardPageProps> = ({
  initialProfile,
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 7;
  const [formData, setFormData] = useState<UserCareerProfile>(initialProfile);

  // New skill input state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');

  // New project input state
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjGithub, setNewProjGithub] = useState('');
  const [newProjRole, setNewProjRole] = useState('Full Stack Developer');

  const suggestedSkills = [
    'Java', 'C++', 'Python', 'JavaScript', 'TypeScript', 'React',
    'SQL', 'Spring Boot', 'Node.js', 'Git', 'Docker', 'PostgreSQL',
    'Kubernetes', 'AWS', 'Redis', 'MongoDB', 'System Design'
  ];

  const targetRoles = [
    'Software Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Data Scientist',
    'ML Engineer',
    'DevOps Engineer',
    'Cybersecurity Engineer',
    'Not sure yet'
  ];

  const handleAddSkill = (name: string, level: SkillLevel) => {
    if (!name.trim()) return;
    if (formData.technicalSkills.some(s => s.name.toLowerCase() === name.toLowerCase())) return;

    setFormData({
      ...formData,
      technicalSkills: [
        ...formData.technicalSkills,
        { name: name.trim(), level, category: 'Languages' }
      ]
    });
    setNewSkillName('');
  };

  const handleRemoveSkill = (name: string) => {
    setFormData({
      ...formData,
      technicalSkills: formData.technicalSkills.filter(s => s.name !== name)
    });
  };

  const handleAddProject = () => {
    if (!newProjName.trim()) return;
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      name: newProjName.trim(),
      description: newProjDesc.trim(),
      technologies: newProjTech.split(',').map(t => t.trim()).filter(Boolean),
      githubUrl: newProjGithub.trim(),
      role: newProjRole.trim(),
      isCompleted: true
    };
    setFormData({
      ...formData,
      projects: [...formData.projects, newProj]
    });
    setNewProjName('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjGithub('');
  };

  const handleRemoveProject = (id: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter(p => p.id !== id)
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      onSubmit(formData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  return (
    <div className="relative pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
      
      {/* Top Header */}
      <div className="text-center mb-8 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
          Comprehensive Onboarding Wizard
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          Configure Your Career Baseline
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Step {currentStep} of {totalSteps}: Complete each section for multi-dimensional AI calibration.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>Progress</span>
          <span className="text-cyan-400 font-mono">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-md shadow-indigo-500/50"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl bg-[#070913]/95">
        
        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Step 1: Personal Information</h3>
              <p className="text-xs text-slate-400">Provide your basic contact and degree credentials.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aman Sharma"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. aman@college.edu"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. B.Tech / B.E."
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Major Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Graduation Year</label>
                <select
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={2025}>2025 (Final Year)</option>
                  <option value={2026}>2026 (3rd Year)</option>
                  <option value={2027}>2027 (2nd Year)</option>
                  <option value={2028}>2028 (1st Year)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Academic Profile */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Step 2: Academic Standing</h3>
              <p className="text-xs text-slate-400">CGPA and backlog status determine shortlisting filter eligibility for 70%+ of companies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current CGPA (Scale 10) *</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Backlogs</label>
                <select
                  value={formData.backlogs}
                  onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>0 Backlogs (Clean)</option>
                  <option value={1}>1 Active Backlog</option>
                  <option value={2}>2 Active Backlogs</option>
                  <option value={3}>3+ Active Backlogs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Semester / Year</label>
                <input
                  type="text"
                  value={formData.currentSemester}
                  onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                  placeholder="e.g. 6th Semester"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {formData.backlogs > 0 && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>
                  <strong>Backlog Notice:</strong> Active backlogs will reduce immediate on-campus eligibility. The AI will prioritize off-campus open source and cold referral strategies.
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Technical Skills */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Step 3: Technical Skills & Proficiency</h3>
              <p className="text-xs text-slate-400">Declare languages, frameworks, databases, and DevOps tools with your current level.</p>
            </div>

            {/* Add Custom Skill Box */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Type skill (e.g. Spring Boot, Docker, Redis)"
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillName, newSkillLevel)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </div>

            {/* Quick Suggested Skills */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">Quick Add Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedSkills.map(skill => {
                  const isAdded = formData.technicalSkills.some(s => s.name.toLowerCase() === skill.toLowerCase());
                  return (
                    <button
                      key={skill}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddSkill(skill, 'Intermediate')}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                        isAdded 
                          ? 'opacity-40 bg-slate-800 text-slate-500 cursor-not-allowed' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
                      }`}
                    >
                      + {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Skills List */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2">Declared Skills ({formData.technicalSkills.length})</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {formData.technicalSkills.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                    <span className="font-semibold text-white">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.level === 'Advanced' ? 'bg-emerald-500/20 text-emerald-300' :
                        s.level === 'Intermediate' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {s.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.name)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Soft Skills */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Step 4: Soft Skills & Communication</h3>
              <p className="text-xs text-slate-400">Rate your current behavioral and articulation confidence level (0 - 100%).</p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'communication', label: 'Communication & Verbal Fluency', desc: 'Explaining system trade-offs and code logic clearly.' },
                { key: 'problemSolving', label: 'Problem Solving (STAR Method)', desc: 'Decomposing ambiguous problems into structured steps.' },
                { key: 'teamwork', label: 'Teamwork & Code Reviews', desc: 'Receptiveness to PR critique and peer collaboration.' },
                { key: 'leadership', label: 'Leadership & Project Ownership', desc: 'Taking initiative and managing technical roadmaps.' },
                { key: 'presentation', label: 'Presentation & Demo Communication', desc: 'Presenting technical demos to stakeholders.' },
                { key: 'confidence', label: 'Confidence & Pressure Poise', desc: 'Staying calm and composed during tough interviews.' }
              ].map(item => {
                const val = formData.softSkills[item.key as keyof typeof formData.softSkills];
                return (
                  <div key={item.key} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{item.label}</span>
                      <span className="font-mono text-cyan-400 font-bold">{val}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={val}
                      onChange={(e) => setFormData({
                        ...formData,
                        softSkills: {
                          ...formData.softSkills,
                          [item.key]: parseInt(e.target.value)
                        }
                      })}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Coding Profile */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Step 5: Coding & Repository Profiles</h3>
              <p className="text-xs text-slate-400">Connect your developer accounts to evaluate problem distribution and commit consistency.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">GitHub Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">github.com/</span>
                  <input
                    type="text"
                    value={formData.githubUsername}
                    onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                    placeholder="your_username"
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-24 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">LeetCode Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">leetcode.com/</span>
                  <input
                    type="text"
                    value={formData.leetCodeUsername}
                    onChange={(e) => setFormData({ ...formData, leetCodeUsername: e.target.value })}
                    placeholder="your_username"
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-28 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Projects */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Step 6: Featured Projects</h3>
              <p className="text-xs text-slate-400">Declare your key software engineering projects and repositories.</p>
            </div>

            {/* Add Project Form */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Add New Project</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="Project Name (e.g. CloudSync)"
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={newProjRole}
                  onChange={(e) => setNewProjRole(e.target.value)}
                  placeholder="Your Role (e.g. Full Stack Developer)"
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <textarea
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="Brief description of architecture, APIs, and key features"
                rows={2}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newProjTech}
                  onChange={(e) => setNewProjTech(e.target.value)}
                  placeholder="Tech Stack (comma separated: React, Node.js, Redis)"
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={newProjGithub}
                  onChange={(e) => setNewProjGithub(e.target.value)}
                  placeholder="GitHub URL (optional)"
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                + Add Project to Profile
              </button>
            </div>

            {/* Projects List */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {formData.projects.map((proj) => (
                <div key={proj.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-white">{proj.name}</h4>
                    <p className="text-slate-400 line-clamp-1 mt-0.5">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {proj.technologies.map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">{t}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(proj.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: Career Goal */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Step 7: Target Career Goal</h3>
              <p className="text-xs text-slate-400">Select your primary aspiration or choose "Not sure yet" for autonomous AI recommendations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {targetRoles.map(role => {
                const isSelected = formData.targetRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetRole: role })}
                    className={`p-4 rounded-2xl text-left border transition-all text-xs font-semibold ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{role}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {formData.targetRole === 'Not sure yet' && (
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>CareerAI will analyze your strengths across all 10+ career streams and rank your top best matches.</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/10">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-7 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-100 transition-all"
          >
            <span>{currentStep === totalSteps ? 'Run AI Career Analysis' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
