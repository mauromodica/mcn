// src/App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import HomeScreen from './screens/HomeScreen';
import SelectorCamaraScreen from './screens/SelectorCamaraScreen';
import MCNDiputadosScreen from './screens/MCNDiputadosScreen';
import TransmisionVotacion from './screens/TransmisionVotacion';
import MCNSenadoresScreen from './screens/MCNSenadoresScreen';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/camara" element={<SelectorCamaraScreen />} />
          <Route path="/diputados" element={<MCNDiputadosScreen />} />
          <Route path="/senadores" element={<MCNSenadoresScreen />} /> {/* DESCOMENTAR */}
          <Route path="/transmision" element={<TransmisionVotacion />} />
          <Route path="/transmision/diputados" element={<TransmisionVotacion camara="diputados" />} />
          <Route path="/transmision/senadores" element={<TransmisionVotacion camara="senadores" />} />
        </Routes>
      </Router>
    </DndProvider>
  );
}


export default App;
