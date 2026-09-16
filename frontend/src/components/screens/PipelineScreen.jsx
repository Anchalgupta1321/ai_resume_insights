import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  HelpCircle, 
  Mail, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Award,
  Layers
} from 'lucide-react';

const STAGES = [
  { id: 'screened', label: 'Screened & Ranked', color: '#059669', bg: '#ECFDF5' },
  { id: 'interviewing', label: 'Technical Round', color: '#0D9488', bg: '#F0FDFA' },
  { id: 'executive', label: 'Manager / Final', color: '#D97706', bg: '#FEF3C7' },
  { id: 'offered', label: 'Offer Extended', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'hired', label: 'Hired & Placed', color: '#10B981', bg: '#ECFDF5' },
  { id: 'rejected', label: 'Archived', color: '#DC2626', bg: '#FEF2F2' }
];

export default function PipelineScreen({ 
  candidates = [], 
  onUpdateCandidateStage, 
  onSelectCandidate,
  onOpenInterviewKit,
  onOpenOutreach
}) {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  const uniqueRoles = Array.from(new Set(candidates.map(c => c.target_role || 'General'))).filter(Boolean);

  const filteredCandidates = candidates.filter(c => {
    if (selectedRoleFilter !== 'ALL') {
      return (c.target_role || 'General') === selectedRoleFilter;
    }
    return true;
  });

  const getCandidatesByStage = (stageId) => {
    return filteredCandidates.filter(c => (c.pipeline_stage || 'screened') === stageId);
  };

  const moveCandidate = (candidate, direction) => {
    const currentIdx = STAGES.findIndex(s => s.id === (candidate.pipeline_stage || 'screened'));
    const newIdx = currentIdx + direction;
    if (newIdx >= 0 && newIdx < STAGES.length) {
      onUpdateCandidateStage(candidate, STAGES[newIdx].id);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#062D24' }}>
            Interactive Hiring Pipeline & ATS Workflow
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
            Manage candidate progression across recruitment stages with real-time status updates.
          </p>
        </div>

        {/* Role Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064E3B' }}>Filter by Role:</span>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '8px 14px', background: '#FFFFFF', color: '#062D24', fontWeight: 600 }}
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles ({candidates.length} candidates)</option>
            {uniqueRoles.map((r, idx) => (
              <option key={idx} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${STAGES.length}, minmax(280px, 1fr))`,
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '24px',
        minHeight: '620px'
      }}>
        {STAGES.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.id);

          return (
            <div 
              key={stage.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                boxShadow: '0 4px 16px rgba(6, 78, 59, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '720px'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '16px 18px',
                borderBottom: '1px solid rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: stage.bg,
                borderTopLeftRadius: 'var(--radius-lg)',
                borderTopRightRadius: 'var(--radius-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stage.color }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#062D24' }}>
                    {stage.label}
                  </h3>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  color: stage.color,
                  border: `1px solid ${stage.color}40`
                }}>
                  {stageCandidates.length}
                </span>
              </div>

              {/* Candidates List in Column */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {stageCandidates.length === 0 ? (
                  <div style={{ padding: '40px 10px', textAlign: 'center', color: '#047857', fontSize: '0.8rem', fontStyle: 'italic' }}>
                    No candidates in this stage
                  </div>
                ) : (
                  stageCandidates.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectCandidate(c)}
                      style={{
                        background: '#F8FAF9',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: '0 2px 6px rgba(6, 78, 59, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#059669';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                      }}
                    >
                      {/* Name & Match */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#062D24', lineHeight: 1.2 }}>
                            {c.name}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                            {c.target_role || 'General'}
                          </p>
                        </div>

                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: '#ECFDF5',
                          color: '#065F46',
                          border: '1px solid rgba(16, 185, 129, 0.35)'
                        }}>
                          {c.match_score_pct ?? 75}%
                        </span>
                      </div>

                      {/* Uni / Education */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#064E3B' }}>
                        <GraduationCap size={13} color="#059669" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.university}
                        </span>
                      </div>

                      {/* Quick Action Buttons */}
                      <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(16, 185, 129, 0.15)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => onOpenInterviewKit(c)}
                            title="Generate Interview Questions"
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '6px',
                              padding: '3px 6px',
                              color: '#059669',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}
                          >
                            <Sparkles size={11} /> Kit
                          </button>

                          <button
                            onClick={() => onOpenOutreach(c)}
                            title="Compose Outreach Email"
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '6px',
                              padding: '3px 6px',
                              color: '#0D9488',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}
                          >
                            <Mail size={11} /> Email
                          </button>
                        </div>

                        {/* Step Advance Controls */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {stage.id !== 'screened' && (
                            <button
                              onClick={() => moveCandidate(c, -1)}
                              title="Move to Previous Stage"
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '4px',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#062D24'
                              }}
                            >
                              <ChevronLeft size={14} />
                            </button>
                          )}

                          {stage.id !== 'rejected' && stage.id !== 'hired' && (
                            <button
                              onClick={() => moveCandidate(c, 1)}
                              title="Advance to Next Stage"
                              style={{
                                background: '#059669',
                                border: 'none',
                                borderRadius: '4px',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#FFFFFF'
                              }}
                            >
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
