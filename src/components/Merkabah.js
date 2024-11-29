import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const MerkabaMeditation = () => {
  const containerRef = useRef();
  const animationFrameRef = useRef();
  const [settings, setSettings] = useState({
    rotationSpeed: 0.01,
    color: '#00ffff',
    backgroundColor: '#000000',
    size: 5,
    wireframe: true,
    showGrid: false,
    showSolidPolygons: false, // New setting for solid polygons
    solidPolygonColor: '#ff0000', // New setting for solid polygon color
    wireframeColor: '#ffffff', // New setting for wireframe color
    sphereColor: '#00ff00', // New setting for sphere color
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let scene, camera, renderer, merkabaGroup, controls;

    const init = () => {
      // Scene setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(settings.backgroundColor);

      // Camera setup
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0, settings.size * 6);

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      containerRef.current.appendChild(renderer.domElement);

      // Controls setup
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // Lights setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(10, 10, 10);
      scene.add(pointLight);

      // Create base geometry and material
      const baseSize = 1; // Use a base size of 1 and scale later
      const geometry = new THREE.TetrahedronGeometry(baseSize);
      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: settings.wireframeColor, // Use wireframe color from settings
      });
      const solidMaterial = new THREE.MeshPhongMaterial({
        color: settings.solidPolygonColor, // Use solid polygon color from settings
        wireframe: false,
        side: THREE.DoubleSide,
      });

      // Create the Merkabah group
      merkabaGroup = new THREE.Group();

      // First tetrahedron (pointing up)
      const tetrahedronUp = new THREE.Mesh(geometry, solidMaterial);
      tetrahedronUp.rotation.x = Math.PI / 2; // Adjust rotation to point up
      tetrahedronUp.scale.setScalar(settings.size); // Scale based on settings
      tetrahedronUp.position.y = baseSize * settings.size / Math.sqrt(30000); // Adjust position

      // Second tetrahedron (pointing down)
      const tetrahedronDown = new THREE.Mesh(geometry, solidMaterial);
      tetrahedronDown.rotation.x = -Math.PI / 1; // Adjust rotation to point down
      tetrahedronDown.rotation.y = Math.PI; // Fully reverse orientation
      tetrahedronDown.scale.setScalar(settings.size); // Scale based on settings
      tetrahedronDown.position.y = -baseSize * settings.size / Math.sqrt(30000); // Adjust position

      // Add both tetrahedrons to the group
      merkabaGroup.add(tetrahedronUp);
      merkabaGroup.add(tetrahedronDown);

      // Add wireframe for intersecting edges
      const wireframeGeometry = new THREE.EdgesGeometry(geometry);
      const wireframeUp = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
      wireframeUp.rotation.x = Math.PI / 2;
      wireframeUp.scale.setScalar(settings.size);
      wireframeUp.position.y = baseSize * settings.size / Math.sqrt(30000);

      const wireframeDown = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
      wireframeDown.rotation.x = -Math.PI / 1;
      wireframeDown.rotation.y = Math.PI;
      wireframeDown.scale.setScalar(settings.size);
      wireframeDown.position.y = -baseSize * settings.size / Math.sqrt(30000);

      merkabaGroup.add(wireframeUp);
      merkabaGroup.add(wireframeDown);

      // Add small spheres at each vertex
      const vertexGeometry = new THREE.SphereGeometry(0.1 * settings.size, 16, 16);
      const vertexMaterial = new THREE.MeshBasicMaterial({ color: settings.sphereColor });

      const vertices = [
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(-1, -1, 1),
        new THREE.Vector3(-1, 1, -1),
        new THREE.Vector3(1, -1, -1),
      ];

      vertices.forEach(vertex => {
        const vertexSphereUp = new THREE.Mesh(vertexGeometry, vertexMaterial);
        vertexSphereUp.position.copy(vertex).multiplyScalar(settings.size / Math.sqrt(2));
        merkabaGroup.add(vertexSphereUp);

        const vertexSphereDown = new THREE.Mesh(vertexGeometry, vertexMaterial);
        vertexSphereDown.position.copy(vertex).multiplyScalar(settings.size / Math.sqrt(2)).negate();
        merkabaGroup.add(vertexSphereDown);
      });

      // Add wireframe for inner vertices
      const wireframeGeometryInner = new THREE.BufferGeometry().setFromPoints(vertices.flatMap(vertex => [
        vertex.clone().multiplyScalar(settings.size / Math.sqrt(2)),
        vertex.clone().multiplyScalar(settings.size / Math.sqrt(2)).negate()
      ]));
      const wireframeInner = new THREE.LineSegments(wireframeGeometryInner, wireframeMaterial);
      merkabaGroup.add(wireframeInner);

      // Align merkaba to the grid
      merkabaGroup.position.set(0, 0, 0); // Adjust as needed to align to the grid

      // Add solid polygons if enabled
      if (settings.showSolidPolygons) {
        const solidTetrahedronUp = new THREE.Mesh(geometry, solidMaterial);
        solidTetrahedronUp.rotation.x = Math.PI / 2;
        solidTetrahedronUp.scale.setScalar(settings.size);
        solidTetrahedronUp.position.y = baseSize * settings.size / Math.sqrt(25000);

        const solidTetrahedronDown = new THREE.Mesh(geometry, solidMaterial);
        solidTetrahedronDown.rotation.x = -Math.PI / 1;
        solidTetrahedronDown.rotation.y = Math.PI;
        solidTetrahedronDown.scale.setScalar(settings.size);
        solidTetrahedronDown.position.y = -baseSize * settings.size / Math.sqrt(40000);

        merkabaGroup.add(solidTetrahedronUp);
        merkabaGroup.add(solidTetrahedronDown);

        // Add wireframe on top of solid polygons
        const wireframeTetrahedronUp = new THREE.Mesh(geometry, wireframeMaterial);
        wireframeTetrahedronUp.rotation.x = Math.PI / 2;
        wireframeTetrahedronUp.scale.setScalar(settings.size);
        wireframeTetrahedronUp.position.y = baseSize * settings.size / Math.sqrt(40000);

        const wireframeTetrahedronDown = new THREE.Mesh(geometry, wireframeMaterial);
        wireframeTetrahedronDown.rotation.x = -Math.PI / 1;
        wireframeTetrahedronDown.rotation.y = Math.PI;
        wireframeTetrahedronDown.scale.setScalar(settings.size);
        wireframeTetrahedronDown.position.y = -baseSize * settings.size / Math.sqrt(25000);

        merkabaGroup.add(wireframeTetrahedronUp);
        merkabaGroup.add(wireframeTetrahedronDown);
      }

      // Set initial sacred geometry orientation for the entire group
      merkabaGroup.rotation.x = Math.PI / 6; // 30 degrees
      merkabaGroup.rotation.y = Math.PI / 4; // 45 degrees

      // Adjust camera position based on size
      camera.position.z = settings.size * 5;

      merkabaGroup.position.set(0, 0, 0); // Adjust as needed to align to the grid

      scene.add(merkabaGroup);

      // Grid Helper (optional)
      if (settings.showGrid) {
        const gridHelper = new THREE.GridHelper(200, 50);
        scene.add(gridHelper);
      }

      // Handle window resize
      window.addEventListener('resize', onWindowResize, false);
    };

    const onWindowResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const animate = () => {
      if (isPlaying) {
        merkabaGroup.rotation.x += settings.rotationSpeed;
        merkabaGroup.rotation.y += settings.rotationSpeed;
      }

      controls.update();
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    init();
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', onWindowResize);
      controls.dispose();
      renderer.dispose();
      containerRef.current.removeChild(renderer.domElement);
    };
  }, [settings, isPlaying]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : name === 'rotationSpeed' ? parseFloat(value) : value,
    }));
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100vh' }}
      />
      {showControls && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '10px',
          borderRadius: '5px',
        }}>
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
        </div>
      )}
    </div>
  );
};

export default MerkabaMeditation;
