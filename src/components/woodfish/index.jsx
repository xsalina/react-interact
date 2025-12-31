import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

// --- 1. 修复后的音频核心 (单例模式) ---
// 我们把 playSound 逻辑移到组件内部，利用 ref 保持上下文
const triggerSound = (audioCtxRef) => {
  if (!audioCtxRef.current) {
    // 第一次点击时初始化
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtxRef.current = new AudioContext();
    }
  }

  const ctx = audioCtxRef.current;
  if (!ctx) return;

  // 安卓浏览器的自动播放策略：如果上下文被挂起，必须由用户手势恢复
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const t = ctx.currentTime;

  // --- 声音合成 (保持原有的木鱼质感) ---
  
  // 1. 主体音 (三角波模拟木头共鸣)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.15); // 频率快速下潜
  
  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2); // 快速衰减
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.2); // 0.2秒后自动销毁节点

  // 2. 接触音 (正弦波模拟清脆的敲击瞬间)
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'sine';
  clickOsc.frequency.setValueAtTime(1000, t);
  
  clickGain.gain.setValueAtTime(0.4, t);
  clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
  
  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);
  clickOsc.start(t);
  clickOsc.stop(t + 0.05);
};

// --- 2. 背景组件 ---
const CyberBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', background: '#090014' }}>
    <motion.div
      animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{
        position: 'absolute', top: '-20%', left: '-20%', width: '80vw', height: '80vw',
        background: 'radial-gradient(circle, rgba(82, 0, 255, 0.4) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)',
      }}
    />
    <motion.div
      animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.5, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{
        position: 'absolute', bottom: '-20%', right: '-20%', width: '90vw', height: '90vw',
        background: 'radial-gradient(circle, rgba(0, 255, 234, 0.3) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(80px)',
      }}
    />
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
    }}></div>
  </div>
);

// --- 3. SVG 素材 ---
const WoodenFishSVG = () => (
  <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ overflow: 'visible' }}>
    <defs>
      <radialGradient id="woodGradient" cx="40%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#5e4b3e" />
        <stop offset="100%" stopColor="#2a1d15" />
      </radialGradient>
    </defs>
    <path d="M20,80 Q20,10 90,10 Q160,10 180,80 Q190,120 150,140 Q110,160 50,140 Q10,120 20,80 Z" fill="url(#woodGradient)" stroke="#ffcc00" strokeWidth="2" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.5))" />
    <path d="M40,70 Q90,60 140,70 Q150,75 140,85 Q90,95 40,85 Q30,75 40,70 Z" fill="#090014" stroke="#ffcc00" strokeWidth="1"/>
    <circle cx="150" cy="50" r="5" fill="#ffcc00" />
    <circle cx="165" cy="60" r="3" fill="#ffcc00" />
  </svg>
);

const MalletSVG = () => (
  <svg viewBox="0 0 100 300" width="100%" height="100%" style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id="stickGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3d2e24" />
        <stop offset="50%" stopColor="#6e5442" />
        <stop offset="100%" stopColor="#2b2016" />
      </linearGradient>
    </defs>
    <rect x="42" y="50" width="16" height="250" rx="5" fill="url(#stickGradient)" filter="drop-shadow(5px 5px 15px rgba(0,0,0,0.6))" />
    <ellipse cx="50" cy="50" rx="35" ry="45" fill="#5e4b3e" stroke="#ffcc00" strokeWidth="2" />
    <rect x="40" y="90" width="20" height="10" fill="#ffcc00" />
    <rect x="40" y="250" width="20" height="15" fill="#ffcc00" />
  </svg>
);

// --- 4. 仪表盘数字组件 ---
const CounterHUD = ({ count }) => {
  const formatCount = (num) => num.toString().padStart(7, '0');
  
  return (
    <div style={{
      position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
      zIndex: 40, textAlign: 'center', pointerEvents: 'none'
    }}>
      <div style={{ 
        color: 'rgba(255, 204, 0, 0.9)', 
        fontSize: '18px', 
        fontWeight: 'bold',
        letterSpacing: '8px',
        marginBottom: '8px',
        fontFamily: '"Microsoft YaHei", "Heiti SC", sans-serif',
        textShadow: '0 0 8px rgba(255, 204, 0, 0.5)'
      }}>
        功德无量
      </div>
      
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(0,0,0,0.4)', padding: '5px 15px', borderRadius: '4px',
        border: '1px solid rgba(255, 204, 0, 0.3)',
        boxShadow: '0 0 15px rgba(255, 204, 0, 0.1)'
      }}>
        {formatCount(count).split('').map((char, index) => (
          <motion.span
            key={`${index}-${char}`} 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              display: 'inline-block',
              fontFamily: '"Courier New", monospace',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#ffcc00',
              textShadow: '0 0 10px rgba(255, 204, 0, 0.8)',
              width: '20px'
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

// --- 5. 主程序 ---
export default function App() {
  const [totalMerit, setTotalMerit] = useState(() => {
    return Math.floor(Math.random() * (88 - 28 + 1)) + 28;
  });

  const [merits, setMerits] = useState([]);
  const [ripples, setRipples] = useState([]);
  
  const malletControls = useAnimation();
  const [malletState, setMalletState] = useState({ x: 0, y: 0, show: false });
  const hideTimerRef = useRef(null);
  
  // 关键修改：使用 useRef 存储唯一的 AudioContext
  const audioCtxRef = useRef(null);

  // 组件卸载时关闭 AudioContext，避免内存泄漏
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const handleTap = async (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // 关键修改：调用修复后的 triggerSound
    triggerSound(audioCtxRef);

    setTotalMerit(prev => prev + 1);

    const id = uuidv4();
    setMerits(prev => [...prev, { id, x: clientX, y: clientY }]);
    setRipples(prev => [...prev, { id, x: clientX, y: clientY }]);
    
    setTimeout(() => setMerits(prev => prev.filter(m => m.id !== id)), 1000);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);

    setMalletState({ x: clientX, y: clientY, show: true });
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    await malletControls.set({ rotate: -30, scale: 1, x: 20, y: -80 }); 
    await malletControls.start({
      rotate: [-30, 15, -10],
      x: [20, 0, 20],
      y: [-80, -20, -80],
      transition: { duration: 0.12, ease: "easeInOut" }
    });

    hideTimerRef.current = setTimeout(() => {
      setMalletState(prev => ({ ...prev, show: false }));
    }, 1000);
  };

  return (
    <div 
      style={{
        width: '100vw', height: '100vh',
        position: 'relative', overflow: 'hidden',
        touchAction: 'manipulation', userSelect: 'none',
        WebkitTapHighlightColor: 'transparent', cursor: 'pointer'
      }}
      onPointerDown={handleTap}
    >
      <CyberBackground />
      <CounterHUD count={totalMerit} />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              initial={{ width: 0, height: 0, opacity: 0.8, borderWidth: 4 }}
              animate={{ width: 500, height: 500, opacity: 0, borderWidth: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                position: 'absolute', left: ripple.x, top: ripple.y,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: '1px solid rgba(255, 204, 0, 0.6)',
                boxShadow: '0 0 15px rgba(255, 204, 0, 0.3)',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div style={{ 
        position: 'absolute', top: '50%', left: '50%', 
        transform: 'translate(-50%, -50%)', 
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <motion.div
          whileTap={{ scale: 0.95 }}
          animate={malletState.show ? { scale: [1, 0.95, 1] } : {}}
          transition={{ duration: 0.1 }}
          style={{ width: 'min(50vw, 280px)', height: 'min(40vw, 220px)' }}
        >
          <WoodenFishSVG />
        </motion.div>
      </div>

      <motion.div
        initial={false}
        animate={{ 
          opacity: malletState.show ? 1 : 0,
          x: malletState.x, 
          y: malletState.y 
        }}
        transition={{ duration: 0.05 }}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 100, height: 300,
          zIndex: 20,
          pointerEvents: 'none',
          transformOrigin: '50% 80%',
          marginLeft: -50,
          marginTop: -50
        }}
      >
        <motion.div animate={malletControls}>
          <MalletSVG />
        </motion.div>
      </motion.div>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
        <AnimatePresence>
          {merits.map(merit => (
            <motion.div
              key={merit.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -100, scale: 1.5 }}
              exit={{ opacity: 0, filter: 'blur(5px)' }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute', left: merit.x, top: merit.y - 80,
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontFamily: '"Microsoft YaHei", sans-serif',
                fontWeight: 'bold', fontSize: '24px',
                textShadow: '0 0 10px #ffcc00, 2px 2px 0px #000'
              }}
            >
              功德+1
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}