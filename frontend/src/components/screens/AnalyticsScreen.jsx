import React, { useMemo } from 'react';
import { BarChart3, Users, Target, Award, TrendingUp } from 'lucide-react';

export default function AnalyticsScreen({ candidates = [] }) {
  const stats = useMemo(() => {
    if (!candidates.length) return null;

    const total = candidates.length;
    const avgMatch = Math.round(candidates.reduce((acc, c) => acc + (c.match_score_pct || 0), 0) / total);

    const recDist = candidates.reduce((acc, c) => {
      const rec = c.recommendation || 'Other';
      acc[rec] = (acc[rec] || 0) + 1;
      return acc;
    }, {});

    const matchDist = {
      high: candidates.filter(c => (c.match_score_pct || 0) >= 80).length,
      medium: candidates.filter(c => (c.match_score_pct || 0) >= 65 && (c.match_score_pct || 0) < 80).length,
      low: candidates.filter(c => (c.match_score_pct || 0) < 65).length
    };

    const skillCounts = {};
    candidates.forEach(c => {
      if (Array.isArray(c.technical_skills)) {
        c.technical_skills.forEach(s => {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        });
      }
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    const highMatchCount = matchDist.high;
    const highMatchPercent = Math.round((highMatchCount / total) * 100);

    return {
      total,
      avgMatch,
      recDist,
      matchDist,
      topSkills,
      highMatchCount,
      highMatchPercent
    };
  }, [candidates]);

  if (!stats) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '60px 20px', textAlign: 'center', background: '#FFFFFF' }}>
        <BarChart3 size={48} color="#059669" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#062D24' }}>No Analytics Data Available</h3>
        <p style={{ color: '#047857', maxWidth: '460px', margin: '8px auto 0', fontSize: '0.9rem', fontWeight: 500 }}>
          Evaluate resumes in the Batch Screener to generate talent alignment distributions and skill insights.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#062D24' }}>
          Talent Analytics & Insights
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
          Aggregate statistics across all evaluated candidates in your talent pool.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#064E3B' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Total Evaluated</span>
            <Users size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '8px', color: '#062D24' }}>
            {stats.total} <span style={{ fontSize: '0.9rem', color: '#047857', fontWeight: 500 }}>resumes</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#064E3B' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Average Role Alignment</span>
            <Target size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '8px', color: '#059669' }}>
            {stats.avgMatch}%
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#064E3B' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>High Alignment (≥ 80%)</span>
            <Award size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '8px', color: '#059669' }}>
            {stats.highMatchPercent}% <span style={{ fontSize: '0.9rem', color: '#047857', fontWeight: 500 }}>({stats.highMatchCount} candidates)</span>
          </div>
        </div>
      </div>

      {/* Score Distributions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* Match Breakdown */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#062D24' }}>
            <Target size={18} color="#059669" /> Match Score Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                <span style={{ color: '#062D24', fontWeight: 600 }}>High Alignment (≥ 80% Match)</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>{stats.matchDist.high} ({Math.round((stats.matchDist.high / stats.total) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F0FDF4', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ width: `${Math.round((stats.matchDist.high / stats.total) * 100)}%`, height: '100%', background: '#059669', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                <span style={{ color: '#062D24', fontWeight: 600 }}>Moderate Alignment (65% - 79% Match)</span>
                <span style={{ fontWeight: 800, color: '#0D9488' }}>{stats.matchDist.medium} ({Math.round((stats.matchDist.medium / stats.total) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F0FDF4', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ width: `${Math.round((stats.matchDist.medium / stats.total) * 100)}%`, height: '100%', background: '#0D9488', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                <span style={{ color: '#062D24', fontWeight: 600 }}>Low Alignment (&lt; 65% Match)</span>
                <span style={{ fontWeight: 800, color: '#D97706' }}>{stats.matchDist.low} ({Math.round((stats.matchDist.low / stats.total) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F0FDF4', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ width: `${Math.round((stats.matchDist.low / stats.total) * 100)}%`, height: '100%', background: '#D97706', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Hiring Recommendations Distribution */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#062D24' }}>
            <TrendingUp size={18} color="#059669" /> Recommendation Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(stats.recDist).map(([rec, count], idx) => {
              const pct = Math.round((count / stats.total) * 100);
              const color = rec.toLowerCase().includes('hire') ? '#059669' :
                            rec.toLowerCase().includes('shortlist') ? '#0D9488' :
                            rec.toLowerCase().includes('reject') ? '#DC2626' : '#D97706';
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ color: '#062D24', fontWeight: 600 }}>{rec}</span>
                    <span style={{ fontWeight: 800, color }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#F0FDF4', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Skills Cloud */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px', color: '#062D24' }}>
          Skills Distribution Across Candidate Pool
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {stats.topSkills.map(([skill, count], idx) => {
            const pct = Math.round((count / stats.total) * 100);
            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#F0FDF4',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span style={{ fontWeight: 700, color: '#062D24', fontSize: '0.85rem' }}>{skill}</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: '#FFFFFF',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
