import React from 'react';
import { 
  Users, 
  Target, 
  Award, 
  TrendingUp, 
  UploadCloud, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight
} from 'lucide-react';
import CandidateCard from '../CandidateCard';

export default function DashboardScreen({ candidates = [], onNavigateScreen, onSelectCandidate }) {
  const total = candidates.length;
  const avgMatch = total > 0 
    ? Math.round(candidates.reduce((acc, c) => acc + (c.match_score_pct || 0), 0) / total) 
    : 0;
  
  const highMatchCount = candidates.filter(c => (c.match_score_pct || 0) >= 80).length;
  const shortlistCount = candidates.filter(c => c.recommendation === 'Shortlist').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '32px 36px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ECFDF5 0%, #E6F7F0 60%, #D1FAE5 100%)',
        borderColor: 'rgba(16, 185, 129, 0.35)',
        boxShadow: '0 10px 30px -5px rgba(6, 78, 59, 0.1)'
      }}>
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            marginBottom: '12px',
            background: '#FFFFFF',
            borderRadius: '9999px',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 2px 6px rgba(6, 78, 59, 0.06)'
          }}>
            <Sparkles size={14} color="#059669" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065F46', letterSpacing: '0.05em' }}>
              INTELLIGENT RECRUITMENT ATS
            </span>
          </div>

          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '10px', color: '#062D24' }}>
            AI-Driven Resume <span className="gradient-text">Screening & Ranking</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#064E3B', lineHeight: 1.5, marginBottom: '20px', fontWeight: 500 }}>
            Screen batches of candidates against custom Job Descriptions, extract standardized competencies, and export formatted hiring analytics instantly.
          </p>

          <button 
            className="btn btn-primary"
            onClick={() => onNavigateScreen('screener')}
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <UploadCloud size={18} /> Launch New Batch Screener
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#064E3B' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Total Resumes Evaluated</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '10px', color: '#062D24' }}>
            {total}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
            Active across all screening batches
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#064E3B' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Average Match Score</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Target size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '10px', color: '#059669' }}>
            {avgMatch}%
          </div>
          <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
            Role alignment average
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#064E3B' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Top-Tier Talent (≥ 80%)</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '10px', color: '#059669' }}>
            {highMatchCount} <span style={{ fontSize: '1rem', color: '#047857' }}>({total > 0 ? Math.round((highMatchCount/total)*100) : 0}%)</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
            High-confidence role matches
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#064E3B' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Recommended Shortlist</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '10px', color: '#D97706' }}>
            {shortlistCount} <span style={{ fontSize: '1rem', color: '#92400E' }}>candidates</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
            Ready for interview scheduling
          </p>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div 
          onClick={() => onNavigateScreen('screener')}
          className="glass-panel"
          style={{
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderLeft: '4px solid #059669'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#062D24' }}>Batch Resume Screener</h3>
              <p style={{ fontSize: '0.825rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
                Upload multiple resumes or sync Google Drive with custom JD requirements.
              </p>
            </div>
            <ArrowUpRight size={20} color="#059669" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateScreen('compare')}
          className="glass-panel"
          style={{
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderLeft: '4px solid #0D9488'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#062D24' }}>Candidate Comparison Studio</h3>
              <p style={{ fontSize: '0.825rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
                Compare candidate skill matrices, rubric ratings, and projects side-by-side.
              </p>
            </div>
            <ArrowUpRight size={20} color="#0D9488" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateScreen('reports')}
          className="glass-panel"
          style={{
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderLeft: '4px solid #059669'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#062D24' }}>Reports & Export Hub</h3>
              <p style={{ fontSize: '0.825rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
                Generate styled multi-sheet Excel reports and executive hiring summaries.
              </p>
            </div>
            <ArrowUpRight size={20} color="#059669" />
          </div>
        </div>
      </div>

      {/* Recent Evaluations Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#062D24' }}>Recent Candidate Evaluations</h3>
            <p style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 500 }}>Top candidates evaluated across your active recruitment batches</p>
          </div>
          {total > 0 && (
            <button 
              onClick={() => onNavigateScreen('candidates')}
              style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All Roster ({total}) <ChevronRight size={16} />
            </button>
          )}
        </div>

        {total === 0 ? (
          <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center', background: '#FFFFFF' }}>
            <UploadCloud size={44} color="#059669" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#062D24' }}>No Resumes Screened Yet</h4>
            <p style={{ fontSize: '0.85rem', color: '#047857', maxWidth: '440px', margin: '6px auto 16px', fontWeight: 500 }}>
              Launch your first batch screening to automatically evaluate and rank candidate resumes.
            </p>
            <button className="btn btn-primary" onClick={() => onNavigateScreen('screener')}>
              <UploadCloud size={16} /> Start Batch Screener
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}>
            {candidates.slice(0, 3).map((candidate, idx) => (
              <CandidateCard
                key={idx}
                candidate={candidate}
                onSelect={() => onSelectCandidate(candidate)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
