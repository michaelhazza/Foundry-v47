import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface ProcessingJob {
  id: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
}

interface Dataset {
  id: string;
  name: string;
  format: string;
  size?: number;
  createdAt: string;
}

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchProjectData();
  }, [projectId, navigate]);

  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const [projectData, sourcesData, jobsData, datasetsData] =
        await Promise.all([
          api.get<Project>(`/api/projects/${projectId}`),
          api.get<{ dataSources: DataSource[] }>(
            `/api/projects/${projectId}/data-sources`
          ),
          api.get<{ jobs: ProcessingJob[] }>(
            `/api/projects/${projectId}/processing-jobs`
          ),
          api.get<{ datasets: Dataset[] }>(
            `/api/projects/${projectId}/datasets`
          ),
        ]);

      setProject(projectData);
      setEditName(projectData.name);
      setEditDescription(projectData.description || '');
      setEditStatus(projectData.status);
      setDataSources(sourcesData.dataSources || []);
      setProcessingJobs(jobsData.jobs || []);
      setDatasets(datasetsData.datasets || []);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!projectId) return;

    try {
      await api.patch(`/api/projects/${projectId}`, {
        name: editName,
        description: editDescription,
        status: editStatus,
      });
      setEditing(false);
      fetchProjectData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update project');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>
          Loading project...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ padding: '20px' }}>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
          }}
        >
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/projects"
          style={{
            color: '#1976d2',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          ← Back to Projects
        </Link>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '20px',
        }}
      >
        {editing ? (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label
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
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleUpdate}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '15px',
              }}
            >
              <div>
                <h1 style={{ marginBottom: '5px' }}>{project.name}</h1>
                {project.description && (
                  <p style={{ color: '#666' }}>{project.description}</p>
                )}
              </div>
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
              <div>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor:
                      project.status === 'active' ? '#e8f5e9' : '#fff3e0',
                    color: project.status === 'active' ? '#2e7d32' : '#e65100',
                  }}
                >
                  {project.status}
                </span>
              </div>
              <div>
                <strong>Created:</strong>{' '}
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div>
                <strong>Updated:</strong>{' '}
                {new Date(project.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <h3 style={{ marginBottom: '15px' }}>Data Sources</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>
            {dataSources.length}
          </div>
          <Link
            to={`/projects/${projectId}/sources`}
            style={{
              color: '#1976d2',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Manage Sources →
          </Link>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <h3 style={{ marginBottom: '15px' }}>Processing Jobs</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>
            {processingJobs.length}
          </div>
          <Link
            to={`/projects/${projectId}/processing`}
            style={{
              color: '#1976d2',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            View Jobs →
          </Link>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <h3 style={{ marginBottom: '15px' }}>Datasets</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>
            {datasets.length}
          </div>
          <Link
            to={`/projects/${projectId}/datasets`}
            style={{
              color: '#1976d2',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            View Datasets →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
