import React, { StrictMode } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import TitleScreen from './components/TitleScreen';
import MerkabaMeditation from './components/Merkabah';
import HypnoticIllusion from './components/HypnoticIllusion';

// Add ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Routing Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  console.log('App rendering'); // Debug log

  return (
    <StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <TitleScreen />
              } 
            />
            <Route 
              path="/merkabah" 
              element={
                <MerkabaMeditation />
              } 
            />
            <Route 
              path="/hypnotic-illusion" 
              element={
                <HypnoticIllusion />
              } 
            />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </StrictMode>
  );
};

export default App;