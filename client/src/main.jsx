import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from 'react-router-dom'

import FormPage from './pages/FormPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <FormPage />
  },
  {
    path: "/admin",
    element: <AdminPage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
