import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

function AdminPage() {
  const [users, setUsers] = useState([])

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
      // After successful deletion, fetch the updated user list
      fetchUsers()
    } catch (error) {
      console.error(error)
      fetchUsers()
    }
  }


  useEffect(() => {
    fetchUsers()
  }, [])


  return (
    <div>
      <Navbar></Navbar>
      <h2>Users List</h2>
      <div>
        {users.map((user) => (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span>{user.name} - {user.state}</span>
            <button
              onClick={() => deleteUser(user.id)}
              style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '1px 3px' }}>
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPage