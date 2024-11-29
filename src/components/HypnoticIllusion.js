import React, { useEffect, useRef, useState } from 'react';
import { Sliders, PlayCircle, PauseCircle } from 'lucide-react';

const HypnoticIllusion = () => {
  const canvasRef = useRef(null);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [settings, setSettings] = useState({
    layerCount: 7,
    baseSpeed: 0.5,
    complexity: 16,
    colorIntensity: 70,
    pulseSpeed: 2,
    patternDepth: 4,
  });
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const initAudio = async () => {
    try {
      const audioContext = new window.AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setAudioEnabled(true);
    } catch (err) {
      console.warn('Audio input not available:', err);
    }
  };

  const audioDataRef = useRef(new Float32Array(0));

  const getAudioData = () => {
    if (!analyserRef.current) return audioDataRef.current;
    if (audioDataRef.current.length !== analyserRef.current.frequencyBinCount) {
      audioDataRef.current = new Float32Array(analyserRef.current.frequencyBinCount);
    }
    analyserRef.current.getFloatFrequencyData(audioDataRef.current);
    return audioDataRef.current;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = 0;

    const drawFractalPattern = (x, y, size, depth) => {
      if (depth <= 0) return;

      const angle = time * settings.baseSpeed;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * depth);

      // Draw interconnected geometric shapes
      for (let i = 0; i < 6; i++) {
        const subAngle = (i / 6) * Math.PI * 2;
        const subX = Math.cos(subAngle) * size;
        const subY = Math.sin(subAngle) * size;
        
        ctx.beginPath();
        const hue = (time * 50 + depth * 60 + i * 30) % 360;
        ctx.strokeStyle = `hsla(${hue}, ${settings.colorIntensity}%, 50%, ${0.7 / depth})`;
        ctx.lineWidth = 2 / depth;
        
        // Create Lissajous curves
        for (let t = 0; t < Math.PI * 2; t += 0.1) {
          const fx = Math.sin(t * 3 + time) * size * 0.3;
          const fy = Math.sin(t * 2 + time * 1.5) * size * 0.3;
          if (t === 0) ctx.moveTo(fx, fy);
          else ctx.lineTo(fx, fy);
        }
        ctx.stroke();
        
        // Recursive pattern generation
        drawFractalPattern(subX, subY, size * 0.4, depth - 1);
      }
      ctx.restore();
    };

    const createVoronoiPoints = () => {
      const points = [];
      for (let i = 0; i < settings.complexity; i++) {
        const angle = (i / settings.complexity) * Math.PI * 2;
        const radius = 200 + Math.sin(time * 1.5 + i * 0.5) * 30;
        points.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          hue: (time * 50 + i * 30) % 360
        });
      }
      return points;
    };

    const draw = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setTime(prev => prev + deltaTime * 0.001);

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Draw multiple nested pattern layers with interpenetration
      for (let layer = 0; layer < settings.layerCount; layer++) {
        const scale = 1 - layer * 0.1;
        // Reverse rotation direction for alternating layers
        const speed = settings.baseSpeed * (layer % 2 === 0 ? 1 : -1); // Normalized speed
        
        ctx.save();
        ctx.rotate(time * speed);
        ctx.scale(scale, scale);

        // Create Voronoi-like patterns
        const points = createVoronoiPoints();
        points.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${point.hue}, ${settings.colorIntensity}%, 50%, 0.8)`; // Increased opacity
          ctx.fill();
        });

        // Draw fractal patterns
        drawFractalPattern(0, 0, 150, settings.patternDepth);
        
        ctx.restore();
      }

      // Add moiré pattern overlay
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 2; i++) {
        ctx.save();
        ctx.rotate(time * (i ? 0.1 : -0.1));
        
        const gradient = ctx.createLinearGradient(-300, -300, 300, 300);
        gradient.addColorStop(0, `hsla(${time * 50}, ${settings.colorIntensity}%, 50%, 0.1)`);
        gradient.addColorStop(1, `hsla(${time * 50 + 180}, ${settings.colorIntensity}%, 50%, 0.1)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        
        for (let x = -300; x < 300; x += 4) {
          ctx.beginPath();
          ctx.moveTo(x, -300);
          ctx.lineTo(x, 300);
          ctx.stroke();
        }
        ctx.restore();
      }
      
      ctx.restore();

      // Add pulsing vignette effect
      const vignetteGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      const pulseIntensity = Math.sin(time * settings.pulseSpeed) * 0.2 + 0.5;
      vignetteGradient.addColorStop(0, 'transparent');
      vignetteGradient.addColorStop(pulseIntensity, 'rgba(0,0,0,0.3)');
      vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.7)');
      
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (audioEnabled) {
        const audioData = getAudioData();
        // Use audioData to modify visualization parameters
        const avgAudio = audioData.reduce((a, b) => a + b, 0) / audioData.length;
        settings.pulseSpeed = Math.max(0.5, Math.min(5, avgAudio * 0.1));
        settings.colorIntensity = Math.max(50, Math.min(100, avgAudio * 2));
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isPlaying, time, settings, audioEnabled]);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="border border-gray-300 rounded-lg shadow-lg"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={toggleAnimation}
            className="p-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
          >
            {isPlaying ? 
              <PauseCircle className="w-6 h-6 text-white" /> : 
              <PlayCircle className="w-6 h-6 text-white" />
            }
          </button>
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
          >
            <Sliders className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {showControls && (
        <div className="bg-white p-4 rounded-lg shadow-lg space-y-4 w-full max-w-md">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-sm text-gray-600 flex justify-between">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                <span className="text-gray-400">{value}</span>
              </label>
              <input
                type="range"
                min={key === 'layerCount' || key === 'patternDepth' ? 1 : 0.1}
                max={
                  key === 'layerCount' ? 10 :
                  key === 'complexity' ? 24 :
                  key === 'patternDepth' ? 6 :
                  key === 'colorIntensity' ? 100 : 5
                }
                step={key === 'layerCount' || key === 'patternDepth' ? 1 : 0.1}
                value={value}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  [key]: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={initAudio}
        disabled={audioEnabled}
        className="p-2 bg-gray-800 bg-opacity-50 rounded-full"
      >
        Enable Audio Reactive
      </button>

      <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
        Warning: This animation contains complex moving patterns that may cause discomfort for some viewers. 
        Use the controls to adjust the intensity and complexity to your comfort level.
      </p>
    </div>
  );
};

export default HypnoticIllusion;