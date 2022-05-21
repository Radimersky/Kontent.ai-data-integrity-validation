import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import BlockchainVariants from './pages/BlockchainVariants';
import UnprocessedVariants from './pages/UnprocessedVariants';
import { CssBaseline } from '@mui/material';
import NavigationMenu from './components/NavigationMenu';

function App() {
  return (
    <>
      <CssBaseline />
      <NavigationMenu />
      <Routes>
        <Route path="/" element={<UnprocessedVariants />} />
      </Routes>
      <Routes>
        <Route path="/blockchain" element={<BlockchainVariants />} />
      </Routes>
    </>
  );
}

export default App;
