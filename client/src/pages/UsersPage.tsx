import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', role: 'member' });
  const [editForm, setEditForm] = useState({ email: '', role: '' });

  useEffect(() => {
    loadData();
  }, [roleFilter, statusFilter]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const usersList = await api.get('/api/users', {
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(usersList);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleViewUser(id: string) {
    try {
      setError(null);
      const user = await api.get(`/api/users/${id}`);
      setSelectedUser(user);
      setShowEditForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      await api.post('/api/users', createForm);
      alert('User created successfully! Invitation sent.');
      setShowCreateForm(false);
      setCreateForm({ email: '', password: '', role: 'member' });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  }

  function handleStartEdit(user: any) {
    setSelectedUser(user);
    setEditForm({ email: user.email, role: user.role });
    setShowEditForm(true);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setError(null);
      await api.patch(`/api/users/${selectedUser.id}`, editForm);
      alert('User updated successfully');
      setShowEditForm(false);
      setSelectedUser(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

    try {
      setError(null);
      await api.delete(`/api/users/${id}`);
      alert('User deleted successfully');
      setSelectedUser(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>User Management</h1>
        <p>Manage organization users and permissions (Admin only)</p>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ padding: '10px 20px' }}>
          Invite New User
        </button>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '8px', fontSize: '14px' }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px', fontSize: '14px' }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {showCreateForm && (
        <div style={{ padding: '20px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h3>Invite New User</h3>
          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
                placeholder="user@example.com"
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                required
                placeholder="Secure password"
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Role:</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" style={{ marginRight: '10px' }}>Create User</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Role</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{user.email}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: user.role === 'admin' ? '#ff9800' : '#2196f3',
                    color: 'white',
                    fontSize: '12px',
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{user.status || 'active'}</td>
                <td style={{ padding: '10px' }}>{new Date(user.createdAt).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleViewUser(user.id)} style={{ marginRight: '5px' }}>
                    View
                  </button>
                  <button onClick={() => handleStartEdit(user)} style={{ marginRight: '5px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && !showEditForm && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h2>User Details</h2>
          <button onClick={() => setSelectedUser(null)} style={{ marginBottom: '15px' }}>Close</button>
          <div style={{ marginBottom: '10px' }}>
            <strong>ID:</strong> {selectedUser.id}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Email:</strong> {selectedUser.email}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Role:</strong> {selectedUser.role}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> {selectedUser.status || 'active'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}
          </div>
          {selectedUser.lastLoginAt && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Last Login:</strong> {new Date(selectedUser.lastLoginAt).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {selectedUser && showEditForm && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h2>Edit User</h2>
          <form onSubmit={handleUpdateUser}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Role:</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" style={{ marginRight: '10px' }}>Save Changes</button>
            <button type="button" onClick={() => {
              setShowEditForm(false);
              setSelectedUser(null);
            }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
