import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import pentagonFavicon from './pentagon-log-square.png'
import './index.css'

const favicon = document.querySelector("link[rel~='icon']") || document.createElement('link')
favicon.rel = 'icon'
favicon.type = 'image/png'
favicon.href = pentagonFavicon
document.head.appendChild(favicon)

axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
