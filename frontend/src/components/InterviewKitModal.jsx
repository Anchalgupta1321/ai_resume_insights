import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Copy, 
  Check, 
  AlertCircle,
  Loader2,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function InterviewKitModal({ 
  isOpen, 
  onClose, 
  candidate, 
  targetRole, 
  jobDescription 
}) {
  const [kit, setKit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('technical'); // 'technical' | 'behavioral' | 'probing'
  const [candidateScores, setCandidateScores] = useState({});
  const [interviewerNotes, setInterviewerNotes] = useState('');

  useEffect(() => {
    if (isOpen && candidate) {
      generateKit();
    } else {
      setKit(null);
      setError(null);
      setCandidateScores({});
      setInterviewerNotes('');
    }
  }, [isOpen, candidate]);

  const generateKit = async () => {
    setIsLoading(true);
    setError(null);

    const storedKey = localStorage.getItem('AI_API_KEY') || '';
    const storedProvider = localStorage.getItem('AI_PROVIDER') || 'groq';

    try {
      const res = await fetch('/api/interview-kit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate,
          target_role: targetRole || candidate.target_role || "Software Engineer",
          job_description: jobDescription,
          api_key: storedKey,
          provider: storedProvider
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to generate interview kit.");
      }

      const data = await res.json();
      setKit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyQuestions = () => {
    if (!kit) return;
    const allQ = [
      `=== INTERVIEW CHEAT SHEET FOR ${kit.candidate_name} (${kit.target_role}) ===\n`,
      `Focus Areas: ${(kit.interview_focus_areas || []).join(', ')}\n\n`,
      `--- TECHNICAL & ARCHITECTURAL QUESTIONS ---`,
      ...(kit.technical_questions || []).map((q, idx) => `\n${idx + 1}. [${q.category}] ${q.question}\n   Context: ${q.context_from_resume}\n   Expected Rubric: ${q.expected_answer_rubric}\n   Tip: ${q.interviewer_tip || ''}`),
      `\n\n--- BEHAVIORAL & OWNERSHIP QUESTIONS ---`,
      ...(kit.behavioral_questions || []).map((q, idx) => `\n${idx + 1}. [${q.category}] ${q.question}\n   Context: ${q.context_from_resume}\n   Expected Rubric: ${q.expected_answer_rubric}`),
      `\n\n--- GAP PROBING QUESTIONS ---`,
      ...(kit.probing_questions || []).map((q, idx) => `\n${idx + 1}. [${q.category}] ${q.question}\n   Context: ${q.context_from_resume}\n   Expected Rubric: ${q.expected_answer_rubric}`)
    ].join('\n');

    navigator.clipboard.writeText(allQ);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !candidate) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 32px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', padding: '3px 10px', borderRadius: '9999px', marginBottom: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <Sparkles size={13} color="#059669" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase' }}>
                AI Tailored Interview Kit
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#062D24' }}>
              Interview Cheat Sheet & Rubric: <span style={{ color: '#059669' }}>{candidate.name}</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
              Role: <strong>{targetRole || candidate.target_role || "Software Engineer"}</strong> &bull; Match: <strong>{candidate.match_score_pct}%</strong>
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: '#F0FDF4',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#062D24',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLoading && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Loader2 size={36} color="#059669" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#062D24' }}>Generating Tailored Questions...</h4>
              <p style={{ fontSize: '0.85rem', color: '#047857', maxWidth: '400px', margin: '6px auto 0' }}>
                Analyzing {candidate.name}'s verified projects and missing competency gaps with Groq AI.
              </p>
            </div>
          )}

          {error && (
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: '#FEF2F2', border: '1px solid #EF4444', color: '#991B1B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <AlertCircle size={18} />
                <span>Generation Error</span>
              </div>
              <p style={{ fontSize: '0.825rem', marginTop: '4px' }}>{error}</p>
              <button className="btn btn-secondary" onClick={generateKit} style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                Retry Generation
              </button>
            </div>
          )}

          {kit && !isLoading && (
            <>
              {/* Focus Areas Pill Bar */}
              <div style={{
                background: '#F0FDF4',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#059669" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#062D24' }}>
                    Recommended Duration: <strong>{kit.suggested_duration_mins} mins</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>Focus Areas:</span>
                  {(kit.interview_focus_areas || []).map((area, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        color: '#065F46',
                        border: '1px solid rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tab Selector */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '8px' }}>
                <button
                  onClick={() => setActiveTab('technical')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    background: activeTab === 'technical' ? '#059669' : '#F0FDF4',
                    color: activeTab === 'technical' ? '#FFFFFF' : '#062D24',
                    transition: 'all 0.15s'
                  }}
                >
                  Technical & System Architecture ({kit.technical_questions?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('behavioral')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    background: activeTab === 'behavioral' ? '#059669' : '#F0FDF4',
                    color: activeTab === 'behavioral' ? '#FFFFFF' : '#062D24',
                    transition: 'all 0.15s'
                  }}
                >
                  Behavioral & Leadership ({kit.behavioral_questions?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('probing')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    background: activeTab === 'probing' ? '#059669' : '#F0FDF4',
                    color: activeTab === 'probing' ? '#FFFFFF' : '#062D24',
                    transition: 'all 0.15s'
                  }}
                >
                  Skill Gap Probing ({kit.probing_questions?.length || 0})
                </button>
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {((activeTab === 'technical' ? kit.technical_questions : activeTab === 'behavioral' ? kit.behavioral_questions : kit.probing_questions) || []).map((q, idx) => {
                  const scoreKey = `${activeTab}_${idx}`;
                  const currentScore = candidateScores[scoreKey] || 0;

                  return (
                    <div 
                      key={idx}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '18px 20px',
                        boxShadow: '0 2px 8px rgba(6, 78, 59, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                            {q.category} &bull; {q.difficulty}
                          </span>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#062D24', marginTop: '2px', lineHeight: 1.35 }}>
                            {idx + 1}. {q.question}
                          </h4>
                        </div>

                        {/* 1-5 Score Evaluator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F0FDF4', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>Rating:</span>
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              onClick={() => setCandidateScores(prev => ({ ...prev, [scoreKey]: val }))}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '4px',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                background: currentScore === val ? '#059669' : '#FFFFFF',
                                color: currentScore === val ? '#FFFFFF' : '#062D24'
                              }}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Resume Context */}
                      <div style={{ background: '#F8FAF9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#064E3B' }}>
                        <strong>Resume Context:</strong> {q.context_from_resume}
                      </div>

                      {/* Expected Rubric */}
                      <div style={{ fontSize: '0.825rem', color: '#062D24', lineHeight: 1.45 }}>
                        <strong style={{ color: '#059669' }}>Expected 5/5 Answer Rubric:</strong> {q.expected_answer_rubric}
                      </div>

                      {q.interviewer_tip && (
                        <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HelpCircle size={14} /> Tip: {q.interviewer_tip}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Interviewer Notes Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#062D24', marginBottom: '6px' }}>
                  Live Interviewer Notes & Observations
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={interviewerNotes}
                  onChange={(e) => setInterviewerNotes(e.target.value)}
                  placeholder="Type notes on communication clarity, technical depth, and overall recommendation..."
                  style={{ background: '#F8FAF9', color: '#062D24', fontSize: '0.85rem' }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleCopyQuestions}
              disabled={!kit}
              style={{ fontSize: '0.85rem', fontWeight: 700 }}
            >
              {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Kit Questions'}</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={handlePrint}
              disabled={!kit}
              style={{ fontSize: '0.85rem', fontWeight: 700 }}
            >
              <Printer size={16} /> Print Cheat Sheet
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: '0.875rem' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
