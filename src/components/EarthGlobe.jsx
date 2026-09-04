import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, ChevronLeft, Compass, Globe } from 'lucide-react';

// The 3 distinct locations pinned on the globe
const GLOBE_MARKERS = [
  { id: '1', name: 'Mr. Akshat K Sharma', lat: 21.0, lon: 78.5, role: 'Asia / India' },
  { id: '2', name: 'Dr. Pradeep Golani', lat: 51.5, lon: -0.1, role: 'Europe / UK' },
  { id: '3', name: 'Dr. Reetesh Chourasia', lat: 37.5, lon: -122.0, role: 'North America / USA' }
];

// Convert geographic lat/lon to 3D Cartesian coordinates on sphere
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function EarthGlobe({ onToggleFullscreen, isFullscreen = false, onClose }) {
  const mountRef = useRef(null);
  const reqIdRef = useRef(null);
  const groupRef = useRef(null);
  const cloudsRef = useRef(null);
  const cameraRef = useRef(null);

  const [screenCoords, setScreenCoords] = useState([]);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0.003, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = isFullscreen 
      ? Math.min(window.innerWidth, 392) 
      : 44;
    const height = isFullscreen 
      ? (container.clientHeight || 560) 
      : 44;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(isFullscreen ? 45 : 45, width / height, 0.1, 1000);
    camera.position.z = isFullscreen ? 2.7 : 2.6;
    cameraRef.current = camera;

    // 2. WebGL Renderer with High DPI
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Globe Parent Group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // 4. Photorealistic NASA Blue Marble Texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/textures/earth_atmos_2048.jpg');
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const radius = 1.0;
    const earthGeo = new THREE.SphereGeometry(radius, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specular: new THREE.Color(0x223355),
      shininess: 25,
      emissive: new THREE.Color(0x04060e)
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    group.add(earthMesh);

    // 5. Cloud Layer
    let cloudsMesh = null;
    const cloudsTexture = textureLoader.load('/textures/earth_clouds_1024.png');
    const cloudsGeo = new THREE.SphereGeometry(radius * 1.012, 48, 48);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });
    cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    group.add(cloudsMesh);
    cloudsRef.current = cloudsMesh;

    // 6. Atmospheric Glow Rim Light (Soft Blue/Violet)
    const atmosGeo = new THREE.SphereGeometry(radius * 1.03, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x8877ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    group.add(atmosMesh);

    // 7. Background Starfield (Fullscreen only)
    if (isFullscreen) {
      const starGeo = new THREE.BufferGeometry();
      const starCount = 300;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 20;
        starPositions[i + 1] = (Math.random() - 0.5) * 20;
        starPositions[i + 2] = -3 - Math.random() * 8;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xddeeff,
        size: 0.04,
        transparent: true,
        opacity: 0.6
      });
      const starPoints = new THREE.Points(starGeo, starMat);
      scene.add(starPoints);
    }

    // 8. Add Pinned 3D Markers (Fullscreen only)
    const markerData = [];
    if (isFullscreen) {
      GLOBE_MARKERS.forEach((m) => {
        const pos = latLonToVector3(m.lat, m.lon, radius * 1.018);
        
        // Pin Sphere
        const pinGeo = new THREE.SphereGeometry(0.035, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({ color: 0xe471ed });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(pos);
        group.add(pinMesh);

        markerData.push({ marker: m, localPos: pos });
      });
    }

    // 9. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const purpleBacklight = new THREE.PointLight(0x8e2de2, 2.0, 10);
    purpleBacklight.position.set(-3, -2, -2);
    scene.add(purpleBacklight);

    // 10. Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (!isDraggingRef.current) {
        // Auto-rotation with velocity damping
        group.rotation.y += velocityRef.current.x;
        group.rotation.x += velocityRef.current.y;
        velocityRef.current.x = THREE.MathUtils.lerp(velocityRef.current.x, isFullscreen ? 0.0025 : 0.008, 0.02);
        velocityRef.current.y = THREE.MathUtils.lerp(velocityRef.current.y, 0, 0.05);
      }

      // Gentle cloud drift
      if (cloudsMesh) {
        cloudsMesh.rotation.y += 0.0006;
      }

      // Calculate 2D screen projections for pins in fullscreen
      if (isFullscreen && cameraRef.current) {
        const coords = markerData.map(({ marker, localPos }) => {
          const worldPos = localPos.clone().applyEuler(group.rotation);
          
          // Visibility check: dot product with camera direction
          const camDir = camera.position.clone().normalize();
          const dot = worldPos.clone().normalize().dot(camDir);
          const isVisible = dot > 0.12;

          const projected = worldPos.clone().project(camera);
          const screenX = ((projected.x + 1) / 2) * width;
          const screenY = ((-projected.y + 1) / 2) * height;

          return {
            ...marker,
            x: screenX,
            y: screenY,
            isVisible,
            opacity: Math.max(0, Math.min(1, (dot - 0.12) * 3.0))
          };
        });
        setScreenCoords(coords);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      earthTexture.dispose();
      cloudsTexture.dispose();
    };
  }, [isFullscreen]);

  // Touch / Pointer Drag Handler for Fullscreen Globe
  const handlePointerDown = (e) => {
    if (!isFullscreen) return;
    isDraggingRef.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    prevMouseRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e) => {
    if (!isFullscreen || !isDraggingRef.current || !groupRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - prevMouseRef.current.x;
    const deltaY = clientY - prevMouseRef.current.y;

    groupRef.current.rotation.y += deltaX * 0.005;
    groupRef.current.rotation.x += deltaY * 0.005;

    // Clamp vertical tilt
    groupRef.current.rotation.x = Math.max(-0.85, Math.min(0.85, groupRef.current.rotation.x));

    velocityRef.current = { x: deltaX * 0.003, y: deltaY * 0.003 };
    prevMouseRef.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Thumbnail Globe Button on Home Screen
  if (!isFullscreen) {
    return (
      <div
        onClick={onToggleFullscreen}
        className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#4A00E0] via-[#8E2DE2] to-[#E471ED] cursor-pointer shadow-[0_0_16px_rgba(178,75,243,0.45)] hover:scale-105 active:scale-95 transition-all group flex items-center justify-center"
        title="Explore IC1101 Global Presence"
      >
        <div 
          ref={mountRef} 
          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-[#07060A] pointer-events-none"
        />
        {/* Subtle breathing ring */}
        <div className="absolute inset-0 rounded-full border border-purple-300/30 pointer-events-none animate-pulse" />
      </div>
    );
  }

  // Fullscreen 100% Solid Opaque Modal (Zero bleed-through)
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-between select-none"
      style={{
        backgroundColor: '#07060B',
        paddingTop: `calc(1.25rem + var(--safe-area-inset-top, 0px))`,
        paddingBottom: `calc(1.25rem + var(--safe-area-inset-bottom, 0px))`,
        paddingLeft: `calc(1.25rem + var(--safe-area-inset-left, 0px))`,
        paddingRight: `calc(1.25rem + var(--safe-area-inset-right, 0px))`
      }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-20 pt-2 pb-2">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/90 hover:text-white hover:border-purple-400/40 active:scale-90 transition-all shadow-sm"
          aria-label="Back to Home"
        >
          <ChevronLeft size={22} className="-ml-0.5" />
        </button>

        <div className="text-center">
          <h3 className="text-[16px] font-semibold text-white tracking-tight">
            IC1101 Global Presence
          </h3>
          <span className="text-[11px] text-fuchsia-300/75 font-medium block">
            Worldwide Research Nodes
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/90 hover:text-white hover:border-purple-400/40 active:scale-90 transition-all shadow-sm"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* 3D Earth Display Area with Touch/Mouse Drag Controls */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden my-2 cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Three.js Canvas Container (55-60% screen width, full sphere visible) */}
        <div
          ref={mountRef}
          className="flex items-center justify-center"
          style={{ width: '340px', height: '340px' }}
        />

        {/* Ambient atmospheric purple glow behind the globe */}
        <div className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-r from-[#4A00E0]/25 via-[#8E2DE2]/30 to-[#E471ED]/25 blur-3xl pointer-events-none -z-10" />

        {/* Dynamic Projected Pinned Labels */}
        {screenCoords.map((pin) => (
          pin.isVisible && (
            <div
              key={pin.id}
              className="absolute pointer-events-none transition-opacity duration-150 flex flex-col items-center"
              style={{
                left: `${pin.x}px`,
                top: `${pin.y}px`,
                transform: 'translate(-50%, -100%)',
                opacity: pin.opacity
              }}
            >
              {/* Elegant Label with Purple Theme */}
              <div className="px-3 py-1.5 rounded-full bg-[#141022]/90 border border-[#B24BF3]/60 shadow-[0_4px_20px_rgba(178,75,243,0.55)] flex items-center space-x-1.5 backdrop-blur-xl whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E471ED] shadow-[0_0_6px_#E471ED]" />
                <span className="text-[12px] font-semibold text-white tracking-tight">{pin.name}</span>
              </div>
              {/* Thin Stem Connecting Pin to Sphere */}
              <div className="w-[1px] h-3.5 bg-gradient-to-b from-[#E471ED] to-transparent" />
            </div>
          )
        ))}
      </div>

      {/* Bottom Subtitle / Legend */}
      <div className="z-20 pt-1 pb-2 text-center">
        <span className="text-[12px] font-medium text-white/50 tracking-wide">
          Drag to explore · 3 Locations
        </span>
      </div>
    </div>
  );
}
