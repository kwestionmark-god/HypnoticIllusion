import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const MerkabaMeditation = () => {
  const containerRef = useRef();

  // Refs for scene elements
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const merkabaGroupRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [settings, setSettings] = useState({
    rotationSpeed: 0.005,
    backgroundColor: '#000000',
    solidPolygonColor: '#ff0000',
    wireframeColor: '#ffffff',
    sphereColor: '#00ff00',
    size: 3,
    showGrid: false,
    showSolidPolygons: false,
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const initScene = useCallback(() => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.backgroundColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, settings.size * 6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Merkaba group
    const merkabaGroup = new THREE.Group();
    merkabaGroupRef.current = merkabaGroup;
    scene.add(merkabaGroup);

    // Optional: Grid
    if (settings.showGrid) {
      const gridHelper = new THREE.GridHelper(200, 50);
      scene.add(gridHelper);
    }

    // Handle window resize
    const onWindowResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // Cleanup function
    const cleanup = () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', onWindowResize);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };

    return { cleanup };
  }, [settings.backgroundColor, settings.showGrid, settings.size]);

  const createMerkabaGeometry = useCallback(() => {
    const { solidPolygonColor, wireframeColor, sphereColor, size, showSolidPolygons } = settings;
    const merkabaGroup = merkabaGroupRef.current;
    if (!merkabaGroup) return;

    // Clear existing children (if any)
    while (merkabaGroup.children.length > 0) {
      merkabaGroup.remove(merkabaGroup.children[0]);
    }

    // Base geometry and materials
    const baseSize = 1;
    const geometry = new THREE.TetrahedronGeometry(baseSize);

    const solidMaterial = new THREE.MeshPhongMaterial({
      color: solidPolygonColor,
      wireframe: false,
      side: THREE.DoubleSide,
    });

    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: wireframeColor,
    });

    // Tetrahedrons
    const tetrahedronUp = new THREE.Mesh(geometry, solidMaterial);
    tetrahedronUp.rotation.x = Math.PI / 2;
    tetrahedronUp.scale.setScalar(size);
    tetrahedronUp.position.y = (baseSize * size) / Math.sqrt(30000);

    const tetrahedronDown = new THREE.Mesh(geometry, solidMaterial);
    tetrahedronDown.rotation.x = -Math.PI;
    tetrahedronDown.rotation.y = Math.PI;
    tetrahedronDown.scale.setScalar(size);
    tetrahedronDown.position.y = -(baseSize * size) / Math.sqrt(30000);

    merkabaGroup.add(tetrahedronUp, tetrahedronDown);

    // Wireframe edges
    const wireframeGeometry = new THREE.EdgesGeometry(geometry);
    const wireframeUp = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    wireframeUp.rotation.x = Math.PI / 2;
    wireframeUp.scale.setScalar(size);
    wireframeUp.position.y = (baseSize * size) / Math.sqrt(30000);

    const wireframeDown = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    wireframeDown.rotation.x = -Math.PI;
    wireframeDown.rotation.y = Math.PI;
    wireframeDown.scale.setScalar(size);
    wireframeDown.position.y = -(baseSize * size) / Math.sqrt(30000);

    merkabaGroup.add(wireframeUp, wireframeDown);

    // Vertex spheres
    const vertexGeometry = new THREE.SphereGeometry(0.1 * size, 16, 16);
    const vertexMaterial = new THREE.MeshBasicMaterial({ color: sphereColor });

    const vertices = [
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(-1, -1, 1),
      new THREE.Vector3(-1, 1, -1),
      new THREE.Vector3(1, -1, -1),
    ];

    vertices.forEach((vertex) => {
      const vertexSphereUp = new THREE.Mesh(vertexGeometry, vertexMaterial);
      vertexSphereUp.position.copy(vertex).multiplyScalar(size / Math.sqrt(2));
      merkabaGroup.add(vertexSphereUp);

      const vertexSphereDown = new THREE.Mesh(vertexGeometry, vertexMaterial);
      vertexSphereDown.position
        .copy(vertex)
        .multiplyScalar(size / Math.sqrt(2))
        .negate();
      merkabaGroup.add(vertexSphereDown);
    });

    // Inner connecting wires
    const innerVertices = vertices.flatMap((vertex) => [
      vertex.clone().multiplyScalar(size / Math.sqrt(2)),
      vertex.clone().multiplyScalar(size / Math.sqrt(2)).negate(),
    ]);
    const wireframeGeometryInner = new THREE.BufferGeometry().setFromPoints(innerVertices);
    const wireframeInner = new THREE.LineSegments(wireframeGeometryInner, wireframeMaterial);
    merkabaGroup.add(wireframeInner);

    // Optional solid polygons (extra tetrahedrons)
    if (showSolidPolygons) {
      const solidTetraUp = new THREE.Mesh(geometry, solidMaterial);
      solidTetraUp.rotation.x = Math.PI / 2;
      solidTetraUp.scale.setScalar(size);
      solidTetraUp.position.y = (baseSize * size) / Math.sqrt(25000);
      merkabaGroup.add(solidTetraUp);

      const solidTetraDown = new THREE.Mesh(geometry, solidMaterial);
      solidTetraDown.rotation.x = -Math.PI;
      solidTetraDown.rotation.y = Math.PI;
      solidTetraDown.scale.setScalar(size);
      solidTetraDown.position.y = -(baseSize * size) / Math.sqrt(40000);
      merkabaGroup.add(solidTetraDown);
    }

    // Set initial orientation
    merkabaGroup.rotation.x = Math.PI / 6;
    merkabaGroup.rotation.y = Math.PI / 4;
  }, [settings]);

  useEffect(() => {
    const { cleanup } = initScene();
    createMerkabaGeometry();

    const animate = () => {
      if (isPlaying && merkabaGroupRef.current) {
        merkabaGroupRef.current.rotation.x += settings.rotationSpeed;
        merkabaGroupRef.current.rotation.y += settings.rotationSpeed;
      }
      if (controlsRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
        controlsRef.current.update();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cleanup();
    };
  }, [initScene, createMerkabaGeometry, isPlaying, settings.rotationSpeed]);

  // If settings (like colors) change, we just rebuild the geometry
  useEffect(() => {
    createMerkabaGeometry();
  }, [settings, createMerkabaGeometry]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : name === 'rotationSpeed' ? parseFloat(value) : value,
    }));
  };

  const toggleAnimation = () => setIsPlaying((prev) => !prev);
  const toggleControls = () => setShowControls((prev) => !prev);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          gap: '10px',
          zIndex: 10,
        }}
      >
        <button
          onClick={toggleAnimation}
          style={{
            padding: '10px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={toggleControls}
          style={{
            padding: '10px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Settings
        </button>
      </div>
      {showControls && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 10,
          }}
        >
          <div>
            <label>
              Rotation Speed:
              <input
                type="range"
                name="rotationSpeed"
                min="0"
                max="0.1"
                step="0.01"
                value={settings.rotationSpeed}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div>
            <label>
              Solid Polygon Color:
              <input
                type="color"
                name="solidPolygonColor"
                value={settings.solidPolygonColor}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div>
            <label>
              Wireframe Color:
              <input
                type="color"
                name="wireframeColor"
                value={settings.wireframeColor}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div>
            <label>
              Sphere Color:
              <input
                type="color"
                name="sphereColor"
                value={settings.sphereColor}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div>
            <label>
              Show Solid Polygons:
              <input
                type="checkbox"
                name="showSolidPolygons"
                checked={settings.showSolidPolygons}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div>
            <label>
              Show Grid:
              <input
                type="checkbox"
                name="showGrid"
                checked={settings.showGrid}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export { MerkabaMeditation };