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
  description: string;
  label?: THREE.Sprite;
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
    { name: 'Mercury', radius: 0.8, distance: 15, speed: 4.74, color: '#5C4033', angle: 0, description: 'Smallest, closest to Sun' },
    { name: 'Venus', radius: 1.2, distance: 20, speed: 3.50, color: '#B8860B', angle: 0, description: 'Hottest planet, thick atmosphere' },
    { name: 'Earth', radius: 1.3, distance: 25, speed: 2.98, color: '#2E4057', angle: 0, description: 'Our blue home planet' },
    { name: 'Mars', radius: 1.0, distance: 30, speed: 2.41, color: '#8B0000', angle: 0, description: 'The red planet' },
    { name: 'Jupiter', radius: 3.5, distance: 40, speed: 1.31, color: '#A0826D', angle: 0, description: 'Largest planet, gas giant' },
    { name: 'Saturn', radius: 3.0, distance: 50, speed: 0.97, color: '#B8860B', angle: 0, description: 'Ringed planet' },
    { name: 'Uranus', radius: 2.2, distance: 60, speed: 0.68, color: '#1E6091', angle: 0, description: 'Ice giant, tilted rotation' },
    { name: 'Neptune', radius: 2.1, distance: 70, speed: 0.54, color: '#1E3A8A', angle: 0, description: 'Windiest planet, deep blue' }
  ]);

  const createTextTexture = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, 256, 64);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    
    return new THREE.CanvasTexture(canvas);
  };

  const createPlanetMaterial = (planetName: string, color: string) => {
    switch (planetName) {
      case 'Mercury':
        return new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 5,
          bumpScale: 0.3
        });
      
      case 'Venus':
        return new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 50,
          emissive: new THREE.Color(color).multiplyScalar(0.05)
        });
      
      case 'Earth':
        const earthMaterial = new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 30,
          specular: 0x111111
        });
        const earthTexture = new THREE.CanvasTexture(createEarthTexture());
        earthMaterial.map = earthTexture;
        return earthMaterial;
      
      case 'Mars':
        return new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 3,
          roughness: 0.9
        });
      
      case 'Jupiter':
        const jupiterTexture = new THREE.CanvasTexture(createJupiterTexture());
        return new THREE.MeshPhongMaterial({ 
          map: jupiterTexture,
          shininess: 20
        });
      
      case 'Saturn':
        return new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 25
        });
      
      case 'Uranus':
        return new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 40,
          transparent: true,
          opacity: 0.95
        });
      
      case 'Neptune':
        return new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 50,
          emissive: new THREE.Color(color).multiplyScalar(0.03)
        });
      
      default:
        return new THREE.MeshPhongMaterial({ color: color });
    }
  };

  const createEarthTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create a darker blue base
    ctx.fillStyle = '#1E3A5F';
    ctx.fillRect(0, 0, 512, 256);
    
    // Add darker green continents
    ctx.fillStyle = '#1B4332';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const size = 20 + Math.random() * 40;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add subtle white clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const size = 10 + Math.random() * 20;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return canvas;
  };

  const createJupiterTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create darker horizontal bands
    const colors = ['#8B6914', '#8B4513', '#A0522D', '#654321', '#B8860B'];
    
    for (let y = 0; y < 256; y += 20) {
      const colorIndex = Math.floor(y / 20) % colors.length;
      ctx.fillStyle = colors[colorIndex];
      ctx.fillRect(0, y, 512, 20);
    }
    
    // Add the Great Red Spot
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.ellipse(300, 140, 40, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
  };

  const createSaturnRings = (scene: THREE.Scene, saturn: THREE.Mesh) => {
    const ringGeometry = new THREE.RingGeometry(4.5, 7, 64);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B7355,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2;
    rings.position.copy(saturn.position);
    scene.add(rings);
    return rings;
  };

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

    // Create enhanced starfield background
    const createStarfield = () => {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({ 
        color: 0xFFFFFF, 
        size: 1,
        sizeAttenuation: false
      });
      
      const starsVertices = [];
      const starsColors = [];
      for (let i = 0; i < 15000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
        
        const brightness = 0.5 + Math.random() * 0.5;
        starsColors.push(brightness, brightness, brightness);
      }
      
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
      
      starsMaterial.vertexColors = true;
      const starField = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(starField);
    };

    // Create enhanced Sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 0.6
    });
    
    // Add sun corona effect
    const coronaGeometry = new THREE.SphereGeometry(6, 32, 32);
    const coronaMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFA500,
      transparent: true,
      opacity: 0.2,
      emissive: 0xFFA500,
      emissiveIntensity: 0.3
    });
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    scene.add(corona);
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Add Sun label
    const sunLabelTexture = createTextTexture('Sun');
    const sunLabelMaterial = new THREE.SpriteMaterial({ map: sunLabelTexture });
    const sunLabel = new THREE.Sprite(sunLabelMaterial);
    sunLabel.position.set(0, 8, 0);
    sunLabel.scale.set(8, 2, 1);
    scene.add(sunLabel);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xFFD700, 3, 300);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    scene.add(pointLight);

    // Create planets with enhanced materials and labels
    const planetMeshes: Planet[] = planets.map(planet => {
      const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
      const material = createPlanetMaterial(planet.name, planet.color);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Create planet label
      const labelTexture = createTextTexture(planet.name);
      const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });
      const label = new THREE.Sprite(labelMaterial);
      label.scale.set(6, 1.5, 1);
      scene.add(label);
      
      // Create enhanced orbit lines
      const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.1, planet.distance + 0.1, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x444444, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15
      });
      const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbitLine.rotation.x = Math.PI / 2;
      scene.add(orbitLine);
      
      scene.add(mesh);
      return { ...planet, mesh, label };
    });

    // Add Saturn's rings
    const saturn = planetMeshes.find(p => p.name === 'Saturn');
    let saturnRings: THREE.Mesh | null = null;
    if (saturn && saturn.mesh) {
      saturnRings = createSaturnRings(scene, saturn.mesh);
    }

    setPlanets(planetMeshes);
    createStarfield();

    // Enhanced animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (!isPlaying) {
        renderer.render(scene, camera);
        return;
      }

      const delta = clockRef.current?.getDelta() || 0;
      
      // Enhanced sun rotation with pulsing effect
      sun.rotation.y += delta * 0.3;
      const pulseScale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
      corona.scale.setScalar(pulseScale);
      corona.rotation.y -= delta * 0.2;
      
      // Update planets with enhanced features
      planetMeshes.forEach(planet => {
        if (planet.mesh && planet.label) {
          planet.angle += planet.speed * delta * 0.1;
          planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
          planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
          
          // Position label above planet
          planet.label.position.x = planet.mesh.position.x;
          planet.label.position.y = planet.mesh.position.y + planet.radius + 2;
          planet.label.position.z = planet.mesh.position.z;
          
          // Individual planet rotations
          if (planet.name === 'Earth') {
            planet.mesh.rotation.y += delta * 3;
          } else if (planet.name === 'Jupiter') {
            planet.mesh.rotation.y += delta * 2.5;
          } else {
            planet.mesh.rotation.y += delta * 1.5;
          }
          
          // Update Saturn's rings position
          if (planet.name === 'Saturn' && saturnRings) {
            saturnRings.position.copy(planet.mesh.position);
            saturnRings.rotation.z += delta * 0.5;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

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
  }, [isPlaying]);

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
      
      {/* Enhanced Control Panel */}
      <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-sm rounded-lg p-4 max-w-sm max-h-[80vh] overflow-y-auto border border-gray-700">
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

        {/* Enhanced Planet Speed Controls */}
        <div className="space-y-4">
          {planets.map((planet) => (
            <div key={planet.name} className="bg-gray-800/60 p-3 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-medium">{planet.name}</span>
                <span className="text-gray-300 text-sm">{planet.speed.toFixed(2)}</span>
              </div>
              <p className="text-gray-400 text-xs mb-2">{planet.description}</p>
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
          <p>• Scroll to zoom in/out</p>
          <p>• Adjust sliders to control speeds</p>
        </div>
      </div>

      {/* Enhanced Title */}
      <div className="absolute top-4 right-4 text-right">
        <h1 className="text-white text-3xl font-bold mb-2 drop-shadow-lg">Solar System Simulation</h1>
        <p className="text-gray-300">Interactive 3D Solar System with Enhanced Visuals</p>
      </div>
    </div>
  );
};

export default SolarSystem;
