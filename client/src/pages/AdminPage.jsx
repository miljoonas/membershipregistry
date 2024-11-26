import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

function AdminPage() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [file, setFile] = useState(null); // State for CSV file

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/")
      setUsers(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8080/user/${userId}`)
      fetchUsers()
    } catch (error) {
      console.error(error)
      fetchUsers()
    }
  }

  const toggleHasPaid = async (user) => {
    try {
      const updatedUser = { ...user, has_paid: !user.has_paid }
      await axios.put(`http://localhost:8080/user/${user.id}`, updatedUser)
      fetchUsers()  // Refresh the list after toggling
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8080/import_users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message || 'Import successful');
      fetchUsers(); // Refresh user list after import
    } catch (error) {
      alert(error.response?.data?.error || 'Import failed');
    }
  };


  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <h2>Users List</h2>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '10px', width: '100%', border: '1px solid #ccc', borderRadius: '5px' }}
        />
      </div>

      {/* Import/Export Section */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h3>Import/Export Users</h3>

        {/* Import CSV */}
        <div>
          <h4>Import Users from CSV</h4>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleImport} style={{ marginLeft: '10px', padding: '5px 10px' }}>
            Import CSV
          </button>
        </div>

        {/* Export CSV */}
        <div style={{ marginTop: '20px' }}>
          <h4>Export Users to CSV</h4>
          <a href="http://localhost:8080/export_users" target="_blank" rel="noopener noreferrer">
            <button style={{ padding: '5px 10px' }}>Export CSV</button>
          </a>
        </div>
      </div>
      
      {/* Users Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#333', color: '#fff' }}>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>City</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Old Member</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Membership Paid</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Date of Registration</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.email}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.city}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.is_old_member ? "Yes" : "No"}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.has_paid ? "Yes" : "No"}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{new Date(user.date_of_registration).toLocaleString()}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                <button
                  onClick={() => deleteUser(user.id)}
                  style={{ marginRight: '10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px' }}>
                  Delete
                </button>
                <button
                  onClick={() => toggleHasPaid(user)}
                  style={{ backgroundColor: user.has_paid ? 'green' : 'gray', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px' }}>
                  {user.has_paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default AdminPage
