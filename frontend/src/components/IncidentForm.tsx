import { useState } from 'react';
import type { Severity, IncidentResponse } from '../types';

interface Props {
  hasSelection: boolean;
  onSubmit: (title: string, severity: Severity) => Promise<IncidentResponse>;
}

export function IncidentForm({ hasSelection, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<Severity>('P3');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IncidentResponse | null>(null);

  const isValid = title.trim().length > 0 && hasSelection;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await onSubmit(title.trim(), severity);
      setResult(response);

      if (response.status === 'ok') {
        setTitle('');
        setSeverity('P3');
      }
    } catch (error) {
      setResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create incident',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Raise Incident</h2>

      {result && (
        <div className={`alert alert-${result.status === 'ok' ? 'success' : 'error'}`}>
          {result.status === 'ok' ? (
            <>
              Incident created successfully!
              {result.grafana_incident_url && (
                <>
                  {' '}
                  <a href={result.grafana_incident_url} target="_blank" rel="noopener noreferrer">
                    View in Grafana IRM ({result.grafana_incident_id})
                  </a>
                </>
              )}
            </>
          ) : (
            <>Error: {result.message}</>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Incident Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Describe the incident..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="severity">Severity *</label>
          <select
            id="severity"
            value={severity}
            onChange={e => setSeverity(e.target.value as Severity)}
          >
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - Major</option>
            <option value="P3">P3 - Minor</option>
            <option value="P4">P4 - Minor</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isValid || loading}
        >
          {loading ? 'Creating...' : 'Raise'} {!loading && '\uD83D\uDD25'}
        </button>

        {!hasSelection && (
          <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
            Please select at least one application or capability
          </p>
        )}
      </form>
    </div>
  );
}
