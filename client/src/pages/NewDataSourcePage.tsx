import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function NewDataSourcePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<any[]>([]);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const [sourceType, setSourceType] = useState<'file' | 'api'>('file');
  const [name, setName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [connectorId, setConnectorId] = useState('');
  const [connectionConfig, setConnectionConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConnectors();
  }, []);

  async function loadConnectors() {
    try {
      const connectorsList = await api.get('/api/api-connectors');
      setConnectors(connectorsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load API connectors');
    }
  }

  async function handleConnectorSelect(id: string) {
    try {
      setError(null);
      const connector = await api.get(`/api/api-connectors/${id}`);
      setSelectedConnector(connector);
      setConnectorId(id);
      // Initialize connection config based on connector schema
      if (connector.configSchema?.properties) {
        const initialConfig: Record<string, string> = {};
        Object.keys(connector.configSchema.properties).forEach(key => {
          initialConfig[key] = '';
        });
        setConnectionConfig(initialConfig);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load connector details');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (sourceType === 'file') {
        if (!uploadFile) {
          setError('Please select a file to upload');
          return;
        }

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('name', name);
        formData.append('sourceType', 'file');

        const newSource = await api.post('/api/data-sources', formData);
        alert('Data source created successfully!');
        navigate('/data-sources');
      } else {
        // For API sources, first create the data source, then configure the API connection
        const formData = new FormData();
        formData.append('name', name);
        formData.append('sourceType', 'api');

        const newSource = await api.post('/api/data-sources', formData);

        // Configure API connection
        await api.post(`/api/data-sources/${newSource.id}/api-connection`, {
          apiConnectorId: connectorId,
          connectionConfig,
        });

        alert('Data source created and configured successfully!');
        navigate('/data-sources');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create data source');
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/data-sources')} style={{ marginRight: '10px' }}>
          Back to Data Sources
        </button>
        <h1>Create New Data Source</h1>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data Source Type:</label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="radio"
                value="file"
                checked={sourceType === 'file'}
                onChange={(e) => setSourceType(e.target.value as 'file')}
              />
              File Upload
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="radio"
                value="api"
                checked={sourceType === 'api'}
                onChange={(e) => setSourceType(e.target.value as 'api')}
              />
              API Connection
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter a descriptive name"
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          />
        </div>

        {sourceType === 'file' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Upload File:</label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              accept=".csv,.xlsx,.json"
              required
              style={{ width: '100%', padding: '10px', fontSize: '14px' }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              Supported formats: CSV, XLSX, JSON (max 100MB)
            </small>
          </div>
        )}

        {sourceType === 'api' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select API Connector:</label>
              <select
                value={connectorId}
                onChange={(e) => handleConnectorSelect(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', fontSize: '14px' }}
              >
                <option value="">-- Select Connector --</option>
                {connectors.map((connector) => (
                  <option key={connector.id} value={connector.id}>
                    {connector.name} - {connector.provider}
                  </option>
                ))}
              </select>
            </div>

            {selectedConnector && (
              <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                <h3>Connection Configuration</h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                  {selectedConnector.description || 'Configure the API connection settings below.'}
                </p>
                {selectedConnector.configSchema?.properties && (
                  Object.entries(selectedConnector.configSchema.properties).map(([key, schema]: [string, any]) => (
                    <div key={key} style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>
                        {schema.title || key}:
                        {schema.required && <span style={{ color: 'red' }}> *</span>}
                      </label>
                      <input
                        type={schema.type === 'password' ? 'password' : 'text'}
                        value={connectionConfig[key] || ''}
                        onChange={(e) => setConnectionConfig({
                          ...connectionConfig,
                          [key]: e.target.value,
                        })}
                        placeholder={schema.description || ''}
                        required={schema.required}
                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                      />
                      {schema.description && (
                        <small style={{ color: '#666', display: 'block', marginTop: '3px' }}>
                          {schema.description}
                        </small>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '30px' }}>
          <button type="submit" style={{ padding: '10px 30px', fontSize: '16px', marginRight: '10px' }}>
            Create Data Source
          </button>
          <button type="button" onClick={() => navigate('/data-sources')} style={{ padding: '10px 30px', fontSize: '16px' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
