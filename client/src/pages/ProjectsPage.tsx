import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderBy, setOrderBy] = useState<string>('updatedAt');

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchProjects();
  }, [navigate, statusFilter, orderBy]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const queryParams: Record<string, string> = { orderBy };
      if (statusFilter) {
        queryParams.status = statusFilter;
      }

      const data = await api.get<{ projects: Project[] }>(
        '/api/projects',
        queryParams
      );
      setProjects(data.projects || []);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/projects/${id}`);
      setSuccess('Project deleted successfully');
      fetchProjects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete project');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>Projects</h1>
        <Link
          to="/projects/new"
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          Create New Project
        </Link>
      </div>

      {error && (
        <div
          style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '4px',
          }}
        >
          {success}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}
      >
        <div>
          <label
            htmlFor="statusFilter"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Filter by Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="orderBy"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Sort By
          </label>
          <select
            id="orderBy"
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <option value="updatedAt">Last Updated</option>
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            color: '#666',
          }}
        >
          No projects found. Create your first project to get started!
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  Created
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  Updated
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>{project.name}</div>
                    {project.description && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {project.description}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor:
                          project.status === 'active' ? '#e8f5e9' : '#fff3e0',
                        color:
                          project.status === 'active' ? '#2e7d32' : '#e65100',
                      }}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link
                        to={`/projects/${project.id}`}
                        style={{
                          color: '#1976d2',
                          textDecoration: 'none',
                          fontSize: '14px',
                        }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        style={{
                          color: '#d32f2f',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
