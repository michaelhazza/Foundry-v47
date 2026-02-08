import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function DatasetExportPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  const [downloadFormat, setDownloadFormat] = useState('jsonl');

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const datasetsList = await api.get(`/api/projects/${projectId}/datasets`);
      setDatasets(datasetsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load datasets');
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDataset(datasetId: string) {
    try {
      setError(null);
      const dataset = await api.get(`/api/projects/${projectId}/datasets/${datasetId}`);
      setSelectedDataset(dataset);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset details');
    }
  }

  async function handleDownload(datasetId: string, format: string) {
    try {
      setError(null);
      const blob = await api.get(`/api/projects/${projectId}/datasets/${datasetId}/download`, {
        format,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset-${datasetId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Download started!');
    } catch (err: any) {
      setError(err.message || 'Failed to download dataset');
    }
  }

  async function handleDelete(datasetId: string) {
    if (!confirm('Are you sure you want to delete this dataset? This cannot be undone.')) return;

    try {
      setError(null);
      await api.delete(`/api/projects/${projectId}/datasets/${datasetId}`);
      alert('Dataset deleted successfully');
      setSelectedDataset(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete dataset');
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
        <h1>Datasets & Export</h1>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {datasets.length === 0 ? (
        <div>
          <p>No datasets available yet.</p>
          <p>Run a processing job to generate datasets from your data sources.</p>
          <button onClick={() => navigate(`/projects/${projectId}/processing`)}>
            Go to Processing
          </button>
        </div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Format</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Records</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset) => (
                <tr key={dataset.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{dataset.name || `Dataset ${dataset.id.substring(0, 8)}`}</td>
                  <td style={{ padding: '10px' }}>{dataset.format || 'JSONL'}</td>
                  <td style={{ padding: '10px' }}>{dataset.recordCount || 0}</td>
                  <td style={{ padding: '10px' }}>{new Date(dataset.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleViewDataset(dataset.id)} style={{ marginRight: '5px' }}>
                      View Details
                    </button>
                    <button onClick={() => handleDownload(dataset.id, 'jsonl')} style={{ marginRight: '5px' }}>
                      Download JSONL
                    </button>
                    <button onClick={() => handleDownload(dataset.id, 'json')} style={{ marginRight: '5px' }}>
                      Download JSON
                    </button>
                    <button onClick={() => handleDelete(dataset.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {selectedDataset && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h2>Dataset Details</h2>
          <button onClick={() => setSelectedDataset(null)} style={{ marginBottom: '15px' }}>Close</button>
          <div style={{ marginBottom: '10px' }}>
            <strong>ID:</strong> {selectedDataset.id}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Name:</strong> {selectedDataset.name || 'N/A'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Format:</strong> {selectedDataset.format || 'JSONL'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Record Count:</strong> {selectedDataset.recordCount || 0}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Created:</strong> {new Date(selectedDataset.createdAt).toLocaleString()}
          </div>
          {selectedDataset.metadata && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Metadata:</strong>
              <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(selectedDataset.metadata, null, 2)}
              </pre>
            </div>
          )}
          <div style={{ marginTop: '15px' }}>
            <strong>Export Options:</strong>
            <div style={{ marginTop: '10px' }}>
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
                style={{ padding: '8px', fontSize: '14px', marginRight: '10px' }}
              >
                <option value="jsonl">JSONL (Line-delimited JSON)</option>
                <option value="json">JSON (Array format)</option>
              </select>
              <button onClick={() => handleDownload(selectedDataset.id, downloadFormat)}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
