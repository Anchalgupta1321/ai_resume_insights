import React, { useState } from 'react';
import { 
  X, 
  Target, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Code, 
  Briefcase, 
  TrendingUp,
  Layers,
  Sparkles,
  Mail,
  Bot,
  ShieldCheck,
  AlertTriangle,
  FileText,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';

export default function CandidateDrawer({ 
  candidate, 
  onClose,
  onOpenInterviewKit,
  onOpenOutreach,
  onOpenCopilot,
  onUpdateCandidateStage
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'rematch' | 'raw_pdf'
  const [rematchResults, setRematchResults] = useState(null);
  const [isRematching, setIsRematching] = useState(false);
  const [rematchError, setRematchError] = useState(null);

  if (!candidate) return null;

  const matchScore = candidate.match_score_pct ?? 75;
  const recommendation = candidate.recommendation || "Shortlist";
  const scores = candidate.evaluation_scores || {};
  const matchedSkills = candidate.matched_skills || candidate.key_skills || [];
  const missingSkills = candidate.missing_skills || [];
  const projects = candidate.supporting_info?.projects || [];
  const internships = candidate.supporting_info?.internships || [];
  const certifications = candidate.supporting_info?.certifications || [];
  const risk = candidate.risk_assessment || {
    authenticity_score: 92,
    metric_impact_score: 85,
    buzzword_density_score: 18,
    risk_flags: [],
    authenticity_summary: "High confidence resume with verified achievements and metrics."
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 65) return '#0D9488';
    return '#D97706';
  };

  const getRecBadgeStyle = (rec) => {
    const r = (rec || '').toLowerCase();
    if (r.includes('strong') || r.includes('hire')) return { bg: '#ECFDF5', color: '#065F46', border: '1px solid #10B981' };
    if (r.includes('shortlist')) return { bg: '#F0FDF4', color: '#047857', border: '1px solid #34D399' };
    if (r.includes('reject')) return { bg: '#FEF2F2', color: '#991B1B', border: '1px solid #F87171' };
    return { bg: '#FEF3C7', color: '#92400E', border: '1px solid #FBBF24' };
  };

  const handleRunMultiRoleRematch = async () => {
    setIsRematching(true);
    setRematchError(null);
    const storedKey = localStorage.getItem('AI_API_KEY') || '';
    const storedProvider = localStorage.getItem('AI_PROVIDER') || 'groq';

    try {
      const res = await fetch('/api/rematch/multi-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate,
          api_key: storedKey,
          provider: storedProvider
        })
      });

      if (!res.ok) throw new Error("Failed to calculate multi-role compatibility.");
      const data = await res.json();
      setRematchResults(data);
    } catch (err) {
      setRematchError(err.message);
    } finally {
      setIsRematching(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 32px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#062D24' }}>
              {candidate.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#059669', marginTop: '2px', fontWeight: 700 }}>
              Target Role: {candidate.target_role || 'Evaluated Role'}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
              Source File: <code style={{ color: '#064E3B', background: '#F0FDF4', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{candidate.source_file}</code>
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: '#F0FDF4',
              border: '1px solid var(--border-color)',
              color: '#062D24',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Enterprise Action Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          paddingBottom: '16px',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
          flexWrap: 'wrap'
        }}>
          <button
            className="btn btn-primary"
            onClick={() => onOpenInterviewKit && onOpenInterviewKit(candidate)}
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <Sparkles size={14} /> Interview Kit
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => onOpenOutreach && onOpenOutreach(candidate)}
            style={{ padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Mail size={14} color="#059669" /> Compose Outreach
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => onOpenCopilot && onOpenCopilot(candidate)}
            style={{ padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Bot size={14} color="#0D9488" /> Ask AI Copilot
          </button>

          {/* Stage Selector */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>Stage:</span>
            <select
              className="form-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.78rem', background: '#F0FDF4', color: '#062D24', fontWeight: 700 }}
              value={candidate.pipeline_stage || 'screened'}
              onChange={(e) => onUpdateCandidateStage && onUpdateCandidateStage(candidate, e.target.value)}
            >
              <option value="screened">Screened & Ranked</option>
              <option value="interviewing">Technical Round</option>
              <option value="executive">Manager Round</option>
              <option value="offered">Offer Extended</option>
              <option value="hired">Hired</option>
              <option value="rejected">Archived</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              background: activeTab === 'overview' ? '#059669' : '#F0FDF4',
              color: activeTab === 'overview' ? '#FFFFFF' : '#062D24'
            }}
          >
            Profile & Competencies
          </button>

          <button
            onClick={() => {
              setActiveTab('rematch');
              if (!rematchResults) handleRunMultiRoleRematch();
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              background: activeTab === 'rematch' ? '#059669' : '#F0FDF4',
              color: activeTab === 'rematch' ? '#FFFFFF' : '#062D24'
            }}
          >
            Multi-Role Recycling
          </button>

          <button
            onClick={() => setActiveTab('raw_pdf')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              background: activeTab === 'raw_pdf' ? '#059669' : '#F0FDF4',
              color: activeTab === 'raw_pdf' ? '#FFFFFF' : '#062D24'
            }}
          >
            Parsed PDF Text
          </button>
        </div>

        {/* Tab Content Container */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'overview' && (
            <>
              {/* Match Score & Recommendation Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #E6F7F0 60%, #D1FAE5 100%)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.06)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', marginBottom: '4px' }}>
                    <Target size={18} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Role Alignment Fit</span>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: getMatchScoreColor(matchScore) }}>
                    {matchScore}% <span style={{ fontSize: '1rem', color: '#047857', fontWeight: 600 }}>Match</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#047857', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Hiring Recommendation
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    ...getRecBadgeStyle(recommendation)
                  }}>
                    {recommendation}
                  </span>
                </div>
              </div>

              {/* Authenticity & Anomaly Radar Card */}
              <div className="glass-panel" style={{ padding: '18px', background: '#FFFFFF' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#062D24', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#059669" /> Resume Authenticity & Anomaly Scanner
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: '#F0FDF4', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Authenticity Index</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                      {risk.authenticity_score}%
                    </div>
                  </div>

                  <div style={{ background: '#F0FDF4', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Metric Impact Score</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0D9488', marginTop: '2px' }}>
                      {risk.metric_impact_score}%
                    </div>
                  </div>

                  <div style={{ background: '#F0FDF4', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Buzzword Density</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: risk.buzzword_density_score > 40 ? '#D97706' : '#059669', marginTop: '2px' }}>
                      {risk.buzzword_density_score}%
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#064E3B', lineHeight: 1.4 }}>
                  {risk.authenticity_summary}
                </p>

                {risk.risk_flags && risk.risk_flags.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {risk.risk_flags.map((flag, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', color: '#DC2626', fontWeight: 600 }}>
                        <AlertTriangle size={13} /> {flag}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fit Summary Assessment */}
              {candidate.fit_summary && (
                <div className="glass-panel" style={{ padding: '16px 20px', background: '#FFFFFF' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#064E3B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={16} color="#059669" /> AI Executive Fit Assessment
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#062D24', lineHeight: 1.5, fontWeight: 500 }}>
                    {candidate.fit_summary}
                  </p>
                </div>
              )}

              {/* Dynamic Criteria Breakdown (1-5 Scale) */}
              {Object.keys(scores).length > 0 && (
                <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064E3B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} color="#059669" /> Evaluated Scoring Dimensions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(scores).map(([crit, val], idx) => {
                      const pct = (val / 5) * 100;
                      const barColor = val >= 4 ? '#059669' : val === 3 ? '#0D9488' : '#D97706';
                      return (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                            <span style={{ color: '#062D24', fontWeight: 600 }}>{crit}</span>
                            <span style={{ fontWeight: 800, color: barColor }}>{val} / 5</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#F0FDF4', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.4s' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matched vs Missing Requirements Comparison */}
              {(matchedSkills.length > 0 || missingSkills.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  {/* Matched Requirements */}
                  {matchedSkills.length > 0 && (
                    <div className="glass-panel" style={{ padding: '18px', background: '#FFFFFF' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} color="#059669" /> Matched Role Competencies ({matchedSkills.length})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {matchedSkills.map((s, idx) => (
                          <span 
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: '#ECFDF5',
                              color: '#065F46',
                              border: '1px solid rgba(16, 185, 129, 0.35)'
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Requirements */}
                  {missingSkills.length > 0 && (
                    <div className="glass-panel" style={{ padding: '18px', background: '#FFFFFF' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#DC2626', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <XCircle size={16} color="#DC2626" /> Missing / Unverified Skills ({missingSkills.length})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {missingSkills.map((s, idx) => (
                          <span 
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: '#FEF2F2',
                              color: '#991B1B',
                              border: '1px solid rgba(239, 68, 68, 0.35)'
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Projects Breakdown */}
              {projects.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064E3B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={16} color="#059669" /> Projects & Key Deliverables ({projects.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {projects.map((proj, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: '#F0FDF4',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 16px'
                        }}
                      >
                        <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#062D24' }}>
                          {proj.name}
                        </h5>
                        <p style={{ fontSize: '0.825rem', color: '#047857', margin: '6px 0 10px', lineHeight: 1.4, fontWeight: 500 }}>
                          {proj.description}
                        </p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {proj.technologies.map((t, tIdx) => (
                              <span 
                                key={tIdx}
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: '#FFFFFF',
                                  color: '#065F46',
                                  border: '1px solid rgba(16, 185, 129, 0.2)'
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships Breakdown */}
              {internships.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064E3B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={16} color="#059669" /> Internships & Practical Experience ({internships.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {internships.map((intern, idx) => (
                      <div key={idx} style={{ background: '#F0FDF4', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '0.85rem', color: '#062D24', fontWeight: 500 }}>
                        {typeof intern === 'string' ? intern : JSON.stringify(intern)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications Breakdown */}
              {certifications.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064E3B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} color="#059669" /> Certifications & Credentials ({certifications.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {certifications.map((cert, idx) => (
                      <div key={idx} style={{ background: '#ECFDF5', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.8rem', color: '#065F46', fontWeight: 600 }}>
                        🏆 {typeof cert === 'string' ? cert : JSON.stringify(cert)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Multi-Role Rematch Tab */}
          {activeTab === 'rematch' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#062D24' }}>Cross-Role Talent Mobility Re-Matching</h3>
                  <p style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 500 }}>
                    AI analysis of {candidate.name}'s alignment across other organizational benchmark roles.
                  </p>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={handleRunMultiRoleRematch}
                  disabled={isRematching}
                  style={{ fontSize: '0.8rem', fontWeight: 700 }}
                >
                  <RefreshCw size={14} style={{ animation: isRematching ? 'spin 1s linear infinite' : 'none' }} />
                  Re-evaluate
                </button>
              </div>

              {isRematching && (
                <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                  <RefreshCw size={32} color="#059669" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>Calculating cross-role match matrix with Groq AI...</p>
                </div>
              )}

              {rematchError && (
                <div style={{ padding: '12px', background: '#FEF2F2', border: '1px solid #EF4444', color: '#991B1B', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {rematchError}
                </div>
              )}

              {rematchResults && !isRematching && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rematchResults.best_fit_role && (
                    <div style={{ background: '#ECFDF5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #10B981', color: '#065F46', fontSize: '0.875rem', fontWeight: 700 }}>
                      🌟 Best-Fit Alternative Role: <strong>{rematchResults.best_fit_role}</strong>
                    </div>
                  )}

                  {rematchResults.matches?.map((m, idx) => (
                    <div 
                      key={idx}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#062D24' }}>
                          {m.role_name}
                        </h4>

                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: m.match_score_pct >= 80 ? '#ECFDF5' : '#F0FDFA',
                          color: m.match_score_pct >= 80 ? '#065F46' : '#0D9488',
                          border: '1px solid rgba(16, 185, 129, 0.35)'
                        }}>
                          {m.match_score_pct}% Match ({m.fit_level})
                        </span>
                      </div>

                      <p style={{ fontSize: '0.825rem', color: '#064E3B', lineHeight: 1.4 }}>
                        {m.recommendation_reason}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        {m.matched_skills?.map((s, sIdx) => (
                          <span key={sIdx} style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#ECFDF5', color: '#065F46', fontWeight: 600 }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Raw PDF Text Tab */}
          {activeTab === 'raw_pdf' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#062D24' }}>Parsed Resume Raw Text Content</h3>
              <div style={{
                background: '#F8FAF9',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.8rem',
                color: '#062D24',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                maxHeight: '450px',
                overflowY: 'auto'
              }}>
                {candidate.raw_text || "Full raw text parsed from PDF."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
