import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OneSignal from 'react-onesignal'

OneSignal.init({
  appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
  safari_web_id: "web.onesignal.auto.your-safari-id",
  notifyButton: { enable: false },
  allowLocalhostAsSecureOrigin: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)