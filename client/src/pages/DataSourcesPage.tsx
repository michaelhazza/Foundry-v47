import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function DataSourcesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingSource, setEditingSource] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', status: '' });

  useEffect(() => {
    loadData();
  }, [typeFilter, statusFilter]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const sources = await api.get('/api/data-sources', {
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setDataSources(sources);
    } catch (err: any) {
      setError(err.message || 'Failed to load data sources');
    } finally {
      setLoading(false);
    }
  }

  async function handleViewSource(id: string) {
    try {
      setError(null);
      const source = await api.get(`/api/data-sources/${id}`);
      setSelectedSource(source);
    } catch (err: any) {
      setError(err.message || 'Failed to load data source details');
    }
  }

  function handleStartEdit(source: any) {
    setEditingSource(source);
    setEditForm({ name: source.name, status: source.status });
    setSelectedSource(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSource) return;

    try {
      setError(null);
      await api.patch(`/api/data-sources/${editingSource.id}`, editForm);
      alert('Data source updated successfully');
      setEditingSource(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update data source');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this data source? This cannot be undone.')) return;

    try {
      setError(null);
      await api.delete(`/api/data-sources/${id}`);
      alert('Data source deleted successfully');
      setSelectedSource(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete data source');
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Data Sources</h1>
        <p>Manage all organization-wide data sources</p>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => navigate('/data-sources/new')} style={{ padding: '10px 20px' }}>
          Create New Data Source
        </button>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '8px', fontSize: '14px' }}
        >
          <option value="">All Types</option>
          <option value="file">File</option>
          <option value="api">API</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px', fontSize: '14px' }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="mapped">Mapped</option>
          <option value="configured">Configured</option>
        </select>
      </div>

      {dataSources.length === 0 ? (
        <p>No data sources found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((source) => (
              <tr key={source.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{source.name}</td>
                <td style={{ padding: '10px' }}>{source.sourceType}</td>
                <td style={{ padding: '10px' }}>{source.status}</td>
                <td style={{ padding: '10px' }}>{new Date(source.createdAt).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleViewSource(source.id)} style={{ marginRight: '5px' }}>
                    View
                  </button>
                  <button onClick={() => handleStartEdit(source)} style={{ marginRight: '5px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(source.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedSource && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h2>Data Source Details</h2>
          <button onClick={() => setSelectedSource(null)} style={{ marginBottom: '15px' }}>Close</button>
          <div style={{ marginBottom: '10px' }}>
            <strong>ID:</strong> {selectedSource.id}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Name:</strong> {selectedSource.name}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Type:</strong> {selectedSource.sourceType}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> {selectedSource.status}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Created:</strong> {new Date(selectedSource.createdAt).toLocaleString()}
          </div>
          {selectedSource.filePath && (
            <div style={{ marginBottom: '10px' }}>
              <strong>File Path:</strong> {selectedSource.filePath}
            </div>
          )}
          {selectedSource.metadata && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Metadata:</strong>
              <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(selectedSource.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {editingSource && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h2>Edit Data Source</h2>
          <form onSubmit={handleSaveEdit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="mapped">Mapped</option>
                <option value="configured">Configured</option>
              </select>
            </div>
            <button type="submit" style={{ marginRight: '10px' }}>Save</button>
            <button type="button" onClick={() => setEditingSource(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
