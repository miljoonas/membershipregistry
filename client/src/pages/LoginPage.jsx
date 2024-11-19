import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from 'axios'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const navigate = useNavigate()

  const handleLogIn = async () => {
    try {
      const response = await axios.post('http://localhost:8080/auth', { email, password })
      if (response.data.message === 'Login successful') {
        localStorage.setItem('user', JSON.stringify({ email, token: response.data.token }))
        navigate('/admin')
      } else if (response.data.message = 'Invalid email or password') {
        console.log(response.data.message)
        window.alert('Wrong email or password')
      }
    } catch (error) {
      console.error('Login failed:', error)
      window.alert('Login failed. Please try again later.')
    }
  }

  const onButtonClick = () => {

    // Check if the user has entered both fields correctly
    if ('' === email) {
      setEmailError('Please enter your email')
      return
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError('Please enter a valid email')
      return
    }

    if ('' === password) {
      setPasswordError('Please enter a password')
      return
    }

    if (password.length < 7) {
      setPasswordError('The password must be 8 characters or longer')
      return
    }
    handleLogIn()
  }


  return (
    <div className={'mainContainer'}>
      <Navbar />
      <div className={'titleContainer'}>
        <div>Login</div>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={email}
          placeholder="Enter your email here"
          onChange={(ev) => setEmail(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{emailError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={password}
          placeholder="Enter your password here"
          onChange={(ev) => setPassword(ev.target.value)}
          className={'inputBox'}
          type='password'
        />
        <label className="errorLabel">{passwordError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input className={'inputButton'} type="button" onClick={onButtonClick} value={'Log in'} />
      </div>
    </div>
  )
}

export default LoginPage