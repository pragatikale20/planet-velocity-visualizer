
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Planet {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
  mesh?: THREE.Mesh;
  angle: number;
}

const SolarSystem = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  const clockRef = useRef<THREE.Clock>();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [planets, setPlanets] = useState<Planet[]>([
    { name: 'Mercury', radius: 0.8, distance: 15, speed: 4.74, color: '#8C7853', angle: 0 },
    { name: 'Venus', radius: 1.2, distance: 20, speed: 3.50, color: '#FFC649', angle: 0 },
    { name: 'Earth', radius: 1.3, distance: 25, speed: 2.98, color: '#6B93D6', angle: 0 },
    { name: 'Mars', radius: 1.0, distance: 30, speed: 2.41, color: '#CD5C5C', angle: 0 },
    { name: 'Jupiter', radius: 3.5, distance: 40, speed: 1.31, color: '#D8CA9D', angle: 0 },
    { name: 'Saturn', radius: 3.0, distance: 50, speed: 0.97, color: '#FAD5A5', angle: 0 },
    { name: 'Uranus', radius: 2.2, distance: 60, speed: 0.68, color: '#4FD0E3', angle: 0 },
    { name: 'Neptune', radius: 2.1, distance: 70, speed: 0.54, color: '#4B70DD', angle: 0 }
  ]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    clockRef.current = new THREE.Clock();

    // Camera position
    camera.position.set(0, 50, 80);
    camera.lookAt(0, 0, 0);

    // Create starfield background
    const createStarfield = () => {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.5 });
      
      const starsVertices = [];
      for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
      }
      
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      const starField = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(starField);
    };

    // Create Sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 0.3
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xFFD700, 2, 200);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Create planets
    const planetMeshes: Planet[] = planets.map(planet => {
      const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: planet.color,
        shininess: 30
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Create orbit line
      const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.1, planet.distance + 0.1, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x555555, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      });
      const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbitLine.rotation.x = Math.PI / 2;
      scene.add(orbitLine);
      
      scene.add(mesh);
      return { ...planet, mesh };
    });

    setPlanets(planetMeshes);
    createStarfield();

    // Animation loop
    const animate = () => {
      if (!isPlaying) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const delta = clockRef.current?.getDelta() || 0;
      
      // Rotate sun
      sun.rotation.y += delta * 0.5;
      
      // Update planets
      planetMeshes.forEach(planet => {
        if (planet.mesh) {
          planet.angle += planet.speed * delta * 0.1;
          planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
          planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
          planet.mesh.rotation.y += delta * 2;
        }
      });

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Mouse controls
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown || !camera) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      camera.position.x += deltaX * 0.1;
      camera.position.y -= deltaY * 0.1;
      camera.lookAt(0, 0, 0);

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!camera) return;
      const factor = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(factor);
      camera.lookAt(0, 0, 0);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    // Update planet speeds when planets state changes
    planets.forEach(planet => {
      if (planet.mesh) {
        // Speed is already updated in the planets state
      }
    });
  }, [planets]);

  const handleSpeedChange = (planetName: string, newSpeed: number) => {
    setPlanets(prev => prev.map(planet => 
      planet.name === planetName ? { ...planet, speed: newSpeed } : planet
    ));
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setPlanets(prev => prev.map(planet => ({ ...planet, angle: 0 })));
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-sm max-h-[80vh] overflow-y-auto">
        <h2 className="text-white text-xl font-bold mb-4 text-center">Solar System Controls</h2>
        
        {/* Animation Controls */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={toggleAnimation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={resetAnimation}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* Planet Speed Controls */}
        <div className="space-y-4">
          {planets.map((planet) => (
            <div key={planet.name} className="bg-gray-800/50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{planet.name}</span>
                <span className="text-gray-300 text-sm">{planet.speed.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={planet.speed}
                onChange={(e) => handleSpeedChange(planet.name, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${planet.color} 0%, ${planet.color} ${(planet.speed / 10) * 100}%, #374151 ${(planet.speed / 10) * 100}%, #374151 100%)`
                }}
              />
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-gray-400 text-sm">
          <p>• Drag to rotate view</p>
          <p>• Scroll to zoom</p>
          <p>• Adjust sliders to control planet speeds</p>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 right-4 text-right">
        <h1 className="text-white text-3xl font-bold mb-2">Solar System Simulation</h1>
        <p className="text-gray-300">Interactive 3D Solar System with Three.js</p>
      </div>
    </div>
  );
};

export default SolarSystem;
