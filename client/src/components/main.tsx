// client/src/components/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App'; // Path fixed
import '../index.css'; // Path fixed

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
