import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TitleScreen.css';

const TitleScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="title-screen">
      <div className="content">
        <h1>Enter the Realm of Sacred Geometry</h1>
        <div className="options">
          <button className="meditation-button" onClick={() => navigate('/hypnotic')}>
            <span className="button-text">Start Hypnotic Illusion</span>
            <span className="button-description">Begin the hypnotic experience</span>
          </button>
          <button className="meditation-button" onClick={() => navigate('/merkabah')}>
            <span className="button-text">Start Merkabah Meditation</span>
            <span className="button-description">Experience the sacred star tetrahedron</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;