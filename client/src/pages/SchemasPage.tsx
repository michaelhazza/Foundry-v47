import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function SchemasPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const schemasList = await api.get('/api/canonical-schemas', {
        category: categoryFilter || undefined,
      });
      setSchemas(schemasList);
    } catch (err: any) {
      setError(err.message || 'Failed to load schemas');
    } finally {
      setLoading(false);
    }
  }

  async function handleViewSchema(id: string) {
    try {
      setError(null);
      const schema = await api.get(`/api/canonical-schemas/${id}`);
      setSelectedSchema(schema);
    } catch (err: any) {
      setError(err.message || 'Failed to load schema details');
    }
  }

  // Extract unique categories
  const categories = Array.from(new Set(schemas.map(s => s.category))).filter(Boolean);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Canonical Schemas</h1>
        <p>Browse and select from pre-built AI training data schemas</p>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Filter by Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px', fontSize: '14px' }}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {schemas.length === 0 ? (
        <p>No schemas found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {schemas.map((schema) => (
            <div
              key={schema.id}
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => handleViewSchema(schema.id)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{schema.name}</h3>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <strong>Category:</strong> {schema.category}
              </div>
              {schema.description && (
                <p style={{ fontSize: '14px', color: '#444', marginBottom: '10px' }}>
                  {schema.description}
                </p>
              )}
              {schema.isDefault && (
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '4px',
                }}>
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedSchema && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            width: '90%',
          }}>
            <h2>{selectedSchema.name}</h2>
            <button onClick={() => setSelectedSchema(null)} style={{ marginBottom: '15px' }}>
              Close
            </button>

            <div style={{ marginBottom: '15px' }}>
              <strong>Category:</strong> {selectedSchema.category}
            </div>

            {selectedSchema.description && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Description:</strong>
                <p>{selectedSchema.description}</p>
              </div>
            )}

            {selectedSchema.version && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Version:</strong> {selectedSchema.version}
              </div>
            )}

            {selectedSchema.isDefault && (
              <div style={{ marginBottom: '15px', color: '#4caf50' }}>
                This is a default schema
              </div>
            )}

            {selectedSchema.schemaDefinition && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Schema Definition:</strong>
                {selectedSchema.schemaDefinition.fields && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Field Name</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Type</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Required</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSchema.schemaDefinition.fields.map((field: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{field.name}</td>
                          <td style={{ padding: '10px' }}>{field.type}</td>
                          <td style={{ padding: '10px' }}>{field.required ? 'Yes' : 'No'}</td>
                          <td style={{ padding: '10px' }}>{field.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {selectedSchema.metadata && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Metadata:</strong>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
                  {JSON.stringify(selectedSchema.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
