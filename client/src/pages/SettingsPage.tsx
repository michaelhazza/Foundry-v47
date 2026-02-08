import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [organisation, setOrganisation] = useState<any>(null);
  const [userForm, setUserForm] = useState({ email: '' });
  const [orgForm, setOrgForm] = useState({ name: '' });
  const [activeTab, setActiveTab] = useState<'profile' | 'organization'>('profile');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [sessionData, orgData] = await Promise.all([
        api.get('/api/auth/session'),
        api.get('/api/organisations/me'),
      ]);
      setSession(sessionData);
      setOrganisation(orgData);
      setUserForm({ email: sessionData.user?.email || '' });
      setOrgForm({ name: orgData.name || '' });
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;

    try {
      setError(null);
      await api.patch(`/api/users/${session.user.id}`, {
        email: userForm.email,
      });
      alert('Profile updated successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  }

  async function handleUpdateOrganization(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError(null);
      await api.patch('/api/organisations/me', {
        name: orgForm.name,
      });
      alert('Organization updated successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update organization');
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const isAdmin = session?.user?.role === 'admin';

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Settings</h1>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'profile' ? '2px solid #2196f3' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
          }}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('organization')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'organization' ? '2px solid #2196f3' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'organization' ? 'bold' : 'normal',
          }}
        >
          Organization
        </button>
      </div>

      {activeTab === 'profile' && (
        <div>
          <h2>User Profile</h2>
          <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
            <h3>Account Information</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>User ID:</strong> {session?.user?.id}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Email:</strong> {session?.user?.email}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Role:</strong>{' '}
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: session?.user?.role === 'admin' ? '#ff9800' : '#2196f3',
                color: 'white',
                fontSize: '12px',
              }}>
                {session?.user?.role}
              </span>
            </div>
            {session?.user?.createdAt && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Account Created:</strong> {new Date(session.user.createdAt).toLocaleString()}
              </div>
            )}
          </div>

          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h3>Update Profile</h3>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                />
              </div>
              <button type="submit" style={{ padding: '10px 20px' }}>
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'organization' && (
        <div>
          <h2>Organization Settings</h2>
          <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
            <h3>Organization Information</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Organization ID:</strong> {organisation?.id}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Name:</strong> {organisation?.name}
            </div>
            {organisation?.createdAt && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Created:</strong> {new Date(organisation.createdAt).toLocaleString()}
              </div>
            )}
            {organisation?.metadata && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Metadata:</strong>
                <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
                  {JSON.stringify(organisation.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {isAdmin ? (
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h3>Update Organization</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Only administrators can update organization settings.
              </p>
              <form onSubmit={handleUpdateOrganization}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Organization Name:</label>
                  <input
                    type="text"
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                  />
                </div>
                <button type="submit" style={{ padding: '10px 20px' }}>
                  Update Organization
                </button>
              </form>
            </div>
          ) : (
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff3cd' }}>
              <p>Only administrators can modify organization settings.</p>
              <p>Contact your organization administrator to make changes.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
