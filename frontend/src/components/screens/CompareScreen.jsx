import React from 'react';
import { 
  Scale, 
  X, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Plus
} from 'lucide-react';

export default function CompareScreen({ 
  candidates, 
  selectedForCompare, 
  onRemoveFromCompare, 
  onNavigateScreen, 
  onSelectCandidate 
}) {
  const comparedList = selectedForCompare || [];

  const getMatchScoreBadge = (score) => {
    const val = score ?? 70;
    const bg = val >= 80 ? '#ECFDF5' : val >= 65 ? '#F0FDFA' : '#FEF3C7';
    const color = val >= 80 ? '#065F46' : val >= 65 ? '#0F766E' : '#92400E';
    const border = val >= 80 ? '1px solid rgba(16, 185, 129, 0.45)' : val >= 65 ? '1px solid rgba(20, 184, 166, 0.45)' : '1px solid rgba(245, 158, 11, 0.45)';
    return (
      <span style={{ fontSize: '0.9rem', padding: '6px 14px', borderRadius: '9999px', fontWeight: 800, background: bg, color, border, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Target size={14} /> {val}% Match
      </span>
    );
  };

  const getRecBadge = (rec) => {
    const r = (rec || "Shortlist").toLowerCase();
    const bg = r.includes('strong') || r.includes('hire') ? '#ECFDF5' : r.includes('shortlist') ? '#F0FDF4' : r.includes('reject') ? '#FEF2F2' : '#FEF3C7';
    const color = r.includes('strong') || r.includes('hire') ? '#065F46' : r.includes('shortlist') ? '#047857' : r.includes('reject') ? '#991B1B' : '#92400E';
    const border = r.includes('strong') || r.includes('hire') ? '1px solid #10B981' : r.includes('shortlist') ? '1px solid #34D399' : r.includes('reject') ? '1px solid #F87171' : '1px solid #FBBF24';
    return (
      <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '4px', fontWeight: 700, background: bg, color, border }}>
        {rec || "Shortlist"}
      </span>
    );
  };

  if (comparedList.length === 0) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '60px 20px', textAlign: 'center', background: '#FFFFFF' }}>
        <Scale size={48} color="#059669" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#062D24' }}>No Candidates Selected for Comparison</h3>
        <p style={{ color: '#047857', maxWidth: '460px', margin: '8px auto 20px', fontSize: '0.9rem', fontWeight: 500 }}>
          Select 2 or more candidates from the <strong>Talent Roster</strong> using the "Compare" checkbox to view their side-by-side matrix here.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigateScreen('candidates')}>
          Go to Talent Roster
        </button>
      </div>
    );
  }

  // Extract all unique criteria across all compared candidates
  const allCriteria = Array.from(new Set(
    comparedList.flatMap(c => Object.keys(c.evaluation_scores || {}))
  ));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#062D24' }}>
            Side-by-Side Comparison Matrix
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
            Evaluating <strong>{comparedList.length}</strong> candidate{comparedList.length > 1 ? 's' : ''} across competencies, skills, and projects.
          </p>
        </div>

        <button 
          className="btn btn-secondary"
          onClick={() => onNavigateScreen('candidates')}
          style={{ fontSize: '0.85rem', fontWeight: 700 }}
        >
          <Plus size={16} /> Add More Candidates
        </button>
      </div>

      {/* Comparison Grid Matrix */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${comparedList.length}, minmax(280px, 1fr))`,
        gap: '20px',
        overflowX: 'auto',
        paddingBottom: '16px'
      }}>
        {comparedList.map((candidate, idx) => {
          const scores = candidate.evaluation_scores || {};
          const matchedSkills = candidate.matched_skills || [];
          const missingSkills = candidate.missing_skills || [];
          const projects = candidate.supporting_info?.projects || [];

          return (
            <div 
              key={idx} 
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                background: '#FFFFFF'
              }}
            >
              {/* Card Header & Remove button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#062D24' }}>
                    {candidate.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                    {candidate.target_role || 'Evaluated Role'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 500 }}>
                    {candidate.source_file}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveFromCompare(candidate)}
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#DC2626',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Remove from comparison"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Match Score & Recommendation */}
              <div style={{
                background: '#F0FDF4',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
                textAlign: 'center',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div>{getMatchScoreBadge(candidate.match_score_pct)}</div>
                <div>{getRecBadge(candidate.recommendation)}</div>
              </div>

              {/* Fit Summary */}
              {candidate.fit_summary && (
                <div style={{
                  fontSize: '0.825rem',
                  color: '#062D24',
                  background: '#ECFDF5',
                  borderLeft: '3px solid #059669',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  lineHeight: 1.4,
                  fontWeight: 500
                }}>
                  {candidate.fit_summary}
                </div>
              )}

              {/* Dynamic Rubric Scores */}
              {allCriteria.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064E3B', marginBottom: '10px' }}>
                    Competency Ratings (1-5)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {allCriteria.map((crit, cIdx) => {
                      const val = scores[crit] ?? '-';
                      const pct = typeof val === 'number' ? (val / 5) * 100 : 0;
                      return (
                        <div key={cIdx} style={{ fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ color: '#062D24', fontWeight: 600 }}>{crit}</span>
                            <span style={{ fontWeight: 800, color: '#059669' }}>{val} / 5</span>
                          </div>
                          {typeof val === 'number' && (
                            <div style={{ width: '100%', height: '6px', background: '#F0FDF4', borderRadius: '3px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#059669', borderRadius: '3px' }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matched Requirements */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} /> Matched Skills ({matchedSkills.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {matchedSkills.map((s, sIdx) => (
                    <span key={sIdx} style={{ fontSize: '0.725rem', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: '#ECFDF5', color: '#065F46', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Requirements */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#DC2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} /> Missing Gaps ({missingSkills.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {missingSkills.map((s, sIdx) => (
                    <span key={sIdx} style={{ fontSize: '0.725rem', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: '#FEF2F2', color: '#991B1B', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Academic & Projects */}
              <div style={{ fontSize: '0.8rem', color: '#062D24', borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: '12px', fontWeight: 500 }}>
                <p><strong>University:</strong> {candidate.university}</p>
                <p><strong>Degree:</strong> {candidate.course} ({candidate.discipline})</p>
                <p><strong>Projects:</strong> {projects.length} verified projects</p>
              </div>

              {/* Profile Button */}
              <button
                className="btn btn-secondary"
                onClick={() => onSelectCandidate(candidate)}
                style={{ width: '100%', fontSize: '0.85rem', marginTop: 'auto', fontWeight: 700 }}
              >
                View Full Candidate Profile &rarr;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
