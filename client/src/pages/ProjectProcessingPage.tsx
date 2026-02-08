import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ProjectProcessingPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId, statusFilter]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadJobs();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, projectId, statusFilter]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [jobsList, pipelinesList] = await Promise.all([
        api.get(`/api/projects/${projectId}/processing-jobs`, {
          status: statusFilter || undefined,
          orderBy: 'createdAt',
        }),
        api.get('/api/processing-pipelines'),
      ]);
      setJobs(jobsList);
      setPipelines(pipelinesList);
    } catch (err: any) {
      setError(err.message || 'Failed to load processing jobs');
    } finally {
      setLoading(false);
    }
  }

  async function loadJobs() {
    try {
      const jobsList = await api.get(`/api/projects/${projectId}/processing-jobs`, {
        status: statusFilter || undefined,
        orderBy: 'createdAt',
      });
      setJobs(jobsList);
    } catch (err: any) {
      console.error('Failed to refresh jobs:', err);
    }
  }

  async function handleCreateJob() {
    try {
      setError(null);
      // For simplicity, we'll create a job with all project data sources
      const projectDataSources = await api.get(`/api/projects/${projectId}/data-sources`);
      const dataSourceIds = projectDataSources.map((pds: any) => pds.dataSourceId);

      if (dataSourceIds.length === 0) {
        alert('No data sources available. Please add data sources first.');
        return;
      }

      await api.post(`/api/projects/${projectId}/processing-jobs`, {
        dataSourceIds,
      });

      alert('Processing job created successfully!');
      setAutoRefresh(true);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create processing job');
    }
  }

  async function handleViewJob(jobId: string) {
    try {
      setError(null);
      const job = await api.get(`/api/projects/${projectId}/processing-jobs/${jobId}`);
      setSelectedJob(job);
    } catch (err: any) {
      setError(err.message || 'Failed to load job details');
    }
  }

  async function handleRetryJob(jobId: string) {
    if (!confirm('Retry this failed job?')) return;

    try {
      setError(null);
      await api.post(`/api/projects/${projectId}/processing-jobs/${jobId}/retry`, {});
      alert('Job retry initiated!');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to retry job');
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'failed':
        return '#f44336';
      case 'running':
        return '#2196f3';
      case 'pending':
        return '#ff9800';
      default:
        return '#9e9e9e';
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
        <h1>Processing Jobs</h1>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={handleCreateJob} style={{ padding: '10px 20px' }}>
          Start New Processing Job
        </button>
        <label style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh (3s)
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px', fontSize: '14px' }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {jobs.length === 0 ? (
        <p>No processing jobs found. Create one to get started!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Progress</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{job.id.substring(0, 8)}...</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: getStatusColor(job.status),
                    color: 'white',
                    fontSize: '12px',
                  }}>
                    {job.status}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{job.progress || 0}%</td>
                <td style={{ padding: '10px' }}>{new Date(job.createdAt).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleViewJob(job.id)} style={{ marginRight: '5px' }}>
                    View Details
                  </button>
                  {job.status === 'failed' && (
                    <button onClick={() => handleRetryJob(job.id)}>
                      Retry
                    </button>
                  )}
                  {job.status === 'completed' && (
                    <button onClick={() => navigate(`/projects/${projectId}/datasets`)}>
                      View Output
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedJob && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h2>Job Details</h2>
          <button onClick={() => setSelectedJob(null)} style={{ marginBottom: '15px' }}>Close</button>
          <div style={{ marginBottom: '10px' }}>
            <strong>ID:</strong> {selectedJob.id}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> {selectedJob.status}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Progress:</strong> {selectedJob.progress || 0}%
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Created:</strong> {new Date(selectedJob.createdAt).toLocaleString()}
          </div>
          {selectedJob.completedAt && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Completed:</strong> {new Date(selectedJob.completedAt).toLocaleString()}
            </div>
          )}
          {selectedJob.errorMessage && (
            <div style={{ marginBottom: '10px', color: '#f44336' }}>
              <strong>Error:</strong> {selectedJob.errorMessage}
            </div>
          )}
          {selectedJob.metrics && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Metrics:</strong>
              <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(selectedJob.metrics, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
