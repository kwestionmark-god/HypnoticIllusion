import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import YouTubeAudioPlayer from './YouTubeAudioPlayer'; // Ensure the correct path
import './MerkabaMeditation.css'; // Import the CSS file
import GUI from 'lil-gui';

const MerkabaMeditation = () => {
  const containerRef = useRef();
  const animationFrameRef = useRef();

  // State for play/pause functionality
  const [isPlaying, setIsPlaying] = useState(true);

  // References for Three.js objects
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const solidGroupRef = useRef();
  const wireframeGroupRef = useRef();
  const sphereGroupRef = useRef();
  const ambientLightRef = useRef();
  const directionalLightRef = useRef();

  // Mutable refs for settings
  const settingsRef = useRef({
    rotationSpeed: 0.005,
    backgroundColor: '#1a1a1a',
    wireframe: true,
    solidPolygonOpacity: 0.8,
    solidPolygonColor: '#00aaff',
    wireframeColor: '#ffffff',
    wireframeOpacity: 0.5,
    sphereColor: '#ffdd00',
    metalness: 0.2,
    roughness: 0.8,
    ambientLightIntensity: 0.6,
    ambientLightColor: '#ffffff',
    directionalLightIntensity: 0.5,
    directionalLightColor: '#ffffff',
  });

  // Initialization useEffect
  useEffect(() => {
    const currentContainer = containerRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settingsRef.current.backgroundColor);
    sceneRef.current = scene;

    // Camera
    const width = currentContainer.clientWidth;
    const height = currentContainer.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 200);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    currentContainer.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Lights
    const ambientLight = new THREE.AmbientLight(
      settingsRef.current.ambientLightColor,
      settingsRef.current.ambientLightIntensity
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(
      settingsRef.current.directionalLightColor,
      settingsRef.current.directionalLightIntensity
    );
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    // Create Groups
    const solidGroup = new THREE.Group();
    solidGroupRef.current = solidGroup;
    scene.add(solidGroup);

    const wireframeGroup = new THREE.Group();
    wireframeGroupRef.current = wireframeGroup;
    scene.add(wireframeGroup);

    const sphereGroup = new THREE.Group();
    sphereGroupRef.current = sphereGroup;
    scene.add(sphereGroup);

    // Base Geometry
    const geometry = new THREE.TetrahedronGeometry(1);
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: settingsRef.current.solidPolygonColor,
      metalness: settingsRef.current.metalness,
      roughness: settingsRef.current.roughness,
      transparent: true,
      opacity: settingsRef.current.solidPolygonOpacity,
    });
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: settingsRef.current.wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: settingsRef.current.wireframeOpacity,
    });

    // Create Tetrahedrons
    const createTetrahedron = (group, material, rotation) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);
      mesh.scale.setScalar(50);
      group.add(mesh);
    };

    createTetrahedron(wireframeGroup, wireframeMaterial, { x: Math.PI, y: 0, z: 0 });
    createTetrahedron(wireframeGroup, wireframeMaterial, { x: -Math.PI / 2, y: Math.PI, z: 0 });
    createTetrahedron(solidGroup, solidMaterial, { x: Math.PI, y: 0, z: 0 });
    createTetrahedron(solidGroup, solidMaterial, { x: -Math.PI / 2, y: Math.PI, z: 0 });

    // Add Spheres
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: settingsRef.current.sphereColor,
      metalness: 0.5,
      roughness: 0.2,
    });
    const sphereGeometry = new THREE.SphereGeometry(4, 16, 16);
    const positions = [
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(-1, -1, 1),
      new THREE.Vector3(-1, 1, -1),
      new THREE.Vector3(1, -1, -1),
    ];
    positions.forEach((pos) => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(pos.multiplyScalar(50));
      sphereGroup.add(sphere);
    });

    // Animation Loop
    const animate = () => {
      if (isPlaying) {
        solidGroup.rotation.x += settingsRef.current.rotationSpeed;
        wireframeGroup.rotation.x += settingsRef.current.rotationSpeed;
        sphereGroup.rotation.x += settingsRef.current.rotationSpeed;
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // GUI
    const gui = new GUI();
    gui.add(settingsRef.current, 'rotationSpeed', 0, 0.1, 0.001).name('Rotation Speed');
    gui.addColor(settingsRef.current, 'backgroundColor').name('Background Color').onChange((value) => {
      scene.background.set(value);
    });
    gui.addColor(settingsRef.current, 'solidPolygonColor').name('Solid Polygon Color').onChange((value) => {
      solidMaterial.color.set(value);
    });
    gui.add(settingsRef.current, 'solidPolygonOpacity', 0, 1, 0.01).name('Solid Opacity').onChange((value) => {
      solidMaterial.opacity = value;
    });
    gui.addColor(settingsRef.current, 'wireframeColor').name('Wireframe Color').onChange((value) => {
      wireframeMaterial.color.set(value);
    });
    gui.add(settingsRef.current, 'wireframeOpacity', 0, 1, 0.01).name('Wireframe Opacity').onChange((value) => {
      wireframeMaterial.opacity = value;
    });
    gui.addColor(settingsRef.current, 'sphereColor').name('Sphere Color').onChange((value) => {
      sphereMaterial.color.set(value);
    });

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      gui.destroy();
      scene.clear();
      renderer.dispose();
    };
  }, [isPlaying]);

  return (
    <div className="meditation-container">
      <div ref={containerRef} className="three-container"></div>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <YouTubeAudioPlayer videoId="He462jFzrAM" />
    </div>
  );
};

export default MerkabaMeditation;
