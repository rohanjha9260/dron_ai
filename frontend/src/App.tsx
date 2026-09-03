import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ParticleBackground } from './components/ParticleBackground';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ChatWidget } from './components/ChatWidget';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ProfileWizardPage } from './pages/ProfileWizardPage';
import { AnalysisScanningPage } from './pages/AnalysisScanningPage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { CareerPredictionPage } from './pages/CareerPredictionPage';
import { JobRoleSimulatorPage } from './pages/JobRoleSimulatorPage';
import { SkillGapAnalysisPage } from './pages/SkillGapAnalysisPage';
import { GitHubIntelligencePage } from './pages/GitHubIntelligencePage';
import { LeetCodeIntelligencePage } from './pages/LeetCodeIntelligencePage';
import { SoftSkillsAnalysisPage } from './pages/SoftSkillsAnalysisPage';
import { ResumeMatcherPage } from './pages/ResumeMatcherPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { DailyActionPlanPage } from './pages/DailyActionPlanPage';
import { GrowthSimulatorPage } from './pages/GrowthSimulatorPage';
import { CareerTwinPage } from './pages/CareerTwinPage';
import { FinalActionPlanPage } from './pages/FinalActionPlanPage';
import { SettingsPage } from './pages/SettingsPage';

// NEW PRO FEATURES & CHAT
import { AIChatMentorPage } from './pages/AIChatMentorPage';
import { CompanyPredictorPage } from './pages/CompanyPredictorPage';
import { ResumeStudioPage } from './pages/ResumeStudioPage';
import { CodePlaygroundPage } from './pages/CodePlaygroundPage';
import { ReferralGeneratorPage } from './pages/ReferralGeneratorPage';
import { SalaryCalculatorPage } from './pages/SalaryCalculatorPage';
import { SystemDesignExplorerPage } from './pages/SystemDesignExplorerPage';

// Data & Services
import { 
  initialAmanProfile, 
  initialAmanScores, 
  initialRoleMatches, 
  initialSkillGaps, 
  initialGitHubStats, 
  initialLeetCodeStats, 
  initialCareerTwin,
  initialNotifications
} from './data/mockUserData';
import { careerAnalysisService } from './services/careerAnalysisService';
import { UserCareerProfile, NotificationItem } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  
  // App State
  const [profile, setProfile] = useState<UserCareerProfile>(initialAmanProfile);
  const [scores, setScores] = useState(initialAmanScores);
  const [roleMatches, setRoleMatches] = useState(initialRoleMatches);
  const [skillGaps, setSkillGaps] = useState(initialSkillGaps);
  const [githubStats, setGithubStats] = useState(initialGitHubStats);
  const [leetCodeStats, setLeetCodeStats] = useState(initialLeetCodeStats);
  const [careerTwin, setCareerTwin] = useState(initialCareerTwin);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}`,
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Profile Update & Re-calibration
  const handleUpdateProfile = (newProfile: UserCareerProfile) => {
    setProfile(newProfile);
    const newScores = careerAnalysisService.calculateReadiness(newProfile);
    setScores(newScores);
    const newRoles = careerAnalysisService.getRoleMatches(newProfile, newScores);
    setRoleMatches(newRoles);
    const newGaps = careerAnalysisService.getSkillGaps(newProfile, newScores);
    setSkillGaps(newGaps);
    const newTwin = careerAnalysisService.getCareerTwin(newProfile, newScores);
    setCareerTwin(newTwin);
    setGithubStats({
      ...githubStats,
      username: newProfile.githubUsername
    });
    setLeetCodeStats({
      ...leetCodeStats,
      username: newProfile.leetCodeUsername
    });
  };

  const handleWizardSubmit = (newProfile: UserCareerProfile) => {
    handleUpdateProfile(newProfile);
    setCurrentView('scanning');
  };

  const handleScanningComplete = () => {
    setCurrentView('dashboard');
    showToast('AI Career Intelligence calibrated successfully!', 'success');
  };

  const handleResetToDemo = () => {
    handleUpdateProfile(initialAmanProfile);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    showToast('Notifications cleared', 'info');
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const isDashboardView = ![
    'landing', 
    'how-it-works', 
    'wizard', 
    'scanning'
  ].includes(currentView);

  return (
    <div className="min-h-screen bg-[#030408] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white relative">
      
      {/* Interactive Particle & Ambient Glow Canvas */}
      <ParticleBackground />

      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'how-it-works') {
            setCurrentView('landing');
            setTimeout(() => {
              document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenWizard={() => setCurrentView('wizard')}
        onToggleNotifications={() => setIsNotificationOpen(true)}
        unreadCount={unreadNotificationCount}
        user={profile}
      />

      {/* Notification Center Slide-Out Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearNotifications}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex">
        
        {/* Collapsible SaaS Dashboard Sidebar */}
        {isDashboardView && (
          <Sidebar
            currentView={currentView}
            setCurrentView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        )}

        {/* View Router Display */}
        <div className={`flex-1 transition-all duration-300 ${
          isDashboardView 
            ? `${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'} pt-24 px-4 sm:px-8 max-w-7xl mx-auto w-full`
            : 'w-full'
        }`}>
          
          {/* VIEW: Landing / Hero */}
          {currentView === 'landing' && (
            <LandingPage
              onAnalyze={() => setCurrentView('wizard')}
              onExploreDemo={() => setCurrentView('dashboard')}
              profile={profile}
              scores={scores}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: Onboarding Wizard */}
          {currentView === 'wizard' && (
            <ProfileWizardPage
              initialProfile={profile}
              onSubmit={handleWizardSubmit}
              onCancel={() => setCurrentView('landing')}
            />
          )}

          {/* VIEW: AI Scanning Screen */}
          {currentView === 'scanning' && (
            <AnalysisScanningPage onComplete={handleScanningComplete} />
          )}

          {/* VIEW: Main Dashboard Overview */}
          {currentView === 'dashboard' && (
            <DashboardOverviewPage
              profile={profile}
              scores={scores}
              roleMatches={roleMatches}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: AI Career Copilot & Mentor Chat (NEW) */}
          {currentView === 'ai-chat-mentor' && (
            <AIChatMentorPage profile={profile} />
          )}

          {/* VIEW: Company Radar */}
          {currentView === 'company-predictor' && (
            <CompanyPredictorPage
              profile={profile}
              scores={scores}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: AI Resume Studio & XYZ Optimizer */}
          {currentView === 'resume-studio' && (
            <ResumeStudioPage profile={profile} />
          )}

          {/* VIEW: Code Playground & AI Reviewer */}
          {currentView === 'code-playground' && (
            <CodePlaygroundPage />
          )}

          {/* VIEW: AI Referral & Cold Outreach Generator */}
          {currentView === 'referral-generator' && (
            <ReferralGeneratorPage profile={profile} />
          )}

          {/* VIEW: Tech Salary & Equity Calculator */}
          {currentView === 'salary-calculator' && (
            <SalaryCalculatorPage />
          )}

          {/* VIEW: System Design Architecture Canvas */}
          {currentView === 'system-design' && (
            <SystemDesignExplorerPage />
          )}

          {/* VIEW: Career Prediction */}
          {currentView === 'career-prediction' && (
            <CareerPredictionPage
              roleMatches={roleMatches}
              profile={profile}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: Job Role Simulator */}
          {currentView === 'job-simulator' && (
            <JobRoleSimulatorPage
              profile={profile}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: Skill Gap Analysis */}
          {currentView === 'skill-gap' && (
            <SkillGapAnalysisPage
              skillGaps={skillGaps}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: GitHub Intelligence */}
          {currentView === 'github' && (
            <GitHubIntelligencePage stats={githubStats} />
          )}

          {/* VIEW: LeetCode Intelligence */}
          {currentView === 'leetcode' && (
            <LeetCodeIntelligencePage
              stats={leetCodeStats}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: Soft Skills Matrix */}
          {currentView === 'soft-skills' && (
            <SoftSkillsAnalysisPage
              softSkills={profile.softSkills}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: Resume vs JD Matcher */}
          {currentView === 'resume-matcher' && (
            <ResumeMatcherPage />
          )}

          {/* VIEW: AI Mock Interview */}
          {currentView === 'mock-interview' && (
            <MockInterviewPage />
          )}

          {/* VIEW: 30/60/90 Day Roadmap */}
          {currentView === 'roadmap' && (
            <RoadmapPage setCurrentView={setCurrentView} />
          )}

          {/* VIEW: Daily Action Plan */}
          {currentView === 'daily-plan' && (
            <DailyActionPlanPage setCurrentView={setCurrentView} />
          )}

          {/* VIEW: Future Growth Simulator */}
          {currentView === 'growth-simulator' && (
            <GrowthSimulatorPage
              profile={profile}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: Career Twin Model */}
          {currentView === 'career-twin' && (
            <CareerTwinPage
              twin={careerTwin}
              profile={profile}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: Next Best Move & Final Action Plan */}
          {currentView === 'final-action-plan' && (
            <FinalActionPlanPage
              profile={profile}
              scores={scores}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VIEW: Settings */}
          {currentView === 'settings' && (
            <SettingsPage
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onResetToDemo={handleResetToDemo}
              showToast={showToast}
            />
          )}

        </div>

      </main>

      {/* Floating Global Quick Chat Copilot Widget (Available on every page) */}
      <ChatWidget
        profile={profile}
        onOpenFullScreen={() => {
          setCurrentView('ai-chat-mentor');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Footer */}
      <Footer setCurrentView={(v) => {
        setCurrentView(v);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

    </div>
  );
};
export default App;
