import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ProjectSourcesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectDataSources, setProjectDataSources] = useState<any[]>([]);
  const [allDataSources, setAllDataSources] = useState<any[]>([]);
  const [connectors, setConnectors] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDataSourceId, setSelectedDataSourceId] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newSourceName, setNewSourceName] = useState('');
  const [sourceType, setSourceType] = useState('file');

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [projectSources, sources, connectorsList] = await Promise.all([
        api.get(`/api/projects/${projectId}/data-sources`),
        api.get('/api/data-sources'),
        api.get('/api/api-connectors'),
      ]);
      setProjectDataSources(projectSources);
      setAllDataSources(sources);
      setConnectors(connectorsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load data sources');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExisting(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDataSourceId) return;

    try {
      setError(null);
      await api.post(`/api/projects/${projectId}/data-sources`, {
        dataSourceId: selectedDataSourceId,
      });
      setShowAddForm(false);
      setSelectedDataSourceId('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add data source');
    }
  }

  async function handleCreateNew(e: React.FormEvent) {
    e.preventDefault();
    if (!newSourceName || !uploadFile) return;

    try {
      setError(null);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', newSourceName);
      formData.append('sourceType', sourceType);

      const newSource = await api.post('/api/data-sources', formData);

      // Add to project
      await api.post(`/api/projects/${projectId}/data-sources`, {
        dataSourceId: newSource.id,
      });

      setShowCreateForm(false);
      setNewSourceName('');
      setUploadFile(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create data source');
    }
  }

  async function handleDelete(dataSourceId: string) {
    if (!confirm('Remove this data source from the project?')) return;

    try {
      setError(null);
      await api.delete(`/api/projects/${projectId}/data-sources/${dataSourceId}`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to remove data source');
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(`/projects/${projectId}`)} style={{ marginRight: '10px' }}>
          Back to Project
        </button>
        <h1>Project Data Sources</h1>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ marginRight: '10px' }}>
          Upload New File
        </button>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          Add Existing Source
        </button>
      </div>

      {showCreateForm && (
        <div style={{ padding: '20px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h3>Upload New Data Source</h3>
          <form onSubmit={handleCreateNew}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Source Type:</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              >
                <option value="file">File Upload</option>
                <option value="api">API Connection</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>File:</label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                accept=".csv,.xlsx,.json"
                required
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              />
            </div>
            <button type="submit" style={{ marginRight: '10px' }}>Create & Add</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      {showAddForm && (
        <div style={{ padding: '20px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h3>Add Existing Data Source</h3>
          <form onSubmit={handleAddExisting}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Select Data Source:</label>
              <select
                value={selectedDataSourceId}
                onChange={(e) => setSelectedDataSourceId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              >
                <option value="">-- Select --</option>
                {allDataSources
                  .filter(ds => !projectDataSources.find(pds => pds.dataSourceId === ds.id))
                  .map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name} ({ds.sourceType})
                    </option>
                  ))}
              </select>
            </div>
            <button type="submit" style={{ marginRight: '10px' }}>Add</button>
            <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      <h2>Current Data Sources</h2>
      {projectDataSources.length === 0 ? (
        <p>No data sources added yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projectDataSources.map((pds) => {
              const dataSource = allDataSources.find(ds => ds.id === pds.dataSourceId);
              return (
                <tr key={pds.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{dataSource?.name || 'Unknown'}</td>
                  <td style={{ padding: '10px' }}>{dataSource?.sourceType || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>{dataSource?.status || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => navigate(`/projects/${projectId}/sources/${pds.dataSourceId}/mapping`)}
                      style={{ marginRight: '5px' }}
                    >
                      Configure Mapping
                    </button>
                    <button onClick={() => handleDelete(pds.dataSourceId)}>Remove</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
