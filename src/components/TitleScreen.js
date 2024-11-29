import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './TitleScreen.css';

const TitleScreen = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('TitleScreen mounted');
    console.log('Current location:', location);
  }, [location]);

  return (
    <div className="title-screen">
      <div className="content">
        <h1>Sacred Geometry Meditations</h1>
        <div className="options">
          <Link to="/merkabah" className="meditation-link">
            <button className="meditation-button">
              <span className="button-text">Merkabah Meditation</span>
              <span className="button-description">
                Experience the sacred star tetrahedron
              </span>
            </button>
          </Link>
          <Link to="/hypnotic-illusion" className="meditation-link">
            <button className="meditation-button">
              <span className="button-text">Hypnotic Illusion</span>
              <span className="button-description">
                Journey through geometric patterns
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;