import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  HelpCircle, 
  MessageSquare,
  FileText,
  ChevronRight
} from 'lucide-react';

export default function CopilotDrawer({ 
  isOpen, 
  onClose, 
  candidate, 
  candidatesCount,
  targetRole
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your AI Recruitment Copilot. ${candidate ? `Ask me anything about ${candidate.name}'s technical background, verified projects, timeline, or fit for ${targetRole || candidate.target_role || 'the role'}.` : `Ask me anything about your active screening pool of ${candidatesCount || 0} candidates.`}`,
      suggested_followups: [
        "What are their top 3 architectural strengths?",
        "Are there any resume gaps or missing competencies?",
        "Summarize their most complex project in 2 bullets",
        "How do they compare against the role requirements?"
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (candidate) {
      setMessages([
        {
          role: 'assistant',
          content: `Candidate Context Loaded: **${candidate.name}** (${candidate.match_score_pct}% match for ${targetRole || candidate.target_role || 'the role'}). How can I assist you with this profile?`,
          suggested_followups: [
            `Analyze ${candidate.name}'s system design depth`,
            "Check for any timeline anomalies or missing skills",
            "Draft a 2-sentence summary for the hiring manager",
            "What technical questions should I probe them on?"
          ]
        }
      ]);
    }
  }, [candidate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isSending) return;

    const userMsg = { role: 'user', content: textToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsSending(true);

    const storedKey = localStorage.getItem('AI_API_KEY') || '';
    const storedProvider = localStorage.getItem('AI_PROVIDER') || 'groq';

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend.trim(),
          candidate: candidate || null,
          talent_pool_summary: !candidate ? `Total candidates: ${candidatesCount || 0}. Target role: ${targetRole || 'General'}` : null,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          api_key: storedKey,
          provider: storedProvider
        })
      });

      if (!res.ok) {
        throw new Error("Failed to get response from AI Copilot.");
      }

      const data = await res.json();
      const assistantMsg = {
        role: 'assistant',
        content: data.answer || "I have analyzed the profile based on the resume text.",
        citations: data.citations || [],
        suggested_followups: data.suggested_followups || []
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}. Please verify your API key in Settings.`
      }]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '560px',
          padding: '24px'
        }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Bot size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#062D24' }}>AI Resume Copilot</h3>
              <p style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 500 }}>
                {candidate ? `Context: ${candidate.name} (${candidate.match_score_pct}% Match)` : 'Talent Pool Intelligence'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: '#F0FDF4',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#062D24',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Thread */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: msg.role === 'user' ? '#059669' : '#ECFDF5',
                color: msg.role === 'user' ? '#FFFFFF' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: msg.role === 'user' ? 'none' : '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>

              <div style={{
                maxWidth: '82%',
                background: msg.role === 'user' ? '#059669' : '#F0FDF4',
                color: msg.role === 'user' ? '#FFFFFF' : '#062D24',
                padding: '12px 16px',
                borderRadius: '14px',
                fontSize: '0.875rem',
                lineHeight: 1.45,
                border: msg.role === 'user' ? 'none' : '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 2px 6px rgba(6, 78, 59, 0.04)'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.75rem', color: '#047857' }}>
                    <strong>Resume Citations:</strong>
                    <ul style={{ paddingLeft: '14px', marginTop: '2px' }}>
                      {msg.citations.map((c, cIdx) => (
                        <li key={cIdx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-up Prompts */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                      Suggested Follow-ups:
                    </span>
                    {msg.suggested_followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(f)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          color: '#064E3B',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#ECFDF5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                      >
                        <span>{f}</span>
                        <ChevronRight size={12} color="#059669" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#047857', fontSize: '0.8rem', paddingLeft: '8px' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing resume records with Groq AI...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              className="form-input"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask anything about ${candidate ? candidate.name : 'talent pool'}...`}
              disabled={isSending}
              style={{ background: '#F8FAF9', color: '#062D24', fontWeight: 500, fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSending || !inputQuery.trim()}
              style={{ padding: '0 16px' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
