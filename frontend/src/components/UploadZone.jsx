import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  Sliders, 
  Plus, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

const ROLE_PRESETS = {
  "aiml": {
    name: "AI/ML & Generative AI Specialist",
    jd: "Seeking an AI/ML Engineer with hands-on experience in Generative AI (LLMs, RAG, prompt engineering, fine-tuning), PyTorch/TensorFlow, Python, and deploying machine learning models into production.",
    criteria: ["GenAI & LLM Architecture", "Machine Learning & Modeling", "Python & Backend Systems", "Production & Deployment"]
  },
  "fullstack": {
    name: "Full-Stack Software Engineer",
    jd: "Looking for a Full-Stack Engineer skilled in modern web frameworks (React, Next.js, Node.js, Python/FastAPI), REST/GraphQL APIs, database architecture (SQL/NoSQL), and cloud infrastructure.",
    criteria: ["Frontend Engineering & UX", "Backend APIs & Databases", "System Architecture", "Code Quality & Testing"]
  },
  "product": {
    name: "Product Manager / Lead",
    jd: "Seeking an experienced Product Manager to drive roadmap strategy, customer discovery, cross-functional engineering collaboration, metrics tracking (OKRs/KPIs), and agile product execution.",
    criteria: ["Product Strategy & Roadmap", "User Research & Discovery", "Data & Metrics Analytics", "Cross-Functional Leadership"]
  },
  "marketing": {
    name: "Digital Marketing & Growth Lead",
    jd: "We need a Growth & Digital Marketer experienced in SEO/SEM, performance marketing, content strategy, marketing automation, conversion rate optimization (CRO), and campaign analytics.",
    criteria: ["Growth Marketing & Campaigns", "SEO / SEM & Paid Ads", "Analytics & Conversion", "Content & Brand Strategy"]
  },
  "finance": {
    name: "Financial Analyst / Controller",
    jd: "Looking for a Financial Analyst proficient in financial modeling, forecasting, budgeting, P&L analysis, Advanced Excel/SQL, and management reporting.",
    criteria: ["Financial Modeling & Valuation", "Budgeting & Forecasting", "Data Analysis & Excel/SQL", "Business Acumen & Reporting"]
  },
  "custom": {
    name: "Custom Role / Any Industry",
    jd: "",
    criteria: ["Domain & Role Expertise", "Practical Experience & Projects", "Technical & Soft Skills", "Problem Solving & Leadership"]
  }
};

export default function UploadZone({ onAnalyzeUpload, isAnalyzing, error }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  // Dynamic JD & Scoring State
  const [showCustomJD, setShowCustomJD] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("aiml");
  const [targetRole, setTargetRole] = useState(ROLE_PRESETS["aiml"].name);
  const [jobDescription, setJobDescription] = useState(ROLE_PRESETS["aiml"].jd);
  const [criteriaList, setCriteriaList] = useState(ROLE_PRESETS["aiml"].criteria);
  const [newCriterion, setNewCriterion] = useState("");

  const handlePresetChange = (key) => {
    setSelectedPreset(key);
    const preset = ROLE_PRESETS[key];
    if (preset) {
      setTargetRole(preset.name);
      setJobDescription(preset.jd);
      setCriteriaList([...preset.criteria]);
    }
  };

  const addCriterion = () => {
    if (newCriterion.trim() && !criteriaList.includes(newCriterion.trim())) {
      setCriteriaList([...criteriaList, newCriterion.trim()]);
      setNewCriterion("");
    }
  };

  const removeCriterion = (idx) => {
    setCriteriaList(criteriaList.filter((_, i) => i !== idx));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length < files.length) {
      alert("Only PDF files are supported.");
    }
    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(p => p.name));
      const newItems = pdfFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...newItems];
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) return;
    onAnalyzeUpload({
      files: selectedFiles,
      targetRole: targetRole.trim(),
      jobDescription: jobDescription.trim(),
      scoringCriteria: criteriaList
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="#818CF8" /> Batch Resume Upload & Scoring
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Upload candidate resumes to evaluate alignment against your specific role and scoring requirements.
          </p>
        </div>
        {selectedFiles.length > 0 && (
          <button 
            onClick={clearAll}
            disabled={isAnalyzing}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Clear list
          </button>
        )}
      </div>

      {/* Customizable Job Description & Scoring Accordion */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <div 
          onClick={() => setShowCustomJD(!showCustomJD)}
          style={{
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            background: 'rgba(99, 102, 241, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={18} color="#818CF8" />
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Job Description & Scoring Customization
              </span>
              <span style={{ fontSize: '0.8rem', color: '#A5B4FC', marginLeft: '10px' }}>
                Active Target: <strong>{targetRole}</strong>
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem' }}>{showCustomJD ? 'Collapse' : 'Customize JD & Rubric'}</span>
            {showCustomJD ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {showCustomJD && (
          <div style={{ padding: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Presets Row */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Select Role Template Preset
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetChange(key)}
                    style={{
                      fontSize: '0.8rem',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: selectedPreset === key ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selectedPreset === key ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: selectedPreset === key ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Role & JD Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '4px' }}>
                  Target Role Title
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Product Manager, Lead Growth Marketer, Data Analyst..."
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '4px' }}>
                  Paste Job Description / Requirements (Optional but Recommended)
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Paste the Job Description, required qualifications, key skills, and responsibilities here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Custom Evaluation Dimensions */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Scoring Dimensions (Rated 1 to 5)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {criteriaList.map((crit, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#C7D2FE',
                      fontSize: '0.8rem',
                      border: '1px solid rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {crit}
                    <button
                      type="button"
                      onClick={() => removeCriterion(idx)}
                      style={{ background: 'none', border: 'none', color: '#A5B4FC', cursor: 'pointer', display: 'flex' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  placeholder="Add custom criterion (e.g. Stakeholder Mgmt)..."
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addCriterion}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drop Zone Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.12)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '32px 20px',
          textAlign: 'center',
          background: dragActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(15, 23, 42, 0.4)',
          cursor: isAnalyzing ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <input 
          ref={inputRef}
          type="file" 
          multiple 
          accept=".pdf" 
          style={{ display: 'none' }} 
          onChange={handleFileInput}
          disabled={isAnalyzing}
        />
        
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <UploadCloud size={26} />
        </div>

        <div>
          <p style={{ fontWeight: 600, fontSize: '0.975rem', color: 'var(--text-primary)' }}>
            Drag & drop candidate PDF resumes here, or <span style={{ color: 'var(--primary)' }}>browse files</span>
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Will evaluate resumes against <strong>{targetRole}</strong>
          </p>
        </div>
      </div>

      {/* File Preview Chips */}
      {selectedFiles.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Selected Resumes ({selectedFiles.length}):</span>
            <span style={{ color: 'var(--text-muted)' }}>
              Total: {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            maxHeight: '140px',
            overflowY: 'auto',
            padding: '8px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--radius-sm)'
          }}>
            {selectedFiles.map((file, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                <FileText size={14} color="#818CF8" />
                <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
                {!isAnalyzing && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Trigger */}
          <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isAnalyzing || selectedFiles.length === 0}
              style={{ minWidth: '190px' }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Evaluating {selectedFiles.length} Resumes...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Evaluate {selectedFiles.length} Resumes
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
