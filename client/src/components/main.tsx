// client/src/components/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// CRITICAL FIX: Changed the import path from './App.tsx' to '../App.tsx' 
// to correctly locate the App.tsx file in the parent directory (src/).
import App from '../App'; 
import './index.css'; // Assuming your global styles are here

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
