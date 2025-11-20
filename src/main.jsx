import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

import { Provider } from 'react-redux'; // <-- AGREGAR
import  store  from './redux/store.js'; // <-- AGREGAR




ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider> 
          <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);