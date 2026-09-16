import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  ChevronRight, 
  Target, 
  ShieldCheck, 
  Sparkles, 
  Mail 
} from 'lucide-react';

export default function CandidateCard({ 
  candidate, 
  onSelect,
  onOpenInterviewKit,
  onOpenOutreach
}) {
  const matchScore = candidate.match_score_pct ?? 75;
  const recommendation = candidate.recommendation || "Shortlist";
  const scores = candidate.evaluation_scores || {};
  const insights = candidate.additional_insights || {};
  const projects = candidate.supporting_info?.projects || [];
  const risk = candidate.risk_assessment || { authenticity_score: 90, metric_impact_score: 80 };
  const stage = candidate.pipeline_stage || 'screened';

  // Match badge styling with high contrast readability
  const getMatchScoreStyle = (score) => {
    if (score >= 80) return { bg: '#ECFDF5', color: '#065F46', border: '1px solid rgba(16, 185, 129, 0.45)' };
    if (score >= 65) return { bg: '#F0FDFA', color: '#0F766E', border: '1px solid rgba(20, 184, 166, 0.45)' };
    return { bg: '#FEF3C7', color: '#92400E', border: '1px solid rgba(245, 158, 11, 0.45)' };
  };

  const getRecBadgeStyle = (rec) => {
    const r = (rec || '').toLowerCase();
    if (r.includes('strong') || r.includes('hire')) return { bg: '#ECFDF5', color: '#065F46', border: '1px solid #10B981' };
    if (r.includes('shortlist')) return { bg: '#F0FDF4', color: '#047857', border: '1px solid #34D399' };
    if (r.includes('reject')) return { bg: '#FEF2F2', color: '#991B1B', border: '1px solid #F87171' };
    return { bg: '#FEF3C7', color: '#92400E', border: '1px solid #FBBF24' };
  };

  const matchStyle = getMatchScoreStyle(matchScore);
  const recStyle = getRecBadgeStyle(recommendation);

  return (
    <div 
      onClick={onSelect}
      className="glass-panel" 
      style={{
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        background: '#FFFFFF'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(6, 78, 59, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      <div>
        {/* Top Row: Name, Target Role, and Match % */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#062D24' }}>
                {candidate.name}
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#059669', marginTop: '2px', fontWeight: 700 }}>
              {candidate.target_role || 'Evaluated Candidate'}
            </p>
          </div>

          {/* Match Score Badge */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 800,
              fontSize: '0.875rem',
              background: matchStyle.bg,
              color: matchStyle.color,
              border: matchStyle.border
            }}>
              <Target size={14} /> {matchScore}% Match
            </div>
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 700,
              background: recStyle.bg,
              color: recStyle.color,
              border: recStyle.border
            }}>
              {recommendation}
            </span>
          </div>
        </div>

        {/* Authenticity & Metric Impact Intelligence Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '4px',
            background: '#ECFDF5',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <ShieldCheck size={12} color="#059669" /> {risk.authenticity_score}% Authenticity
          </span>

          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '4px',
            background: '#F0FDFA',
            color: '#0F766E',
            border: '1px solid rgba(20, 184, 166, 0.3)'
          }}>
            📊 {risk.metric_impact_score}% Quantified Impact
          </span>
        </div>

        {/* Education Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#064E3B',
          fontSize: '0.825rem',
          fontWeight: 500,
          marginBottom: '12px'
        }}>
          <GraduationCap size={15} color="#059669" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {candidate.university} &bull; {candidate.course}
          </span>
        </div>

        {/* Fit Summary or Strength */}
        {(candidate.fit_summary || insights.technical_strength) && (
          <div style={{
            background: '#F0FDF4',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            fontSize: '0.825rem',
            color: '#062D24',
            marginBottom: '14px',
            borderLeft: '3px solid #059669',
            lineHeight: 1.4,
            fontWeight: 500
          }}>
            {candidate.fit_summary || insights.technical_strength}
          </div>
        )}

        {/* Dynamic Criteria Scores Preview */}
        {Object.keys(scores).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            {Object.entries(scores).slice(0, 3).map(([k, v], idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.725rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#ECFDF5',
                  color: '#065F46',
                  fontWeight: 600,
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                {k.split(' ')[0]}: <strong>{v}/5</strong>
              </span>
            ))}
          </div>
        )}

        {/* Skills Preview */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
          {(candidate.key_skills || []).slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.725rem',
                padding: '3px 8px',
                borderRadius: '4px',
                background: '#F0FDF4',
                color: '#064E3B',
                fontWeight: 600,
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}
            >
              {skill}
            </span>
          ))}
          {(candidate.key_skills || []).length > 4 && (
            <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, alignSelf: 'center' }}>
              +{candidate.key_skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer with Quick Action Icons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '10px',
        borderTop: '1px solid rgba(16, 185, 129, 0.15)',
        fontSize: '0.775rem',
        color: '#047857',
        fontWeight: 500
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Briefcase size={13} color="#059669" />
          <span>{projects.length} {projects.length === 1 ? 'Project' : 'Projects'}</span>
          {candidate.cgpa_percentage && candidate.cgpa_percentage !== 'N/A' && (
            <span>&bull; CGPA: {candidate.cgpa_percentage}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onOpenInterviewKit && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenInterviewKit(candidate); }}
              title="Generate Interview Kit"
              style={{ background: '#ECFDF5', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', padding: '2px 6px', color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', fontWeight: 700 }}
            >
              <Sparkles size={11} /> Kit
            </button>
          )}

          {onOpenOutreach && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenOutreach(candidate); }}
              title="Compose Outreach Email"
              style={{ background: '#F0FDFA', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '4px', padding: '2px 6px', color: '#0D9488', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', fontWeight: 700 }}
            >
              <Mail size={11} /> Email
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#059669', fontWeight: 700, marginLeft: '4px' }}>
            Fit <ChevronRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}
