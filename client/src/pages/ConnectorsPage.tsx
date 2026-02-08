import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function ConnectorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<any[]>([]);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const connectorsList = await api.get('/api/api-connectors');
      setConnectors(connectorsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load API connectors');
    } finally {
      setLoading(false);
    }
  }

  async function handleViewConnector(id: string) {
    try {
      setError(null);
      const connector = await api.get(`/api/api-connectors/${id}`);
      setSelectedConnector(connector);
    } catch (err: any) {
      setError(err.message || 'Failed to load connector details');
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>API Connectors</h1>
        <p>Browse available API connectors for data integration</p>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {connectors.length === 0 ? (
        <p>No API connectors available.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {connectors.map((connector) => (
            <div
              key={connector.id}
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => handleViewConnector(connector.id)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{connector.name}</h3>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <strong>Provider:</strong> {connector.provider}
              </div>
              {connector.description && (
                <p style={{ fontSize: '14px', color: '#444', marginBottom: '10px' }}>
                  {connector.description}
                </p>
              )}
              <div style={{ fontSize: '14px', color: '#666' }}>
                <strong>Auth Method:</strong> {connector.authMethod}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedConnector && (
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
            <h2>{selectedConnector.name}</h2>
            <button onClick={() => setSelectedConnector(null)} style={{ marginBottom: '15px' }}>
              Close
            </button>

            <div style={{ marginBottom: '15px' }}>
              <strong>Provider:</strong> {selectedConnector.provider}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Authentication Method:</strong> {selectedConnector.authMethod}
            </div>

            {selectedConnector.description && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Description:</strong>
                <p>{selectedConnector.description}</p>
              </div>
            )}

            {selectedConnector.version && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Version:</strong> {selectedConnector.version}
              </div>
            )}

            {selectedConnector.configSchema && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Configuration Schema:</strong>
                {selectedConnector.configSchema.properties && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Field</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Type</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Required</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedConnector.configSchema.properties).map(([key, schema]: [string, any]) => (
                        <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{schema.title || key}</td>
                          <td style={{ padding: '10px' }}>{schema.type}</td>
                          <td style={{ padding: '10px' }}>
                            {selectedConnector.configSchema.required?.includes(key) ? 'Yes' : 'No'}
                          </td>
                          <td style={{ padding: '10px' }}>{schema.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {selectedConnector.capabilities && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Capabilities:</strong>
                <ul style={{ marginTop: '5px' }}>
                  {selectedConnector.capabilities.map((cap: string, idx: number) => (
                    <li key={idx}>{cap}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedConnector.metadata && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Metadata:</strong>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
                  {JSON.stringify(selectedConnector.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
