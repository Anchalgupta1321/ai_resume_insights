import React, { useState } from 'react';
import { Cpu, CheckCircle2, AlertCircle, Loader2, Sparkles, Zap, ShieldCheck, Cloud } from 'lucide-react';

export default function SettingsScreen({ apiKey, setApiKey, modelName, setModelName }) {
  const [provider, setProvider] = useState(() => localStorage.getItem('AI_PROVIDER') || 'groq');
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(modelName || 'groq/compound-mini');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setApiKey(tempKey.trim());
    setModelName(tempModel);
    localStorage.setItem('AI_PROVIDER', provider);
    localStorage.setItem('AI_API_KEY', tempKey.trim());
    localStorage.setItem('AI_MODEL', tempModel);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#062D24' }}>
          Engine & Integration Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
          Configure AI intelligence models, API keys, and external service connectors.
        </p>
      </div>

      {savedSuccess && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: '#ECFDF5',
          border: '1px solid #10B981',
          color: '#065F46',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.875rem',
          fontWeight: 700
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>Settings saved and applied successfully!</span>
        </div>
      )}

      {/* AI Provider Section */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFFFFF' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#062D24' }}>
            <Cpu size={18} color="#059669" /> 1. Select AI Intelligence Provider
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
            Choose the model provider for parsing, scoring, and matching resumes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <button
            type="button"
            onClick={() => {
              setProvider('groq');
              setTempModel('groq/compound-mini');
            }}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: provider === 'groq' ? '2px solid #059669' : '1px solid rgba(16, 185, 129, 0.25)',
              background: provider === 'groq' ? '#ECFDF5' : '#FFFFFF',
              color: '#062D24',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#062D24' }}>Groq AI (Recommended)</div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>Lightning Fast &bull; Active</div>
              <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
                Ultra-low latency JSON evaluation with unlimited free tier.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setProvider('gemini');
              setTempModel('gemini-1.5-flash');
            }}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: provider === 'gemini' ? '2px solid #059669' : '1px solid rgba(16, 185, 129, 0.25)',
              background: provider === 'gemini' ? '#ECFDF5' : '#FFFFFF',
              color: '#062D24',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488', flexShrink: 0 }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#062D24' }}>Google Gemini</div>
              <div style={{ fontSize: '0.75rem', color: '#0D9488', fontWeight: 700, marginTop: '2px' }}>Gemini 1.5 Flash / 2.0</div>
              <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
                Google's multimodal generative language model.
              </div>
            </div>
          </button>
        </div>

        {/* API Key Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#062D24' }}>
            {provider === 'groq' ? 'Groq API Key' : 'Google Gemini API Key'}
          </label>
          <input
            type="password"
            className="form-input"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder={provider === 'groq' ? 'gsk_...' : 'AIzaSy...'}
            style={{ background: '#F8FAF9', color: '#062D24', fontWeight: 600 }}
          />
          <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
            Stored securely in your local environment configuration (<code style={{ color: '#059669', fontWeight: 700 }}>.env</code>)
          </p>
        </div>

        {/* Validation Result Box */}
        {validationResult && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: validationResult.valid ? '#ECFDF5' : '#FEF2F2',
            border: validationResult.valid ? '1px solid #10B981' : '1px solid #EF4444',
            color: validationResult.valid ? '#065F46' : '#991B1B',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            {validationResult.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{validationResult.message}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(16, 185, 129, 0.15)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleValidate}
            disabled={isValidating}
            style={{ fontSize: '0.85rem', fontWeight: 700 }}
          >
            {isValidating ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Verifying Key with Server...
              </>
            ) : (
              'Test API Key'
            )}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            style={{ padding: '10px 24px', fontSize: '0.9rem' }}
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Google Drive Status */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#062D24', marginBottom: '12px' }}>
          <Cloud size={18} color="#059669" /> Google Drive Service Account
        </h3>
        <p style={{ fontSize: '0.825rem', color: '#047857', lineHeight: 1.5, fontWeight: 500 }}>
          Default Service Account file <code style={{ color: '#059669', fontWeight: 700 }}>Credentails_file.json</code> is recognized and loaded automatically for cloud folder imports.
        </p>
      </div>
    </div>
  );
}
