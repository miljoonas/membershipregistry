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
      
      <div>
        {filteredUsers.map((user) => (
          <div key={user.id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
            <span><strong>Name:</strong> {user.name}</span>
            <span><strong>Email:</strong> {user.email}</span>
            <span><strong>City:</strong> {user.city}</span>
            <span><strong>Old Member:</strong> {user.is_old_member ? "Yes" : "No"}</span>
            <span><strong>Membership Paid:</strong> {user.has_paid ? "Yes" : "No"}</span>
            <span><strong>Date of Registration:</strong> {new Date(user.date_of_registration).toLocaleString()}</span>
            <button
              onClick={() => deleteUser(user.id)}
              style={{ marginTop: '10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px' }}>
              Delete
            </button>
            <button
              onClick={() => toggleHasPaid(user)}
              style={{ marginTop: '10px', backgroundColor: user.has_paid ? 'green' : 'gray', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px' }}>
              {user.has_paid ? 'Mark as Unpaid' : 'Mark as Paid'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


export default AdminPage
