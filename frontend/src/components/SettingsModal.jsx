import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle, Loader2, Sparkles, Zap } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey, modelName, setModelName }) {
  const [provider, setProvider] = useState(() => localStorage.getItem('AI_PROVIDER') || 'groq');
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(modelName || 'llama-3.3-70b-versatile');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey.trim());
    setModelName(tempModel);
    localStorage.setItem('AI_PROVIDER', provider);
    localStorage.setItem('AI_API_KEY', tempKey.trim());
    localStorage.setItem('AI_MODEL', tempModel);
    onClose();
  };

  const handleValidate = async () => {
    if (!tempKey.trim()) {
      setValidationResult({ valid: false, message: 'Please enter an API key to validate.' });
      return;
    }
    setIsValidating(true);
    setValidationResult(null);
    try {
      const formData = new FormData();
      formData.append('api_key', tempKey.trim());
      formData.append('provider', provider);
      const res = await fetch('/api/config/validate-key', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (err) {
      setValidationResult({ valid: false, message: `Validation error: ${err.message}` });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399'
            }}>
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>AI Provider & API Settings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Select AI engine and configure API keys
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Provider Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              AI Intelligence Engine
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setProvider('groq');
                  setTempModel('llama-3.3-70b-versatile');
                }}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'groq' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: provider === 'groq' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Zap size={18} color="#10B981" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Groq AI (Active)</div>
                  <div style={{ fontSize: '0.7rem', color: '#34D399' }}>Fast & Unlimited</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setTempModel('gemini-1.5-flash');
                }}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'gemini' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: provider === 'gemini' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={18} color="#14B8A6" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Google Gemini</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gemini Flash</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              {provider === 'groq' ? 'Groq API Key' : 'Google Gemini API Key'}
            </label>
            <input
              type="password"
              className="form-input"
              placeholder={provider === 'groq' ? 'gsk_...' : 'AIzaSy...'}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Saved in environment file <code style={{ color: '#34D399' }}>.env</code>
            </p>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: validationResult.valid ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: validationResult.valid ? 'var(--success)' : 'var(--danger)',
              fontSize: '0.85rem'
            }}>
              {validationResult.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{validationResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleValidate}
              disabled={isValidating}
              style={{ fontSize: '0.85rem' }}
            >
              {isValidating ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Verifying...
                </>
              ) : (
                'Test Key'
              )}
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSave}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
