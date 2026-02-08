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

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionData, projectsData] = await Promise.all([
          api.get<{ user: User }>('/api/auth/session'),
          api.get<{ projects: Project[] }>('/api/projects', { limit: 5 }),
        ]);

        setUser(sessionData.user);
        setProjects(projectsData.projects || []);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
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
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px' }}>
          Welcome back, {user?.name || user?.email}
        </h1>
        <p style={{ color: '#666' }}>
          Here's an overview of your projects and quick access to key workflows
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        <Link
          to="/projects/new"
          style={{
            padding: '30px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#1976d2',
            border: '2px dashed #1976d2',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>+</div>
          <div style={{ fontSize: '18px', fontWeight: '500' }}>
            Create New Project
          </div>
        </Link>

        <Link
          to="/data-sources"
          style={{
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#333',
            border: '1px solid #ddd',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: '500' }}>
            Data Sources
          </div>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            Manage your data connections
          </p>
        </Link>

        <Link
          to="/schemas"
          style={{
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#333',
            border: '1px solid #ddd',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: '500' }}>Schemas</div>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            View canonical schemas
          </p>
        </Link>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
          }}
        >
          <h2>Recent Projects</h2>
          <Link
            to="/projects"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            View All
          </Link>
        </div>

        {projects.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              color: '#666',
            }}
          >
            No projects yet. Create your first project to get started!
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
                            project.status === 'active'
                              ? '#e8f5e9'
                              : '#fff3e0',
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
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <Link
                        to={`/projects/${project.id}`}
                        style={{
                          color: '#1976d2',
                          textDecoration: 'none',
                          fontSize: '14px',
                        }}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
