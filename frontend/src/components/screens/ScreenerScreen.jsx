import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  X, 
  Sparkles, 
  Sliders, 
  Plus, 
  AlertCircle, 
  Loader2,
  Code
} from 'lucide-react';

const ROLE_PRESETS = {
  ai_specialist: {
    name: 'AI / ML Specialist',
    target_role: 'AI/ML & Generative AI Specialist',
    job_description: `Seeking an experienced AI/ML Engineer with expertise in Python, PyTorch, Large Language Models (LLMs), RAG pipelines, fine-tuning, vector databases, and MLOps deployment. Strong problem-solving and production AI development background required.`,
    criteria: ['LLM & GenAI Expertise', 'PyTorch / Python Mastery', 'RAG & Vector Search', 'MLOps & Deployment', 'System Design']
  },
  frontend_lead: {
    name: 'Frontend Architect',
    target_role: 'Senior React / Frontend Architect',
    job_description: `Looking for a Senior Frontend Engineer proficient in React, Next.js, TypeScript, state management, CSS architectures, performance optimization, and REST/GraphQL integrations. Experience with modern design systems and enterprise web applications is required.`,
    criteria: ['React & Next.js Architecture', 'TypeScript & State Flow', 'CSS / UI Design Systems', 'Web Performance', 'REST / GraphQL Integration']
  },
  fullstack_dev: {
    name: 'Full Stack Engineer',
    target_role: 'Senior Full Stack Developer',
    job_description: `Seeking a versatile Full Stack Developer experienced in FastAPI/Node.js backend microservices, modern React frontends, PostgreSQL/MongoDB databases, Docker containerization, and AWS/Cloud deployments.`,
    criteria: ['Backend API & Python/Node', 'Frontend React Architecture', 'Database Optimization', 'Docker & DevOps', 'System Architecture']
  },
  product_manager: {
    name: 'Technical PM',
    target_role: 'Technical Product Manager',
    job_description: `Seeking a Technical Product Manager with experience leading agile engineering teams, defining product roadmaps, translating customer requirements into technical PRDs, and driving data-informed feature launches.`,
    criteria: ['Product Strategy & Roadmapping', 'Technical Architecture Fluency', 'Agile & Cross-team Leadership', 'User Research & Analytics', 'Execution & Delivery']
  },
  data_scientist: {
    name: 'Data Scientist',
    target_role: 'Senior Data Scientist & Analytics',
    job_description: `Looking for a Data Scientist skilled in statistical modeling, Python (pandas, scikit-learn), SQL, predictive analytics, A/B experimentation, and building end-to-end machine learning data pipelines.`,
    criteria: ['Statistical Modeling & Python', 'SQL & Data Wrangling', 'Predictive ML Modeling', 'A/B Testing & Insights', 'Business Communication']
  }
};

export default function ScreenerScreen({ 
  onAnalysisSuccess, 
  apiKey, 
  modelName, 
  targetRole: parentRole, 
  setTargetRole: setParentRole 
}) {
  const [selectedPreset, setSelectedPreset] = useState('ai_specialist');
  const [targetRole, setTargetRole] = useState(parentRole || ROLE_PRESETS.ai_specialist.target_role);
  const [jobDescription, setJobDescription] = useState(ROLE_PRESETS.ai_specialist.job_description);
  const [criteriaList, setCriteriaList] = useState(ROLE_PRESETS.ai_specialist.criteria);
  const [newCriterion, setNewCriterion] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const inputRef = useRef(null);

  const handlePresetChange = (key) => {
    const preset = ROLE_PRESETS[key];
    if (preset) {
      setSelectedPreset(key);
      setTargetRole(preset.target_role);
      setJobDescription(preset.job_description);
      setCriteriaList([...preset.criteria]);
      if (setParentRole) setParentRole(preset.target_role);
    }
  };

  const addCriterion = () => {
    if (newCriterion.trim() && !criteriaList.includes(newCriterion.trim())) {
      setCriteriaList([...criteriaList, newCriterion.trim()]);
      setNewCriterion('');
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
    const pdfs = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfs.length < files.length) {
      setError('Only PDF resumes are supported. Non-PDF files were omitted.');
    } else {
      setError(null);
    }
    setSelectedFiles(prev => [...prev, ...pdfs]);
  };

  const removeFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select at least one PDF resume to evaluate.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    formData.append('target_role', targetRole);
    formData.append('job_description', jobDescription);
    formData.append('criteria', JSON.stringify(criteriaList));

    const storedKey = apiKey || localStorage.getItem('AI_API_KEY') || '';
    const storedModel = modelName || localStorage.getItem('AI_MODEL') || '';
    const storedProvider = localStorage.getItem('AI_PROVIDER') || 'groq';

    if (storedKey) formData.append('api_key', storedKey);
    if (storedModel) formData.append('model_name', storedModel);
    if (storedProvider) formData.append('provider', storedProvider);

    try {
      const res = await fetch('/api/analyze/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (data.results && data.results.length > 0) {
        onAnalysisSuccess(data.results, targetRole);
      } else {
        setError('No candidate evaluations returned. Please check the PDF contents and API key.');
      }
    } catch (err) {
      setError(`Analysis Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#062D24' }}>
          Batch Screener & Job Requirement Studio
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
          Define custom job criteria, upload resume batches, and run automated AI evaluations.
        </p>
      </div>

      {/* Grid: Left Column (JD Builder) + Right Column (Upload Zone) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) minmax(360px, 1fr)', gap: '24px' }}>
        {/* Left Column: Job Description & Criteria Builder */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', background: '#FFFFFF' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#062D24' }}>
              <Sliders size={18} color="#059669" /> 1. Target Role & Job Description
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
              Select a preset or customize the role requirements.
            </p>
          </div>

          {/* Role Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#064E3B' }}>
              Quick Role Presets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetChange(key)}
                  style={{
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: selectedPreset === key ? '1px solid #059669' : '1px solid rgba(16, 185, 129, 0.25)',
                    background: selectedPreset === key ? '#059669' : '#F0FDF4',
                    color: selectedPreset === key ? '#FFFFFF' : '#062D24',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Target Role Title Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '4px', color: '#064E3B' }}>
              Target Role Title
            </label>
            <input
              type="text"
              className="form-input"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Lead Product Manager, Senior AI Engineer..."
              style={{ background: '#F8FAF9', color: '#062D24', fontWeight: 600 }}
            />
          </div>

          {/* JD Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '4px', color: '#064E3B' }}>
              Job Description / Key Requirements
            </label>
            <textarea
              className="form-input"
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description, responsibilities, and required competencies..."
              style={{ fontSize: '0.825rem', lineHeight: 1.4, background: '#F8FAF9', color: '#062D24', fontWeight: 500 }}
            />
          </div>

          {/* Scoring Dimensions */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '6px', color: '#064E3B' }}>
              Scoring Rubric Dimensions (1 to 5 Scale)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {criteriaList.map((crit, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#ECFDF5',
                    color: '#065F46',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    border: '1px solid rgba(16, 185, 129, 0.35)'
                  }}
                >
                  {crit}
                  <button
                    type="button"
                    onClick={() => removeCriterion(idx)}
                    style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', display: 'flex' }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.825rem', background: '#F8FAF9', color: '#062D24', fontWeight: 600 }}
                placeholder="Add custom criterion..."
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addCriterion}
                style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700 }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Ingestion & Drag and Drop Queue */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FFFFFF' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#062D24' }}>
                  <UploadCloud size={18} color="#059669" /> 2. Upload Candidate Resumes
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
                  Supports multiple PDF files concurrently.
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <button 
                  onClick={clearAll}
                  disabled={isAnalyzing}
                  style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                >
                  Clear all
                </button>
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
                border: `2px dashed ${dragActive ? '#059669' : 'rgba(16, 185, 129, 0.35)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '36px 20px',
                textAlign: 'center',
                background: dragActive ? '#ECFDF5' : '#F0FDF4',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
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
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
              }}>
                <UploadCloud size={28} />
              </div>

              <div>
                <p style={{ fontWeight: 700, fontSize: '0.975rem', color: '#062D24' }}>
                  Drag & drop PDF resumes here, or <span style={{ color: '#059669', textDecoration: 'underline' }}>browse files</span>
                </p>
                <p style={{ fontSize: '0.775rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
                  Fast multi-threaded processing via Groq Engine
                </p>
              </div>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.825rem' }}>
                  <span style={{ color: '#064E3B', fontWeight: 600 }}>Selected Files ({selectedFiles.length}):</span>
                  <span style={{ color: '#047857', fontWeight: 600 }}>
                    {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '8px',
                  background: '#F8FAF9',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  {selectedFiles.map((file, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#FFFFFF',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.825rem',
                        border: '1px solid rgba(16, 185, 129, 0.15)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <FileText size={15} color="#059669" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: '#062D24' }}>
                          {file.name}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#047857', fontSize: '0.75rem', fontWeight: 500 }}>
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                        {!isAnalyzing && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex' }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: '#FEF2F2',
                color: '#DC2626',
                fontSize: '0.825rem',
                border: '1px solid rgba(220, 38, 38, 0.25)',
                fontWeight: 500
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isAnalyzing || selectedFiles.length === 0}
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Evaluating {selectedFiles.length} Resumes with Groq AI...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Evaluate {selectedFiles.length} Resumes against "{targetRole}"
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
