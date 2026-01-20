import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Production Error Logger for Mobile Debugging
window.onerror = function (msg, url, line, col, error) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:9999;padding:10px;font-size:10px;word-break:break-all';
  div.innerHTML = `CRASH: ${msg} at ${line}:${col}<br>${error?.stack || ''}`;
  document.body.appendChild(div);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
