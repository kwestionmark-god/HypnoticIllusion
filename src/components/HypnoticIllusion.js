import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  Sliders,
  PlayCircle,
  PauseCircle,
  Maximize2,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';

const MerkabaMeditation = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const timeRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const [settings, setSettings] = useState({
    layerCount: 3,
    merkabas: 7,
    baseSpeed: 0.2,
    size: 100,
    spiritualIntensity: 0.8,
    vibrationFrequency: 0.5,
    chakraAlignment: 0.7,
    innerGlow: 0.6,
    auraIntensity: 0.7,
    dimensionalShift: 0.4,
    goldenRatio: true,
    fibonacciSpiral: true,
    vesicaPisces: true,
    colorScheme: 'chakra',
  });

  const resizeCanvas = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const generateMerkaba = useCallback(
    (centerX, centerY, size, rotation, spiritualIntensity) => {
      const vertices = [];
      const sacredAngles = [0, 120, 240].map((a) => (a * Math.PI) / 180);

      sacredAngles.forEach((angle) => {
        const radius = size * spiritualIntensity;
        vertices.push({
          x: centerX + Math.cos(angle + rotation) * radius,
          y: centerY + Math.sin(angle + rotation) * radius,
          z: size * 0.5,
          type: 'spiritual',
        });
      });
      vertices.push({
        x: centerX,
        y: centerY,
        z: -size * 0.5,
        type: 'spiritual',
      });

      sacredAngles.forEach((angle) => {
        const radius = size * spiritualIntensity;
        vertices.push({
          x: centerX + Math.cos(angle - rotation) * radius,
          y: centerY + Math.sin(angle - rotation) * radius,
          z: -size * 0.5,
          type: 'material',
        });
      });
      vertices.push({
        x: centerX,
        y: centerY,
        z: size * 0.5,
        type: 'material',
      });

      return vertices;
    },
    []
  );

  const getColor = useCallback(
    (angle, energyFlow) => {
      const hueBase = (angle * 180) / Math.PI + settings.vibrationFrequency * 20;
      let hue;
      switch (settings.colorScheme) {
        case 'rainbow':
          hue = (hueBase + energyFlow * 360) % 360;
          break;
        case 'chakra':
          hue = (hueBase + energyFlow * 60) % 360;
          break;
        case 'monochrome':
          hue = 200; // fixed hue
          break;
        default:
          hue = hueBase % 360;
      }
      return `hsla(${hue}, 100%, 70%, ${settings.auraIntensity})`;
    },
    [settings.colorScheme, settings.auraIntensity]
  );

  const drawMerkaba = useCallback(
    (ctx, centerX, centerY, size, rotation) => {
      const vertices = generateMerkaba(
        centerX,
        centerY,
        size,
        rotation,
        settings.spiritualIntensity
      );

      const glowSize = size * (1 + settings.innerGlow * 0.5);
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        glowSize
      );

      gradient.addColorStop(0, getColor(rotation, 0));
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 2 * settings.spiritualIntensity;
      vertices.forEach((v1, i) => {
        vertices.forEach((v2, j) => {
          if (i < j) {
            const energyFlow =
              Math.sin(
                settings.vibrationFrequency + i + j
              ) *
                0.5 +
              0.5;
            ctx.strokeStyle = getColor(rotation, energyFlow);

            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.stroke();
          }
        });
      });
    },
    [generateMerkaba, settings, getColor]
  );

  const draw = useCallback(
    (currentTime) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      timeRef.current += deltaTime * 0.001;

      ctx.fillStyle = isDarkMode ? 'black' : 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let dimension = 0; dimension < settings.layerCount; dimension++) {
        const dimensionalScale = 1 - dimension * 0.2;
        const dimensionalRotation =
          timeRef.current *
          settings.baseSpeed *
          (1 + dimension * settings.dimensionalShift);
        const radius =
          Math.min(canvas.width, canvas.height) / 4 +
          Math.sin(timeRef.current + dimension) *
            50 *
            settings.vibrationFrequency;

        for (let i = 0; i < settings.merkabas; i++) {
          const angle =
            (i / settings.merkabas) * Math.PI * 2 +
            timeRef.current *
              settings.baseSpeed *
              settings.spiritualIntensity;

          const x =
            canvas.width / 2 +
            Math.cos(angle) * radius * dimensionalScale;
          const y =
            canvas.height / 2 +
            Math.sin(angle) * radius * dimensionalScale;

          drawMerkaba(
            ctx,
            x,
            y,
            settings.size * dimensionalScale,
            dimensionalRotation + angle
          );
        }
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    },
    [isPlaying, settings, drawMerkaba, isDarkMode]
  );

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, draw]);

  const toggleAnimation = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return (
    <div className="flex">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg shadow-lg"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={toggleAnimation}
            className="p-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
          >
            {isPlaying ? (
              <PauseCircle className="w-6 h-6 text-white" />
            ) : (
              <PlayCircle className="w-6 h-6 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="p-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-white" />
            ) : (
              <Moon className="w-6 h-6 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
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
        <div className="fixed top-0 right-0 h-screen w-80 p-6 bg-white rounded-lg shadow-lg overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Layer Count</label>
              <input
                type="number"
                value={settings.layerCount}
                onChange={(e) => updateSetting('layerCount', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Merkabas</label>
              <input
                type="number"
                value={settings.merkabas}
                onChange={(e) => updateSetting('merkabas', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Base Speed</label>
              <input
                type="number"
                step="0.1"
                value={settings.baseSpeed}
                onChange={(e) => updateSetting('baseSpeed', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Size</label>
              <input
                type="number"
                value={settings.size}
                onChange={(e) => updateSetting('size', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Spiritual Intensity</label>
              <input
                type="number"
                step="0.1"
                value={settings.spiritualIntensity}
                onChange={(e) => updateSetting('spiritualIntensity', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Vibration Frequency</label>
              <input
                type="number"
                step="0.1"
                value={settings.vibrationFrequency}
                onChange={(e) => updateSetting('vibrationFrequency', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add audio element for ambient sound */}
      <audio
        src="/path/to/ambient-sound.mp3"
        loop
        autoPlay
        muted={isMuted}
      ></audio>
    </div>
  );
};

export default MerkabaMeditation;
