import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FormPage from './pages/FormPage.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from 'react-router-dom'
import AdminPage from './pages/AdminPage.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <FormPage />
  },
  {
    path: "/admin",
    element: <AdminPage />
  },
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
