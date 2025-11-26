import { useState, useEffect } from 'react';
import type { ApplicationResponse, CapabilityResponse } from '../../types';
import { createCapability, updateCapability } from '../../services/api';
import { TagInput } from './TagInput';

interface Props {
  application: ApplicationResponse;
  capability?: CapabilityResponse | null;
  onSave: () => void;
  onCancel: () => void;
}

export function CapabilityForm({ application, capability, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!capability;

  useEffect(() => {
    if (capability) {
      setName(capability.name);
      setDescription(capability.description || '');
      setTags(capability.tags);
    } else {
      setName('');
      setDescription('');
      setTags([]);
    }
  }, [capability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await updateCapability(capability!.id, { name, description, tags });
      } else {
        await createCapability({
          application_id: application.id,
          name,
          description,
          tags,
        });
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save capability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>
        {isEdit ? 'Edit Capability' : 'Create Capability'}
        <span style={{ fontWeight: 400, fontSize: '0.9rem', marginLeft: '0.5rem' }}>
          ({application.name})
        </span>
      </h3>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Tags</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
