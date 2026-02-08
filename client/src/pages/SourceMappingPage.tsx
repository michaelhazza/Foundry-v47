import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function SourceMappingPage() {
  const { projectId, dataSourceId } = useParams<{ projectId: string; dataSourceId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [dataSourceId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [sourceData, previewData, schemasList] = await Promise.all([
        api.get(`/api/data-sources/${dataSourceId}`),
        api.get(`/api/data-sources/${dataSourceId}/preview`, { rows: 5 }),
        api.get('/api/canonical-schemas'),
      ]);
      setDataSource(sourceData);
      setPreview(previewData);
      setSchemas(schemasList);

      // Initialize field mappings if exists
      if (sourceData.fieldMapping) {
        setFieldMappings(sourceData.fieldMapping);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSchemaSelect(schemaId: string) {
    try {
      setError(null);
      const schema = await api.get(`/api/canonical-schemas/${schemaId}`);
      setSelectedSchema(schema);
    } catch (err: any) {
      setError(err.message || 'Failed to load schema');
    }
  }

  async function handleSaveMapping(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      await api.patch(`/api/data-sources/${dataSourceId}`, {
        fieldMapping: fieldMappings,
        status: 'mapped',
      });
      alert('Field mapping saved successfully!');
      navigate(`/projects/${projectId}/sources/${dataSourceId}/preview`);
    } catch (err: any) {
      setError(err.message || 'Failed to save mapping');
    }
  }

  function handleFieldMapping(sourceField: string, targetField: string) {
    setFieldMappings(prev => ({
      ...prev,
      [sourceField]: targetField,
    }));
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const sourceColumns = preview?.columns || [];
  const schemaFields = selectedSchema?.schemaDefinition?.fields || [];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(`/projects/${projectId}/sources`)} style={{ marginRight: '10px' }}>
          Back to Sources
        </button>
        <h1>Configure Field Mapping</h1>
        <p>Data Source: {dataSource?.name}</p>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h2>1. Select Target Schema</h2>
        <select
          onChange={(e) => handleSchemaSelect(e.target.value)}
          value={selectedSchema?.id || ''}
          style={{ width: '100%', padding: '10px', fontSize: '14px' }}
        >
          <option value="">-- Select Schema --</option>
          {schemas.map((schema) => (
            <option key={schema.id} value={schema.id}>
              {schema.name} - {schema.category}
            </option>
          ))}
        </select>
      </div>

      {selectedSchema && (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h2>2. Data Preview</h2>
            {preview?.rows && preview.rows.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      {sourceColumns.map((col: string) => (
                        <th key={col} style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 5).map((row: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        {sourceColumns.map((col: string) => (
                          <td key={col} style={{ padding: '8px' }}>{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No preview data available</p>
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>3. Map Fields</h2>
            <form onSubmit={handleSaveMapping}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Source Column</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Target Field</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceColumns.map((col: string) => (
                    <tr key={col} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{col}</td>
                      <td style={{ padding: '10px' }}>
                        <select
                          value={fieldMappings[col] || ''}
                          onChange={(e) => handleFieldMapping(col, e.target.value)}
                          style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                        >
                          <option value="">-- Skip Field --</option>
                          {schemaFields.map((field: any) => (
                            <option key={field.name} value={field.name}>
                              {field.name} ({field.type})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '20px' }}>
                <button type="submit" style={{ marginRight: '10px', padding: '10px 20px' }}>
                  Save Mapping & Continue
                </button>
                <button type="button" onClick={() => navigate(`/projects/${projectId}/sources`)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
