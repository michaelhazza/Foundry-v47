import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';

interface Schema {
  id: string;
  name: string;
  description?: string;
  version: string;
}

const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schemaId, setSchemaId] = useState('');
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSchemas, setFetchingSchemas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchSchemas();
  }, [navigate]);

  const fetchSchemas = async () => {
    try {
      setFetchingSchemas(true);
      const data = await api.get<{ schemas: Schema[] }>(
        '/api/canonical-schemas'
      );
      setSchemas(data.schemas || []);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load schemas');
    } finally {
      setFetchingSchemas(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.post<{ project: { id: string } }>(
        '/api/projects',
        {
          name,
          description,
          schemaId: schemaId || undefined,
        }
      );

      navigate(`/projects/${data.project.id}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px' }}>Create New Project</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Start by creating a new project to organize your data sources and
        processing workflows
      </p>

      {error && (
        <div
          style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="name"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Customer Data Integration"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="description"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the purpose of this project..."
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label
            htmlFor="schemaId"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Canonical Schema (Optional)
          </label>
          {fetchingSchemas ? (
            <div style={{ padding: '10px', color: '#666', fontSize: '14px' }}>
              Loading schemas...
            </div>
          ) : (
            <select
              id="schemaId"
              value={schemaId}
              onChange={(e) => setSchemaId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="">Select a schema (optional)</option>
              {schemas.map((schema) => (
                <option key={schema.id} value={schema.id}>
                  {schema.name} (v{schema.version})
                  {schema.description && ` - ${schema.description}`}
                </option>
              ))}
            </select>
          )}
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
            Select a predefined schema to standardize your data structure
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading || !name}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: loading || !name ? '#90caf9' : '#1976d2',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !name ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectPage;
