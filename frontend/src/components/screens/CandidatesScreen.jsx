import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Layers, 
  Target, 
  CheckSquare, 
  Square, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Scale
} from 'lucide-react';
import CandidateCard from '../CandidateCard';

export default function CandidatesScreen({ 
  candidates = [], 
  onSelectCandidate, 
  onNavigateScreen,
  selectedForCompare = [],
  onToggleCompare,
  onOpenInterviewKit,
  onOpenOutreach,
  onOpenCopilot
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatchFilter, setSelectedMatchFilter] = useState('ALL');
  const [selectedRecFilter, setSelectedRecFilter] = useState('ALL');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('match_score_pct');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Extract all unique skills across candidates
  const topSkills = useMemo(() => {
    const counts = {};
    candidates.forEach(c => {
      if (Array.isArray(c.technical_skills)) {
        c.technical_skills.forEach(s => {
          counts[s] = (counts[s] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill]) => skill);
  }, [candidates]);

  // Filtering & Sorting
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesRole = c.target_role?.toLowerCase().includes(q);
        const matchesUni = c.university?.toLowerCase().includes(q);
        const matchesSkills = (c.technical_skills || []).some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesRole && !matchesUni && !matchesSkills) return false;
      }

      // Match % Filter
      const matchScore = c.match_score_pct ?? 0;
      if (selectedMatchFilter === 'HIGH_MATCH' && matchScore < 80) return false;
      if (selectedMatchFilter === 'MEDIUM_MATCH' && matchScore < 65) return false;

      // Recommendation Filter
      if (selectedRecFilter !== 'ALL') {
        const r = (c.recommendation || '').toLowerCase();
        if (!r.includes(selectedRecFilter.toLowerCase())) return false;
      }

      // Skill Filter
      if (selectedSkillFilter !== 'ALL') {
        const hasSkill = (c.technical_skills || []).includes(selectedSkillFilter);
        if (!hasSkill) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      valA = valA ?? 0;
      valB = valB ?? 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [candidates, searchQuery, selectedMatchFilter, selectedRecFilter, selectedSkillFilter, sortBy, sortOrder]);

  const getMatchScoreBadge = (score) => {
    const s = score ?? 75;
    const bg = s >= 80 ? '#ECFDF5' : s >= 65 ? '#F0FDFA' : '#FEF3C7';
    const color = s >= 80 ? '#065F46' : s >= 65 ? '#0F766E' : '#92400E';
    const border = s >= 80 ? '1px solid rgba(16, 185, 129, 0.45)' : s >= 65 ? '1px solid rgba(20, 184, 166, 0.45)' : '1px solid rgba(245, 158, 11, 0.45)';
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800, background: bg, color, border }}>
        <Target size={13} /> {s}% Match
      </span>
    );
  };

  const getRecBadge = (rec) => {
    const r = (rec || 'Shortlist').toLowerCase();
    const bg = r.includes('strong') || r.includes('hire') ? '#ECFDF5' : r.includes('shortlist') ? '#F0FDF4' : r.includes('reject') ? '#FEF2F2' : '#FEF3C7';
    const color = r.includes('strong') || r.includes('hire') ? '#065F46' : r.includes('shortlist') ? '#047857' : r.includes('reject') ? '#991B1B' : '#92400E';
    const border = r.includes('strong') || r.includes('hire') ? '1px solid #10B981' : r.includes('shortlist') ? '1px solid #34D399' : r.includes('reject') ? '1px solid #F87171' : '1px solid #FBBF24';
    return (
      <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, background: bg, color, border }}>
        {rec || 'Shortlist'}
      </span>
    );
  };

  if (candidates.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', background: '#FFFFFF' }}>
        <Layers size={48} color="#059669" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#062D24' }}>No Resumes in Roster</h3>
        <p style={{ color: '#047857', maxWidth: '480px', margin: '8px auto 18px', fontSize: '0.9rem', fontWeight: 500 }}>
          Evaluate resumes in the Batch Screener to populate your talent pool.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigateScreen('screener')}>
          Go to Screener Studio
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '440px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#059669' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px', background: '#F8FAF9', color: '#062D24', fontWeight: 600 }}
              placeholder="Search candidate name, role, skills, university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Filter Selects */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <select
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px', background: '#F8FAF9', color: '#062D24', fontWeight: 600 }}
              value={selectedMatchFilter}
              onChange={(e) => setSelectedMatchFilter(e.target.value)}
            >
              <option value="ALL">All Match Scores</option>
              <option value="HIGH_MATCH">🎯 High Match (≥ 80%)</option>
              <option value="MEDIUM_MATCH">Good Match (≥ 65%)</option>
            </select>

            <select
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px', background: '#F8FAF9', color: '#062D24', fontWeight: 600 }}
              value={selectedRecFilter}
              onChange={(e) => setSelectedRecFilter(e.target.value)}
            >
              <option value="ALL">All Recommendations</option>
              <option value="hire">Strong Hire</option>
              <option value="shortlist">Shortlist</option>
              <option value="review">Review</option>
              <option value="reject">Reject</option>
            </select>

            <select
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px', background: '#F8FAF9', color: '#062D24', fontWeight: 600 }}
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortBy(f);
                setSortOrder(o);
              }}
            >
              <option value="match_score_pct-desc">Sort: Highest Match %</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              background: '#F0FDF4',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '2px'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? '#059669' : 'transparent',
                  color: viewMode === 'grid' ? '#FFF' : '#047857',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? '#059669' : 'transparent',
                  color: viewMode === 'table' ? '#FFF' : '#047857',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Skill Filter Chips */}
        {topSkills.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: '#064E3B', whiteSpace: 'nowrap', fontWeight: 700 }}>Skills Filter:</span>
            <button
              onClick={() => setSelectedSkillFilter('ALL')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                background: selectedSkillFilter === 'ALL' ? '#059669' : '#F0FDF4',
                color: selectedSkillFilter === 'ALL' ? '#FFF' : '#062D24'
              }}
            >
              All
            </button>
            {topSkills.map(skill => (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(skill === selectedSkillFilter ? 'ALL' : skill)}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedSkillFilter === skill ? '1px solid #059669' : '1px solid rgba(16, 185, 129, 0.25)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: selectedSkillFilter === skill ? '#059669' : '#FFFFFF',
                  color: selectedSkillFilter === skill ? '#FFF' : '#062D24'
                }}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comparison floating banner if candidates are selected */}
      {selectedForCompare && selectedForCompare.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #E6F7F0 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 14px rgba(6, 78, 59, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 700, color: '#062D24' }}>
            <Scale size={18} color="#059669" />
            <span><strong>{selectedForCompare.length}</strong> candidate{selectedForCompare.length > 1 ? 's' : ''} selected for comparison</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => onNavigateScreen('compare')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Launch Comparison Matrix &rarr;
          </button>
        </div>
      )}

      {/* Candidate Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <p style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>
          Showing <strong>{filteredCandidates.length}</strong> of <strong>{candidates.length}</strong> candidates in talent pool
        </p>
      </div>

      {/* Grid vs Table */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredCandidates.map((candidate, idx) => {
            const isSelected = selectedForCompare?.some(c => c.name === candidate.name);
            return (
              <div key={idx} style={{ position: 'relative' }}>
                <CandidateCard 
                  candidate={candidate} 
                  onSelect={() => onSelectCandidate(candidate)} 
                  onOpenInterviewKit={onOpenInterviewKit}
                  onOpenOutreach={onOpenOutreach}
                />
                
                {/* Compare Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(candidate);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '160px',
                    background: isSelected ? '#ECFDF5' : '#FFFFFF',
                    border: isSelected ? '1px solid #059669' : '1px solid rgba(16, 185, 129, 0.3)',
                    color: isSelected ? '#059669' : '#047857',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    zIndex: 2
                  }}
                >
                  {isSelected ? <CheckSquare size={13} color="#059669" /> : <Square size={13} />}
                  <span>{isSelected ? 'Selected' : 'Compare'}</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', background: '#FFFFFF' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: '#F0FDF4' }}>
                <th style={{ padding: '14px 18px', width: '40px' }}>Select</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#062D24' }}>Candidate</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#062D24' }}>Target Role</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#062D24' }}>Match Alignment</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#062D24' }}>Recommendation</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#062D24' }}>Academic Background</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#062D24' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate, idx) => {
                const isSelected = selectedForCompare?.some(c => c.name === candidate.name);
                return (
                  <tr 
                    key={idx}
                    onClick={() => onSelectCandidate(candidate)}
                    style={{
                      borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F0FDF4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 18px' }} onClick={(e) => e.stopPropagation()}>
                       <button
                        onClick={() => onToggleCompare(candidate)}
                        style={{ background: 'none', border: 'none', color: isSelected ? '#059669' : '#047857', cursor: 'pointer', display: 'flex' }}
                      >
                        {isSelected ? <CheckSquare size={16} color="#059669" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#062D24' }}>{candidate.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#047857' }}>{candidate.source_file}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 700 }}>{candidate.target_role || 'General Role'}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {getMatchScoreBadge(candidate.match_score_pct)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {getRecBadge(candidate.recommendation)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#062D24' }}>{candidate.university}</div>
                      <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                        {candidate.course} {candidate.year_of_study && `(${candidate.year_of_study})`}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {onOpenInterviewKit && (
                          <button
                            onClick={() => onOpenInterviewKit(candidate)}
                            style={{ background: '#ECFDF5', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '4px 8px', color: '#059669', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            Kit
                          </button>
                        )}
                        {onOpenOutreach && (
                          <button
                            onClick={() => onOpenOutreach(candidate)}
                            style={{ background: '#F0FDFA', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '6px', padding: '4px 8px', color: '#0D9488', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            Email
                          </button>
                        )}
                        <button 
                          onClick={() => onSelectCandidate(candidate)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#059669',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '0.8rem'
                          }}
                        >
                          Profile <ChevronRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
