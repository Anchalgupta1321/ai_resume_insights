import React from 'react';
import { Cloud, FileSpreadsheet, PlusCircle, Settings } from 'lucide-react';

export default function Header({ 
  currentScreen, 
  onOpenDriveModal, 
  onExportExcel, 
  onNavigateScreener, 
  onOpenSettings,
  isExporting, 
  hasResults,
  targetRole
}) {
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard': return { title: 'Executive Overview', desc: 'Real-time hiring pipeline metrics and candidate insights' };
      case 'screener': return { title: 'Batch Screener & JD Studio', desc: 'Upload resumes and customize role requirements' };
      case 'candidates': return { title: 'Talent Roster', desc: 'Search, filter, and inspect evaluated candidate profiles' };
      case 'compare': return { title: 'Candidate Comparison Studio', desc: 'Side-by-side evaluation matrix across skills and rubric dimensions' };
      case 'analytics': return { title: 'Talent Analytics Hub', desc: 'Match score distributions, recommendations, and skill clouds' };
      case 'reports': return { title: 'Reports & Export Center', desc: 'Generate multi-sheet Excel reports, CSV, and audit logs' };
      case 'settings': return { title: 'Engine & API Settings', desc: 'Configure AI provider, models, and Google Drive credentials' };
      default: return { title: 'Recruitment Hub', desc: 'AI-Powered Candidate Evaluation' };
    }
  };

  const info = getScreenTitle();

  return (
    <header style={{
      height: '76px',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-header)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px'
    }}>
      {/* Title & Subtitle */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2, color: '#062D24' }}>
          {info.title}
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 500, marginTop: '2px' }}>
          {info.desc} {targetRole && <span style={{ color: '#059669', marginLeft: '6px', fontWeight: 700 }}>&bull; Role: <strong>{targetRole}</strong></span>}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {currentScreen !== 'screener' && (
          <button 
            className="btn btn-primary"
            onClick={onNavigateScreener}
            style={{ padding: '9px 18px', fontSize: '0.875rem' }}
          >
            <PlusCircle size={16} /> New Screening
          </button>
        )}

        <button 
          className="btn btn-secondary" 
          onClick={onOpenDriveModal}
          style={{ padding: '9px 16px', fontSize: '0.875rem' }}
          title="Sync Resumes from Google Drive"
        >
          <Cloud size={16} color="#059669" /> Google Drive
        </button>

        {hasResults && (
          <button 
            className="btn btn-success" 
            onClick={onExportExcel}
            disabled={isExporting}
            style={{ padding: '9px 16px', fontSize: '0.875rem' }}
          >
            <FileSpreadsheet size={16} />
            <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>
        )}

        <button 
          className="btn btn-secondary" 
          onClick={onOpenSettings}
          style={{ padding: '9px', borderRadius: 'var(--radius-md)' }}
          title="Settings"
        >
          <Settings size={18} color="#062D24" />
        </button>
      </div>
    </header>
  );
}
