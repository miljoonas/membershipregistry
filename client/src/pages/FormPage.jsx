import { useState, useEffect } from 'react'
import axios from 'axios'
import '../App.css'
import Navbar from '../components/Navbar'

function FormPage() {
  // const [count, setCount] = useState(0)
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [state, setState] = useState('')

  // Post new user to the backend
  const addUser = async (event) => {
    event.preventDefault()

    const newUser = {
      name: name,
      state: state
    }

    try {
      await axios.post("http://localhost:8080/user/", newUser)
      setName('')
      setState('')
      alert('New user added');
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Navbar></Navbar>
      
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
    </div>
  )
}

export default FormPage
