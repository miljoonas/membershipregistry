import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [state, setState] = useState('')

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/")
      setUsers(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  // Post new user to the backend
  const addUser = async (event) => {
    event.preventDefault()

    const newUser = {
      name: name,
      state: state
    }

    try {
      await axios.post("http://localhost:8080/user/", newUser)
      fetchUsers()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div>
      <h2>Users List</h2>
      <form onSubmit={addUser}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        />
        <button type="submit">Add User</button>
      </form>

      <div>
        {users.map((user, index) => (
          <div key={user.id}>
            <span>{user.name} - {user.state}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
