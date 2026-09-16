import React from 'react';
import { FileSpreadsheet, Download, Code, Table } from 'lucide-react';

export default function ReportsScreen({ candidates, onExportExcel, isExporting }) {
  const exportJSON = () => {
    if (candidates.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(candidates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Resume_Analysis_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    if (candidates.length === 0) return;
    const headers = ["Candidate Name", "Target Role", "Match Score (%)", "Recommendation", "University", "Degree", "CGPA", "Skills"];
    const rows = candidates.map(c => [
      `"${c.name || ''}"`,
      `"${c.target_role || ''}"`,
      `"${c.match_score_pct || 70}%"`,
      `"${c.recommendation || ''}"`,
      `"${c.university || ''}"`,
      `"${c.course || ''}"`,
      `"${c.cgpa_percentage || ''}"`,
      `"${(c.key_skills || []).join(', ')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Resume_Analysis_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#062D24' }}>
          Reports & Export Center
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
          Generate formatted recruitment deliverables, audit reports, and structured datasets.
        </p>
      </div>

      {/* Export Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Multi-Sheet Excel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FFFFFF' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#062D24' }}>Excel Workbook (.xlsx)</h3>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Multi-Tab Formatted Report</span>
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#047857', lineHeight: 1.5, marginBottom: '16px', fontWeight: 500 }}>
              Includes separate styled sheets for <strong>Resume Analysis</strong>, <strong>Projects Breakdown</strong>, <strong>Skills Matrix</strong>, and <strong>Audit Logs</strong>.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={onExportExcel}
            disabled={isExporting || candidates.length === 0}
            style={{ width: '100%', padding: '12px' }}
          >
            <Download size={16} />
            <span>{isExporting ? 'Generating Report...' : `Download Multi-Sheet Excel (${candidates.length})`}</span>
          </button>
        </div>

        {/* CSV Export */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FFFFFF' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488', border: '1px solid rgba(20, 184, 166, 0.25)' }}>
                <Table size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#062D24' }}>Flat CSV Export (.csv)</h3>
                <span style={{ fontSize: '0.75rem', color: '#0D9488', fontWeight: 700 }}>Data Pipeline Ingestion</span>
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#047857', lineHeight: 1.5, marginBottom: '16px', fontWeight: 500 }}>
              Clean, comma-separated candidate rows for quick import into ATS systems, CRM spreadsheets, or Google Sheets.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={exportCSV}
            disabled={candidates.length === 0}
            style={{ width: '100%', padding: '12px', fontWeight: 700 }}
          >
            <Download size={16} /> Download CSV Dataset
          </button>
        </div>

        {/* JSON Export */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FFFFFF' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <Code size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#062D24' }}>Structured JSON (.json)</h3>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Raw API Payloads</span>
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#047857', lineHeight: 1.5, marginBottom: '16px', fontWeight: 500 }}>
              Complete candidate JSON schemas including raw text snippets, nested project objects, and LLM insights.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={exportJSON}
            disabled={candidates.length === 0}
            style={{ width: '100%', padding: '12px', fontWeight: 700 }}
          >
            <Download size={16} /> Download JSON Payload
          </button>
        </div>
      </div>

      {/* Live Data Preview Table */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: '#062D24' }}>
          Export Preview ({candidates.length} candidate rows)
        </h3>

        {candidates.length === 0 ? (
          <p style={{ color: '#047857', fontSize: '0.85rem', fontWeight: 500 }}>No data to preview. Screen resumes to generate export data.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: '#F0FDF4' }}>
                  <th style={{ padding: '10px 14px', color: '#062D24', fontWeight: 700 }}>Candidate Name</th>
                  <th style={{ padding: '10px 14px', color: '#062D24', fontWeight: 700 }}>Target Role</th>
                  <th style={{ padding: '10px 14px', color: '#062D24', fontWeight: 700 }}>Match Score</th>
                  <th style={{ padding: '10px 14px', color: '#062D24', fontWeight: 700 }}>Recommendation</th>
                  <th style={{ padding: '10px 14px', color: '#062D24', fontWeight: 700 }}>University</th>
                  <th style={{ padding: '10px 14px', color: '#062D24', fontWeight: 700 }}>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#062D24' }}>{c.name}</td>
                    <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 700 }}>{c.target_role || 'General'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#059669' }}>{c.match_score_pct ?? 75}%</td>
                    <td style={{ padding: '10px 14px', color: '#062D24', fontWeight: 600 }}>{c.recommendation}</td>
                    <td style={{ padding: '10px 14px', color: '#064E3B' }}>{c.university}</td>
                    <td style={{ padding: '10px 14px', color: '#064E3B' }}>{c.cgpa_percentage || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
