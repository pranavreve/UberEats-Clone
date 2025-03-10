import React from 'react';
import './App.css';
import AppRoutes from './routes/routes'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
// import NavBar from './components/navbar';
// import CustomerFavorites from './components/customer/customerFavorites';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
