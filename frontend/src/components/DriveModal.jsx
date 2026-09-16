import React, { useState } from 'react';
import { X, Cloud, Key, Folder, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function DriveModal({ isOpen, onClose, onSyncDrive, isAnalyzing }) {
  const [folderId, setFolderId] = useState('');
  const [targetRole, setTargetRole] = useState('AI/ML & Generative AI Specialist');
  const [jobDescription, setJobDescription] = useState('');
  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [parseError, setParseError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setParseError('');

    if (!folderId.trim()) {
      setParseError('Please provide a Google Drive Folder ID.');
      return;
    }

    let parsedCreds = null;
    if (serviceAccountJson.trim()) {
      try {
        parsedCreds = JSON.parse(serviceAccountJson);
      } catch (err) {
        setParseError('Invalid Service Account JSON format. Please paste valid JSON.');
        return;
      }
    }

    onSyncDrive({
      folder_id: folderId.trim(),
      target_role: targetRole.trim(),
      job_description: jobDescription.trim(),
      service_account_json: parsedCreds
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setServiceAccountJson(event.target.result);
      };
      reader.readAsText(file);
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
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06B6D4'
            }}>
              <Cloud size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Sync Google Drive Folder</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Import and evaluate resumes against your role from Drive
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '4px' }}>
              Google Drive Folder ID *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 1k8DS8dmm3fmUuwRIxv-g16SSI4GtB69P"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '4px' }}>
              Target Role Title
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Product Manager, AI/ML Engineer, Growth Lead..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '4px' }}>
              Job Description / Requirements (Optional)
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Paste JD requirements or leave blank to evaluate general role fit..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isAnalyzing}
              style={{ fontSize: '0.825rem' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                Service Account Credentials (JSON)
              </label>
              <label style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                Upload .json file
                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
            <textarea
              className="form-input"
              rows={3}
              placeholder='Leave empty to use local Credentails_file.json...'
              value={serviceAccountJson}
              onChange={(e) => setServiceAccountJson(e.target.value)}
              disabled={isAnalyzing}
              style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            />
          </div>

          {parseError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontSize: '0.825rem'
            }}>
              <AlertCircle size={15} />
              <span>{parseError}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isAnalyzing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isAnalyzing}
              style={{ minWidth: '140px' }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Importing...
                </>
              ) : (
                <>
                  <Cloud size={16} />
                  Fetch & Evaluate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
