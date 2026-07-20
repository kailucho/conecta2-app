import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ProveedorApp } from './contexto/AppContexto.jsx'
import { ProveedorAuth } from './contexto/AuthContexto.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProveedorAuth>
      <ProveedorApp>
        <App />
      </ProveedorApp>
    </ProveedorAuth>
  </React.StrictMode>,
)
