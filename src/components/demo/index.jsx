// src/App.jsx
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';

// 1. 一个会扭动的 3D 球（禁止蕉绿球）
function CoolBall() {
  return (
    <mesh visible position={[0, 0, 0]}>
      {/* 一个球体 */}
      <Sphere visible args={[1, 100, 200]} scale={2}>
        {/* 扭曲材质：distort=0.6 是扭曲程度 */}
        <MeshDistortMaterial 
          color="#8352FD" 
          attach="material" 
          distort={0.6} 
          speed={2} 
          roughness={0}
        />
      </Sphere>
    </mesh>
  );
}

export default function Demo() {
  const [showText, setShowText] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0', position: 'relative' }}>
      
      {/* 层级 1：3D 背景 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <CoolBall />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {/* 层级 2：UI 交互 */}
      <div style={{ 
        position: 'absolute', 
        zIndex: 10, 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, type: 'spring' }}
          style={{ color: 'white', fontSize: '3rem', textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
        >
          禁止蕉绿
        </motion.h1>
        
        <button 
          onClick={() => alert('这里准备放答案之书')}
          style={{ padding: '10px 20px', fontSize: '1.2rem', marginTop: '20px', cursor: 'pointer' }}
        >
          打开答案
        </button>
      </div>
    </div>
  );
}