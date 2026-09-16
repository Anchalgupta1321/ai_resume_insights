import React from 'react';
import { Sparkles, Settings, FileSpreadsheet, Cloud, BarChart3, Users, ShieldCheck } from 'lucide-react';

export default function Navbar({ 
  candidatesCount, 
  activeTab, 
  setActiveTab, 
  onOpenSettings, 
  onOpenDriveModal, 
  onExportExcel,
  isExporting,
  hasResults
}) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      marginBottom: '28px'
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        paddingBottom: '16px'
      }}>
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2 }}>
              Resume<span className="gradient-text">Insights</span> AI
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Intelligent Resume Screening & Candidate Scoring
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          border: '1px solid var(--border-color)',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveTab('candidates')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'candidates' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'candidates' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            <Users size={16} />
            Candidates {candidatesCount > 0 && `(${candidatesCount})`}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'analytics' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'analytics' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            <BarChart3 size={16} />
            Analytics & Insights
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onOpenDriveModal}
            title="Import Resumes from Google Drive Folder"
          >
            <Cloud size={16} color="#06B6D4" />
            <span style={{ fontSize: '0.85rem' }}>Google Drive</span>
          </button>

          {hasResults && (
            <button 
              className="btn btn-success" 
              onClick={onExportExcel}
              disabled={isExporting}
            >
              <FileSpreadsheet size={16} />
              <span style={{ fontSize: '0.85rem' }}>
                {isExporting ? 'Exporting...' : 'Export Excel'}
              </span>
            </button>
          )}

          <button 
            className="btn btn-secondary" 
            onClick={onOpenSettings}
            title="Configure API Keys & Models"
            style={{ padding: '10px' }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
