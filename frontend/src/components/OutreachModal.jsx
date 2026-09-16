import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const EMAIL_TEMPLATES = [
  { id: 'interview_invite', label: 'Technical Interview Invite', icon: Sparkles, desc: 'Invite candidate for technical round referencing top projects' },
  { id: 'phone_screen', label: 'Initial Phone Screen', icon: Mail, desc: 'Schedule preliminary 20-min recruiter screening' },
  { id: 'polite_rejection', label: 'Constructive Feedback Rejection', icon: CheckCircle2, desc: 'Warm rejection acknowledging strengths with constructive tone' },
  { id: 'offer_letter', label: 'Offer Letter Summary', icon: ExternalLink, desc: 'Congratulations on selection and onboarding overview' }
];

export default function OutreachModal({ 
  isOpen, 
  onClose, 
  candidate, 
  companyName = "Enterprise Talent Solutions" 
}) {
  const [emailType, setEmailType] = useState('interview_invite');
  const [customNote, setCustomNote] = useState('');
  const [senderName, setSenderName] = useState('Hiring Team');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && candidate) {
      composeEmail(emailType);
    } else {
      setGeneratedSubject('');
      setGeneratedBody('');
      setError(null);
    }
  }, [isOpen, candidate]);

  const composeEmail = async (typeToUse) => {
    setIsComposing(true);
    setError(null);
    const storedKey = localStorage.getItem('AI_API_KEY') || '';
    const storedProvider = localStorage.getItem('AI_PROVIDER') || 'groq';

    try {
      const res = await fetch('/api/outreach/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate,
          email_type: typeToUse || emailType,
          custom_note: customNote.trim() || null,
          sender_name: senderName,
          company_name: companyName,
          api_key: storedKey,
          provider: storedProvider
        })
      });

      if (!res.ok) {
        throw new Error("Failed to compose outreach email.");
      }

      const data = await res.json();
      setGeneratedSubject(data.subject || `Opportunity with ${companyName}`);
      setGeneratedBody(data.body_text || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsComposing(false);
    }
  };

  const handleTypeChange = (typeId) => {
    setEmailType(typeId);
    composeEmail(typeId);
  };

  const handleCopy = () => {
    const fullText = `Subject: ${generatedSubject}\n\n${generatedBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLaunchEmailClient = () => {
    const contact = candidate?.contact_details || '';
    const emailMatch = contact.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const toAddress = emailMatch ? emailMatch[1] : '';

    const mailtoUrl = `mailto:${toAddress}?subject=${encodeURIComponent(generatedSubject)}&body=${encodeURIComponent(generatedBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  if (!isOpen || !candidate) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '760px',
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
              <Mail size={13} color="#059669" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase' }}>
                AI Candidate Outreach Composer
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#062D24' }}>
              Personalized Email: <span style={{ color: '#059669' }}>{candidate.name}</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
              Target Role: <strong>{candidate.target_role || 'General'}</strong> &bull; Match: <strong>{candidate.match_score_pct}%</strong>
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

        {/* Template Selector Chips */}
        <div style={{ padding: '16px 0 10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {EMAIL_TEMPLATES.map((tmpl) => {
            const isSelected = emailType === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleTypeChange(tmpl.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid #059669' : '1px solid rgba(16, 185, 129, 0.25)',
                  background: isSelected ? '#059669' : '#F0FDF4',
                  color: isSelected ? '#FFFFFF' : '#062D24',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tmpl.label}
              </button>
            );
          })}
        </div>

        {/* Email Editor Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
          {isComposing && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Loader2 size={32} color="#059669" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>Composing personalized draft with Groq AI...</p>
            </div>
          )}

          {error && (
            <div style={{ padding: '12px', background: '#FEF2F2', border: '1px solid #EF4444', color: '#991B1B', borderRadius: '8px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {!isComposing && (
            <>
              {/* Subject Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#064E3B', marginBottom: '4px' }}>
                  Email Subject Line
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={generatedSubject}
                  onChange={(e) => setGeneratedSubject(e.target.value)}
                  style={{ background: '#F8FAF9', color: '#062D24', fontWeight: 600, fontSize: '0.875rem' }}
                />
              </div>

              {/* Body Textarea */}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#064E3B', marginBottom: '4px' }}>
                  Email Body Content
                </label>
                <textarea
                  className="form-input"
                  rows={9}
                  value={generatedBody}
                  onChange={(e) => setGeneratedBody(e.target.value)}
                  style={{ background: '#F8FAF9', color: '#062D24', fontSize: '0.85rem', lineHeight: 1.45 }}
                />
              </div>

              {/* Optional Custom Note / Regeneration */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add custom notes (e.g. mention salary range, remote policy, date)..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  style={{ fontSize: '0.8rem', background: '#FFFFFF' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => composeEmail(emailType)}
                  style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  <Sparkles size={14} color="#059669" /> Regenerate
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleCopy}
              disabled={!generatedBody || isComposing}
              style={{ fontSize: '0.85rem', fontWeight: 700 }}
            >
              {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleLaunchEmailClient}
              disabled={!generatedBody || isComposing}
              style={{ fontSize: '0.85rem', fontWeight: 700 }}
            >
              <ExternalLink size={16} /> Open in Email App
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
