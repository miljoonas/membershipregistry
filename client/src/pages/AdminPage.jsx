// src/pages/AdminPage.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../utils/axiosSetup";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchUsers(token);
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/user/", {
        headers: {
          Authorization: `Bearer ${token}`  // Add the token in the Authorization header
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response && error.response.status === 401) {
        // Redirect to login if token is invalid or expired
        navigate('/login');
      }
    }
  };

  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchUsers(token);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const toggleHasPaid = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const updatedUser = { ...user, has_paid: !user.has_paid };
      await axios.put(`http://localhost:8080/user/${user.id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchUsers(token);
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  return (
    <div>
      <h2>Admin Page</h2>
      <div>
        {users.map((user) => (
          <div key={user.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>City:</strong> {user.city}</p>
            <p><strong>Old Member:</strong> {user.is_old_member ? 'Yes' : 'No'}</p>
            <p><strong>Membership Paid:</strong> {user.has_paid ? 'Yes' : 'No'}</p>
            <p><strong>Date of Registration:</strong> {new Date(user.date_of_registration).toLocaleString()}</p>
            <button onClick={() => deleteUser(user.id)} style={{ color: 'red' }}>Delete</button>
            <button onClick={() => toggleHasPaid(user)} style={{ marginLeft: '10px' }}>
              {user.has_paid ? 'Mark as Unpaid' : 'Mark as Paid'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;
