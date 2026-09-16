import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardScreen from './components/screens/DashboardScreen';
import ScreenerScreen from './components/screens/ScreenerScreen';
import CandidatesScreen from './components/screens/CandidatesScreen';
import CompareScreen from './components/screens/CompareScreen';
import AnalyticsScreen from './components/screens/AnalyticsScreen';
import ReportsScreen from './components/screens/ReportsScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import PipelineScreen from './components/screens/PipelineScreen';
import CandidateDrawer from './components/CandidateDrawer';
import InterviewKitModal from './components/InterviewKitModal';
import OutreachModal from './components/OutreachModal';
import CopilotDrawer from './components/CopilotDrawer';
import DriveModal from './components/DriveModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('RESUME_CANDIDATES');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [lastAnalyzedRole, setLastAnalyzedRole] = useState('AI/ML & Generative AI Specialist');

  // Async State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Modals & Drawers
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isInterviewKitOpen, setIsInterviewKitOpen] = useState(false);
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [modalCandidate, setModalCandidate] = useState(null);

  // Settings State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('AI_API_KEY') || '');
  const [modelName, setModelName] = useState(() => localStorage.getItem('AI_MODEL') || 'groq/compound-mini');

  // Auto-persist candidates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('RESUME_CANDIDATES', JSON.stringify(candidates));
    } catch (e) {
      console.warn('Failed to persist candidates to localStorage', e);
    }
  }, [candidates]);

  // Auto-dismiss toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Handle Pipeline Stage Movement
  const handleUpdateCandidateStage = (targetCandidate, newStage) => {
    setCandidates(prev => prev.map(c => {
      if (c.name === targetCandidate.name && c.source_file === targetCandidate.source_file) {
        return { ...c, pipeline_stage: newStage };
      }
      return c;
    }));

    if (selectedCandidate && selectedCandidate.name === targetCandidate.name) {
      setSelectedCandidate(prev => ({ ...prev, pipeline_stage: newStage }));
    }

    setSuccessToast(`Moved ${targetCandidate.name} to ${newStage.toUpperCase()} stage!`);
  };

  // Open Interview Kit
  const handleOpenInterviewKit = (candidate) => {
    setModalCandidate(candidate || selectedCandidate);
    setIsInterviewKitOpen(true);
  };

  // Open Outreach Composer
  const handleOpenOutreach = (candidate) => {
    setModalCandidate(candidate || selectedCandidate);
    setIsOutreachOpen(true);
  };

  // Open Copilot Chat
  const handleOpenCopilot = (candidate) => {
    setModalCandidate(candidate || selectedCandidate || null);
    setIsCopilotOpen(true);
  };

  // Toggle candidate in comparison list
  const handleToggleCompare = (candidate) => {
    setSelectedForCompare(prev => {
      const exists = prev.some(c => c.name === candidate.name);
      if (exists) {
        return prev.filter(c => c.name !== candidate.name);
      } else {
        if (prev.length >= 4) {
          alert('You can compare a maximum of 4 candidates at a time.');
          return prev;
        }
        return [...prev, candidate];
      }
    });
  };

  const handleRemoveFromCompare = (candidate) => {
    setSelectedForCompare(prev => prev.filter(c => c.name !== candidate.name));
  };

  // Direct PDF Upload & Dynamic Analysis
  const handleAnalyzeUpload = async ({ files, targetRole, jobDescription, scoringCriteria }) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (apiKey) {
      formData.append('api_key', apiKey);
    }
    if (modelName) {
      formData.append('model_name', modelName);
    }
    if (targetRole) {
      formData.append('target_role', targetRole);
      setLastAnalyzedRole(targetRole);
    }
    if (jobDescription) {
      formData.append('job_description', jobDescription);
    }
    if (scoringCriteria && scoringCriteria.length > 0) {
      formData.append('scoring_criteria', JSON.stringify(scoringCriteria));
    }

    try {
      const res = await fetch('/api/analyze/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to analyze uploaded resumes.');
      }

      if (data.results && data.results.length > 0) {
        const enriched = data.results.map(c => ({
          ...c,
          pipeline_stage: c.pipeline_stage || 'screened'
        }));
        setCandidates(prev => [...enriched, ...prev]);
        setSuccessToast(`Successfully evaluated ${data.successful_count} resumes for "${targetRole || 'Role'}"!`);
        setCurrentScreen('pipeline'); // Navigate directly to ATS Pipeline
      } else {
        setAnalysisError('No valid resume data could be parsed from the uploaded files.');
      }
    } catch (err) {
      setAnalysisError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Google Drive Sync & Dynamic Analysis
  const handleSyncDrive = async (drivePayload) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const payload = {
        folder_id: drivePayload.folder_id,
        target_role: drivePayload.target_role || undefined,
        job_description: drivePayload.job_description || undefined,
        api_key: apiKey || undefined,
        service_account_json: drivePayload.service_account_json || undefined
      };

      if (drivePayload.target_role) {
        setLastAnalyzedRole(drivePayload.target_role);
      }

      const res = await fetch('/api/analyze/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Google Drive sync and analysis failed.');
      }

      if (data.results && data.results.length > 0) {
        const enriched = data.results.map(c => ({
          ...c,
          pipeline_stage: c.pipeline_stage || 'screened'
        }));
        setCandidates(prev => [...enriched, ...prev]);
        setSuccessToast(`Imported and evaluated ${data.successful_count} resumes from Google Drive!`);
        setIsDriveModalOpen(false);
        setCurrentScreen('pipeline');
      } else {
        setAnalysisError(data.message || 'No PDF resumes found or processed from Google Drive folder.');
      }
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export to Multi-sheet Excel
  const handleExportExcel = async () => {
    if (candidates.length === 0) return;
    setIsExporting(true);

    try {
      const res = await fetch('/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidates)
      });

      if (!res.ok) {
        throw new Error('Failed to generate Excel file.');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Resume_Evaluation_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccessToast('Dynamic multi-sheet Excel report downloaded!');
    } catch (err) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {successToast && (
        <div style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 1100,
          background: '#064E3B',
          border: '1px solid #10B981',
          color: '#ECFDF5',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <CheckCircle2 size={20} color="#34D399" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{successToast}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        candidatesCount={candidates.length}
        selectedForCompareCount={selectedForCompare.length}
        onOpenCopilot={() => handleOpenCopilot(null)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          currentScreen={currentScreen}
          onOpenDriveModal={() => setIsDriveModalOpen(true)}
          onExportExcel={handleExportExcel}
          onNavigateScreener={() => setCurrentScreen('screener')}
          onOpenSettings={() => setCurrentScreen('settings')}
          isExporting={isExporting}
          hasResults={candidates.length > 0}
          targetRole={lastAnalyzedRole}
        />

        <main className="content-container">
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              candidates={candidates}
              onNavigateScreen={setCurrentScreen}
              onSelectCandidate={setSelectedCandidate}
              onExportExcel={handleExportExcel}
            />
          )}

          {currentScreen === 'screener' && (
            <ScreenerScreen
              onAnalyzeUpload={handleAnalyzeUpload}
              onOpenDriveModal={() => setIsDriveModalOpen(true)}
              isAnalyzing={isAnalyzing}
              error={analysisError}
              lastAnalyzedRole={lastAnalyzedRole}
              setLastAnalyzedRole={setLastAnalyzedRole}
            />
          )}

          {currentScreen === 'pipeline' && (
            <PipelineScreen
              candidates={candidates}
              onUpdateCandidateStage={handleUpdateCandidateStage}
              onSelectCandidate={setSelectedCandidate}
              onOpenInterviewKit={handleOpenInterviewKit}
              onOpenOutreach={handleOpenOutreach}
            />
          )}

          {currentScreen === 'candidates' && (
            <CandidatesScreen
              candidates={candidates}
              onSelectCandidate={setSelectedCandidate}
              selectedForCompare={selectedForCompare}
              onToggleCompare={handleToggleCompare}
              onNavigateScreen={setCurrentScreen}
              onExportExcel={handleExportExcel}
              onOpenInterviewKit={handleOpenInterviewKit}
              onOpenOutreach={handleOpenOutreach}
              onOpenCopilot={handleOpenCopilot}
            />
          )}

          {currentScreen === 'compare' && (
            <CompareScreen
              candidates={candidates}
              selectedForCompare={selectedForCompare}
              onRemoveFromCompare={handleRemoveFromCompare}
              onNavigateScreen={setCurrentScreen}
              onSelectCandidate={setSelectedCandidate}
            />
          )}

          {currentScreen === 'analytics' && (
            <AnalyticsScreen candidates={candidates} />
          )}

          {currentScreen === 'reports' && (
            <ReportsScreen
              candidates={candidates}
              onExportExcel={handleExportExcel}
              isExporting={isExporting}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              apiKey={apiKey}
              setApiKey={setApiKey}
              modelName={modelName}
              setModelName={setModelName}
            />
          )}
        </main>
      </div>

      {/* Slide-over Profile Drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onOpenInterviewKit={handleOpenInterviewKit}
        onOpenOutreach={handleOpenOutreach}
        onOpenCopilot={handleOpenCopilot}
        onUpdateCandidateStage={handleUpdateCandidateStage}
      />

      {/* AI Tailored Interview Kit Modal */}
      <InterviewKitModal
        isOpen={isInterviewKitOpen}
        onClose={() => setIsInterviewKitOpen(false)}
        candidate={modalCandidate}
        targetRole={modalCandidate?.target_role || lastAnalyzedRole}
      />

      {/* AI Candidate Outreach Modal */}
      <OutreachModal
        isOpen={isOutreachOpen}
        onClose={() => setIsOutreachOpen(false)}
        candidate={modalCandidate}
      />

      {/* AI Resume & Talent Pool Copilot Chat Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        candidate={modalCandidate}
        candidatesCount={candidates.length}
        targetRole={lastAnalyzedRole}
      />

      {/* Google Drive Connector Modal */}
      <DriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onSyncDrive={handleSyncDrive}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
}
