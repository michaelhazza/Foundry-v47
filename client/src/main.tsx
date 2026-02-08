import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Basic global styles
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    background-color: #2196f3;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  button:hover {
    background-color: #1976d2;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  input, select, textarea {
    font-family: inherit;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #2196f3;
  }

  a {
    color: #2196f3;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  table {
    border-collapse: collapse;
  }

  th, td {
    text-align: left;
  }
`;

// Inject global styles
const styleSheet = document.createElement('style');
styleSheet.textContent = globalStyles;
document.head.appendChild(styleSheet);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
