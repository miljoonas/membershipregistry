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
      const response = await axios.post("http://localhost:8080/user/", newUser);
      setName('');
      setEmail('');
      setCity('');
      setIsOldMember(false);
      setHasPaid(false);
      alert(response.data.message);
    } catch (error) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };

  return (
    <div>
      <Navbar />
      
      <form onSubmit={addUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: 'auto' }}>
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
        <button type="submit" style={{ padding: '10px', backgroundColor: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isOldMember ? 'Update User' : 'Add User'}
        </button>
      </form>
    </div>
  )
}

export default FormPage
