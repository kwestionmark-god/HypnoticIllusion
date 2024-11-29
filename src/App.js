import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HypnoticIllusion from './components/HypnoticIllusion';
import { MerkabaMeditation } from './components/Merkabah';
import TitleScreen from './components/TitleScreen';
import './App.css';

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate('/')} 
      className="back-button"
    >
      Back to Title Screen
    </button>
  );
};

const VisualizationLayout = ({ children }) => (
  <>
    <BackButton />
    {children}  {/* Remove the CanvasContainer wrapper */}
  </>
);

const App = () => (
  <Routes>
    <Route path="/" element={<TitleScreen />} />
    <Route 
      path="/hypnotic" 
      element={
        <VisualizationLayout>
          <HypnoticIllusion />
        </VisualizationLayout>
      } 
    />
    <Route 
      path="/merkabah" 
      element={
        <VisualizationLayout>
          <MerkabaMeditation />
        </VisualizationLayout>
      } 
    />
  </Routes>
);

export default App;