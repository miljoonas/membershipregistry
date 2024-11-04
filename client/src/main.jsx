// src/main.jsx
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Navigate,
} from 'react-router-dom';
import FormPage from './pages/FormPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import './index.css';

function MainApp() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Protect the AdminPage by checking if the token exists
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <StrictMode>
      <RouterProvider
        router={createBrowserRouter([
          { path: "/", element: <FormPage /> },
          { path: "/login", element: <LoginPage setToken={setToken} /> },
          {
            path: "/admin",
            element: (
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            ),
          },
        ])}
      />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<MainApp />);
