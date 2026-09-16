import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  UploadCloud, 
  Users, 
  Scale, 
  BarChart3, 
  FileSpreadsheet, 
  Settings, 
  Zap,
  Layers,
  Bot
} from 'lucide-react';

export default function Sidebar({ 
  currentScreen, 
  setCurrentScreen, 
  candidatesCount, 
  selectedForCompareCount,
  onOpenCopilot 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'screener', label: 'Batch Screener & JD', icon: UploadCloud },
    { id: 'pipeline', label: 'Hiring Pipeline (ATS)', icon: Layers, badge: candidatesCount > 0 ? candidatesCount : null, highlight: true },
    { id: 'candidates', label: 'Talent Roster', icon: Users, badge: candidatesCount > 0 ? candidatesCount : null },
    { id: 'compare', label: 'Candidate Compare', icon: Scale, badge: selectedForCompareCount > 0 ? `${selectedForCompareCount} sel` : null, highlight: selectedForCompareCount > 0 },
    { id: 'analytics', label: 'Talent Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Engine & Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      padding: '24px 16px'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 24px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
          flexShrink: 0
        }}>
          <Sparkles size={22} color="#FFFFFF" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.1, color: '#062D24' }}>
            Resume<span className="gradient-text">Insights</span>
          </h1>
          <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700, letterSpacing: '0.05em' }}>
            ENTERPRISE AI ATS
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '20px 0', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065F46', letterSpacing: '0.08em', padding: '0 10px 6px', textTransform: 'uppercase' }}>
          Recruitment Hub
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent',
                color: isActive ? '#FFFFFF' : '#062D24',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#F0FDF4';
                  e.currentTarget.style.color = '#047857';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#062D24';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={17} color={isActive ? '#FFFFFF' : '#059669'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? '#FFFFFF' : '#ECFDF5',
                  color: isActive ? '#047857' : '#059669',
                  border: isActive ? 'none' : '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Copilot Quick Launcher Button */}
      <button
        onClick={onOpenCopilot}
        style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #E6F7F0 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: '10px',
          boxShadow: '0 2px 8px rgba(6, 78, 59, 0.05)',
          transition: 'all 0.15s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={18} color="#059669" />
          <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#062D24' }}>AI Copilot Chat</span>
        </div>
        <Sparkles size={14} color="#059669" />
      </button>

      {/* Engine Status Card */}
      <div style={{
        background: '#F0FDF4',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', boxShadow: '0 0 8px #10B981' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#064E3B' }}>Groq Engine Active</span>
        </div>
        <Zap size={14} color="#059669" />
      </div>
    </aside>
  );
}
