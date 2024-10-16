import { useState } from 'react'
import axios from 'axios'
import '../App.css'
import Navbar from '../components/Navbar'

function FormPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [isOldMember, setIsOldMember] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)

  const addUser = async (event) => {
    event.preventDefault()
  
    const newUser = {
      name: name,
      email: email,
      city: city,
      is_old_member: isOldMember,
      has_paid: hasPaid,
      date_of_registration: new Date().toISOString()  // Send current time in ISO format
    }
  
    try {
      await axios.post("http://localhost:8080/user/", newUser)
      setName('')
      setEmail('')
      setCity('')
      setIsOldMember(false)
      setHasPaid(false)
      alert('New user added')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Navbar />
      
      <form onSubmit={addUser}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <label>
          Old Member:
          <input
            type="checkbox"
            checked={isOldMember}
            onChange={(e) => setIsOldMember(e.target.checked)}
          />
        </label>
        <button type="submit">Add User</button>
      </form>
    </div>
  )
}

export default FormPage
