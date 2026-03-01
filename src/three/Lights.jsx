import React from 'react';

export default function Lights() {
  return (
    <>
      {/* Ambient fill — cool blue for night match */}
      <ambientLight intensity={0.3} color="#5577aa" />

      {/* Main directional (moonlight angle) */}
      <directionalLight
        position={[8, 25, 12]}
        intensity={0.7}
        color="#ffeedd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0004}
      />

      {/* Stadium floodlights — 4 corners, brighter */}
      <spotLight position={[-14, 20, -8]} angle={0.5} penumbra={0.5} intensity={2.0} color="#fff8e0" castShadow />
      <spotLight position={[14, 20, -8]} angle={0.5} penumbra={0.5} intensity={2.0} color="#fff8e0" castShadow />
      <spotLight position={[-14, 20, 18]} angle={0.5} penumbra={0.5} intensity={1.2} color="#fff4dd" />
      <spotLight position={[14, 20, 18]} angle={0.5} penumbra={0.5} intensity={1.2} color="#fff4dd" />

      {/* Center dramatic spotlight on penalty area */}
      <spotLight position={[0, 16, 4]} angle={0.3} penumbra={0.85} intensity={1.2} color="#ffffff" target-position={[0, 0, 2]} castShadow />

      {/* Rim/back light — blue-ish for cinematic silhouette */}
      <pointLight position={[0, 4, -4]} intensity={0.6} color="#88bbff" distance={18} />

      {/* Warm fill from behind camera */}
      <pointLight position={[0, 5, 18]} intensity={0.35} color="#ffddaa" distance={25} />

      {/* Colored accent lights for drama — subtle */}
      <pointLight position={[-6, 2, 4]} intensity={0.15} color="#ff6644" distance={12} />
      <pointLight position={[6, 2, 4]} intensity={0.15} color="#4488ff" distance={12} />

      {/* Ground bounce light */}
      <pointLight position={[0, 0.3, 5]} intensity={0.2} color="#88cc88" distance={10} />
    </>
  );
}
