import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  GraduationCap, 
  Layers, 
  LayoutGrid, 
  List, 
  Target, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import CandidateCard from './CandidateCard';

export default function CandidateTable({ candidates, onSelectCandidate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatchFilter, setSelectedMatchFilter] = useState('ALL');
  const [selectedRecFilter, setSelectedRecFilter] = useState('ALL');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('match_score_pct');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');

  // Extract top skill badges for quick filtering
  const topSkills = useMemo(() => {
    const counts = {};
    candidates.forEach(c => {
      (c.key_skills || []).forEach(skill => {
        const clean = skill.trim();
        if (clean) counts[clean] = (counts[clean] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }, [candidates]);

  // Filter & sort candidate list
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const q = searchQuery.toLowerCase();
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const roleMatch = (c.target_role || '').toLowerCase().includes(q);
      const uniMatch = (c.university || '').toLowerCase().includes(q);
      const skillsMatch = (c.key_skills || []).some(s => s.toLowerCase().includes(q));
      const contactMatch = (c.contact_details || '').toLowerCase().includes(q);
      const matchesSearch = !q || nameMatch || roleMatch || uniMatch || skillsMatch || contactMatch;

      // Match % filter
      const score = c.match_score_pct ?? 70;
      let matchesScore = true;
      if (selectedMatchFilter === 'HIGH_MATCH') matchesScore = score >= 80;
      else if (selectedMatchFilter === 'MEDIUM_MATCH') matchesScore = score >= 65;
      else if (selectedMatchFilter === 'TOP_TIER') matchesScore = score >= 80 && (c.recommendation?.toLowerCase().includes('hire') || c.recommendation?.toLowerCase().includes('shortlist'));

      // Recommendation filter
      let matchesRec = true;
      if (selectedRecFilter !== 'ALL') {
        matchesRec = (c.recommendation || '').toLowerCase().includes(selectedRecFilter.toLowerCase());
      }

      // Skill filter
      const matchesSkill = selectedSkillFilter === 'ALL' || (c.key_skills || []).includes(selectedSkillFilter);

      return matchesSearch && matchesScore && matchesRec && matchesSkill;
    }).sort((a, b) => {
      let valA = a[sortBy] ?? 0;
      let valB = b[sortBy] ?? 0;

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [candidates, searchQuery, selectedMatchFilter, selectedRecFilter, selectedSkillFilter, sortBy, sortOrder]);

  const getMatchScoreBadge = (score) => {
    const val = score ?? 70;
    const colorCls = val >= 80 ? 'score-3' : val >= 65 ? 'score-2' : 'score-1';
    return (
      <span className={`score-badge ${colorCls}`}>
        <Target size={13} /> {val}% Match
      </span>
    );
  };

  const getRecBadge = (rec) => {
    const r = (rec || "Shortlist").toLowerCase();
    const style = r.includes('hire') ? { bg: '#064E3B', color: '#6EE7B7' } :
                  r.includes('shortlist') ? { bg: '#1E3A8A', color: '#93C5FD' } :
                  r.includes('reject') ? { bg: '#7F1D1D', color: '#FCA5A5' } :
                  { bg: '#78350F', color: '#FDE68A' };
    return (
      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, background: style.bg, color: style.color }}>
        {rec || "Shortlist"}
      </span>
    );
  };

  if (candidates.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <Layers size={48} color="#6366F1" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No Resumes Evaluated Yet</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '8px auto 0', fontSize: '0.9rem' }}>
          Upload PDF resumes above or sync from Google Drive to evaluate candidates against your customized Job Description and scoring criteria.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by candidate name, role, skills, university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Filter Selects */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <select
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={selectedMatchFilter}
              onChange={(e) => setSelectedMatchFilter(e.target.value)}
            >
              <option value="ALL">All Match Scores</option>
              <option value="HIGH_MATCH">🎯 High Match (≥ 80%)</option>
              <option value="MEDIUM_MATCH">Good Match (≥ 65%)</option>
            </select>

            <select
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={selectedRecFilter}
              onChange={(e) => setSelectedRecFilter(e.target.value)}
            >
              <option value="ALL">All Recommendations</option>
              <option value="hire">Strong Hire</option>
              <option value="shortlist">Shortlist</option>
              <option value="review">Review</option>
            </select>

            <select
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px' }}
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
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              padding: '2px'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'grid' ? '#FFF' : 'var(--text-muted)',
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
                  background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'table' ? '#FFF' : 'var(--text-muted)',
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Skills Filter:</span>
            <button
              onClick={() => setSelectedSkillFilter('ALL')}
              style={{
                fontSize: '0.75rem',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                background: selectedSkillFilter === 'ALL' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedSkillFilter === 'ALL' ? '#FFF' : 'var(--text-secondary)'
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
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: selectedSkillFilter === skill ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedSkillFilter === skill ? '#FFF' : 'var(--text-secondary)'
                }}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredCandidates.length}</strong> of <strong>{candidates.length}</strong> evaluated candidates
        </p>
      </div>

      {/* Grid or Table View */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredCandidates.map((candidate, idx) => (
            <CandidateCard 
              key={idx} 
              candidate={candidate} 
              onSelect={() => onSelectCandidate(candidate)} 
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Candidate</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Role</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Match Alignment</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Recommendation</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Academic Background</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate, idx) => (
                <tr 
                  key={idx}
                  onClick={() => onSelectCandidate(candidate)}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{candidate.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{candidate.source_file}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ color: '#818CF8', fontSize: '0.85rem', fontWeight: 500 }}>{candidate.target_role || 'General Role'}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {getMatchScoreBadge(candidate.match_score_pct)}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {getRecBadge(candidate.recommendation)}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div>{candidate.university}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {candidate.course} {candidate.year_of_study && `(${candidate.year_of_study})`}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <button 
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem'
                      }}
                    >
                      Fit Details <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
