import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function SourcePreviewPage() {
  const { projectId, dataSourceId } = useParams<{ projectId: string; dataSourceId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [deIdentConfig, setDeIdentConfig] = useState<any>({
    enabled: false,
    rules: [],
  });
  const [selectedField, setSelectedField] = useState('');
  const [deIdentMethod, setDeIdentMethod] = useState('mask');

  useEffect(() => {
    loadData();
  }, [dataSourceId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const sourceData = await api.get(`/api/data-sources/${dataSourceId}`);
      setDataSource(sourceData);

      // Initialize de-identification config
      if (sourceData.deIdentificationConfig) {
        setDeIdentConfig(sourceData.deIdentificationConfig);
      }

      // Load preview
      await loadPreview(sourceData.deIdentificationConfig);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadPreview(config?: any) {
    try {
      const previewData = await api.get(`/api/data-sources/${dataSourceId}/preview`, {
        rows: 10,
        deIdentificationConfig: config ? JSON.stringify(config) : undefined,
      });
      setPreview(previewData);
    } catch (err: any) {
      setError(err.message || 'Failed to load preview');
    }
  }

  function handleAddRule() {
    if (!selectedField) return;

    const newRule = {
      field: selectedField,
      method: deIdentMethod,
    };

    const updatedConfig = {
      enabled: true,
      rules: [...deIdentConfig.rules, newRule],
    };

    setDeIdentConfig(updatedConfig);
    setSelectedField('');
    loadPreview(updatedConfig);
  }

  function handleRemoveRule(index: number) {
    const updatedConfig = {
      ...deIdentConfig,
      rules: deIdentConfig.rules.filter((_: any, i: number) => i !== index),
    };
    setDeIdentConfig(updatedConfig);
    loadPreview(updatedConfig);
  }

  async function handleSaveConfig() {
    try {
      setError(null);
      await api.patch(`/api/data-sources/${dataSourceId}`, {
        deIdentificationConfig: deIdentConfig,
        status: 'configured',
      });
      alert('De-identification configuration saved!');
      navigate(`/projects/${projectId}/processing`);
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const sourceColumns = preview?.columns || [];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(`/projects/${projectId}/sources/${dataSourceId}/mapping`)} style={{ marginRight: '10px' }}>
          Back to Mapping
        </button>
        <h1>Configure De-Identification</h1>
        <p>Data Source: {dataSource?.name}</p>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h2>De-Identification Rules</h2>
        <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Select Field:</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="">-- Select Field --</option>
              {sourceColumns.map((col: string) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>De-Identification Method:</label>
            <select
              value={deIdentMethod}
              onChange={(e) => setDeIdentMethod(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="mask">Mask (partial hiding)</option>
              <option value="hash">Hash (one-way encryption)</option>
              <option value="remove">Remove (exclude field)</option>
              <option value="generalize">Generalize (reduce precision)</option>
            </select>
          </div>
          <button onClick={handleAddRule} style={{ padding: '8px 16px' }}>
            Add Rule
          </button>
        </div>

        {deIdentConfig.rules.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Field</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Method</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deIdentConfig.rules.map((rule: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{rule.field}</td>
                  <td style={{ padding: '10px' }}>{rule.method}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleRemoveRule(idx)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Data Preview (with De-Identification Applied)</h2>
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
                {preview.rows.slice(0, 10).map((row: any, idx: number) => (
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

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSaveConfig} style={{ marginRight: '10px', padding: '10px 20px' }}>
          Save Configuration & Continue
        </button>
        <button onClick={() => navigate(`/projects/${projectId}/sources`)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
