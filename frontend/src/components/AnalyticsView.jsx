import React, { useMemo } from 'react';
import { Sparkles, Target, Users, Award, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AnalyticsView({ candidates }) {
  const stats = useMemo(() => {
    if (!candidates || candidates.length === 0) return null;

    const total = candidates.length;
    let sumMatch = 0;
    const matchDist = { high: 0, medium: 0, low: 0 };
    const recDist = {};
    const skillCounts = {};
    const uniCounts = {};

    candidates.forEach(c => {
      const mScore = c.match_score_pct ?? 70;
      sumMatch += mScore;

      if (mScore >= 80) matchDist.high += 1;
      else if (mScore >= 65) matchDist.medium += 1;
      else matchDist.low += 1;

      const rec = c.recommendation || "Shortlist";
      recDist[rec] = (recDist[rec] || 0) + 1;

      (c.key_skills || []).forEach(s => {
        const clean = s.trim();
        if (clean) skillCounts[clean] = (skillCounts[clean] || 0) + 1;
      });

      const uni = c.university || 'Not Specified';
      uniCounts[uni] = (uniCounts[uni] || 0) + 1;
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    const highMatchCount = matchDist.high;
    const highMatchPercent = Math.round((highMatchCount / total) * 100);

    return {
      total,
      avgMatch: (sumMatch / total).toFixed(1),
      highMatchCount,
      highMatchPercent,
      matchDist,
      recDist,
      topSkills
    };
  }, [candidates]);

  if (!stats) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          Please upload and evaluate resumes to view talent metrics and candidate alignment analytics.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Evaluated</span>
            <Users size={18} color="#818CF8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
            {stats.total} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>resumes</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Average Match Score</span>
            <Target size={18} color="#6366F1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#A5B4FC' }}>
            {stats.avgMatch}%
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Top Tier Match (≥ 80%)</span>
            <Award size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#34D399' }}>
            {stats.highMatchPercent}% <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({stats.highMatchCount} candidates)</span>
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
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="#818CF8" /> Role Alignment Match Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Strong Alignment (≥ 80% Match)</span>
                <span style={{ fontWeight: 600, color: '#34D399' }}>{stats.matchDist.high} ({Math.round((stats.matchDist.high / stats.total) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((stats.matchDist.high / stats.total) * 100)}%`, height: '100%', background: '#10B981', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Moderate Alignment (65% - 79% Match)</span>
                <span style={{ fontWeight: 600, color: '#60A5FA' }}>{stats.matchDist.medium} ({Math.round((stats.matchDist.medium / stats.total) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((stats.matchDist.medium / stats.total) * 100)}%`, height: '100%', background: '#3B82F6', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Low Alignment (&lt; 65% Match)</span>
                <span style={{ fontWeight: 600, color: '#FBBF24' }}>{stats.matchDist.low} ({Math.round((stats.matchDist.low / stats.total) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((stats.matchDist.low / stats.total) * 100)}%`, height: '100%', background: '#F59E0B', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Hiring Recommendations Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#06B6D4" /> Hiring Recommendations Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(stats.recDist).map(([rec, count], idx) => {
              const pct = Math.round((count / stats.total) * 100);
              const color = rec.toLowerCase().includes('hire') ? '#10B981' :
                            rec.toLowerCase().includes('shortlist') ? '#3B82F6' :
                            rec.toLowerCase().includes('reject') ? '#EF4444' : '#F59E0B';
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{rec}</span>
                    <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Skills Cloud */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
          Extracted Candidate Skills Pool
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
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{skill}</span>
                <span style={{
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  color: '#A5B4FC'
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
