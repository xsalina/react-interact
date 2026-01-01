import React, { useState, useRef, useEffect, Suspense } from 'react'; // 引入 Suspense 防止白屏
import { Canvas } from '@react-three/fiber';
import { Float, Sparkles, Stars } from '@react-three/drei'; // 换回 Stars，性能更好
import { motion, AnimatePresence } from 'framer-motion';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

// --- 全局样式 ---
const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #f6d365 0%, #ff9a9e 100%); 
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: none; /* 禁止整个页面的默认手势 */
  }
`;

// 动画定义
const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const gradientTextAnim = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// --- 容器 ---
const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10; /* 保证 UI 在最上层 */
  padding-bottom: 5%;
  pointer-events: none; /* 容器本身不接客，让子元素接客 */
`;

// --- 3D 背景容器 (关键修复) ---
const CanvasWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; 
  pointer-events: none; /* 🌟 核心修复：让点击穿透 Canvas，直达按钮 */
`;

const HeaderBadge = styled(motion.div)`
  position: absolute;
  top: 6%; 
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.6); 
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  z-index: 40;
  pointer-events: auto; /* 子元素开启点击 */
`;

const YearNumber = styled.span`
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: ${gradientTextAnim} 3s ease infinite;
`;

const GreetingText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  .main { font-size: 0.9rem; font-weight: 800; color: #4a3b32; }
  .sub { font-size: 0.65rem; color: rgba(74, 59, 50, 0.7); font-weight: 600; }
`;

const Title = styled(motion.h1)`
  color: #4a3b32;
  font-size: 3.5rem;
  font-weight: 900;
  text-align: center;
  margin: 0;
  z-index: 20;
  padding: 0 20px;
  text-shadow: 2px 2px 0px #fff; 
  transform: translateZ(0); 
  min-height: 1.5em; /* 锁死高度，防止文字变化时跳动 */
  pointer-events: auto;
`;

const SubText = styled(motion.p)`
  color: #fff;
  font-size: 1.1rem;
  margin-top: 20px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  z-index: 20;
`;

const ControlGroup = styled(motion.div)`
  margin-top: 60px; 
  display: flex;
  flex-direction: column;
  align-items: center;    
  position: relative;     
  z-index: 30;
  pointer-events: auto; /* 开启点击 */
`;

const ActionArea = styled(motion.button)`
  width: 220px;
  height: 80px;
  border: none;
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #4a3b32;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.8); /* 提高不透明度 */
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
`;

const BonusBadge = styled(motion.div)`
  margin-top: 20px; 
  padding: 6px 14px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 800;
  color: #d35400;
  background: linear-gradient(45deg, #fff, #ffeaa7, #fff);
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease infinite;
  box-shadow: 0 4px 10px rgba(211, 84, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: default;
  white-space: nowrap; 
`;

const ResultOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.98); /* 纯色背景，防止渲染问题 */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 50;
  pointer-events: auto;
`;

// --- 3D 背景 (轻量化版) ---
const BackgroundScene = () => {
  return (
    <>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {/* 移除 Cloud，改用简单的 Mesh 和 Stars，极大地降低 GPU 负载 */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      </Float>
      {/* 粒子效果保留，但数量减少，保证流畅 */}
      <Sparkles count={60} scale={10} size={6} speed={1} opacity={0.6} color="#d35400" />
    </>
  );
};

export default function App() {
  const foods = ['梅干菜扣肉饼', '红糖烤饼', '葱花鲜肉饼'];
  const [currentFood, setCurrentFood] = useState('今天吃什么饼🫓?');
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const intervalRef = useRef(null);

  // 核心交互逻辑
  const handleToggle = (e) => {
    // 彻底阻止任何可能的事件冒泡
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (showResult) {
      setShowResult(false);
      setCurrentFood('今天吃什么饼🫓?');
      return;
    }
    
    if (isSpinning) {
      clearInterval(intervalRef.current);
      setIsSpinning(false);
      const finalChoice = foods[Math.floor(Math.random() * foods.length)];
      setCurrentFood(finalChoice);
      setShowResult(true);
    } else {
      setIsSpinning(true);
      // 速度设为 100ms，保证 React 有足够时间渲染每一帧，避免“文字不动”
      intervalRef.current = setInterval(() => {
        const randomFood = foods[Math.floor(Math.random() * foods.length)];
        setCurrentFood(randomFood);
      }, 100); 
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <>
      <GlobalStyle />
      
      {/* 🌟 修复：CanvasWrapper 加上了 pointer-events: none */}
      <CanvasWrapper>
        {/* Suspense 确保资源没加载完之前不会白屏 */}
        <Suspense fallback={null}>
          <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true, antialias: false }}>
            <BackgroundScene />
          </Canvas>
        </Suspense>
      </CanvasWrapper>

      <Container>
        <HeaderBadge
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <YearNumber>2026</YearNumber>
          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.1)' }}></div>
          <GreetingText>
            <span className="main">元旦快乐 ✨</span>
            <span className="sub">新年第一顿吃点好的～</span>
          </GreetingText>
        </HeaderBadge>

        <Title
          animate={{ 
            scale: isSpinning ? 1.05 : 1,
            color: isSpinning ? '#ff5722' : '#4a3b32',
          }}
          // 移除所有耗性能的 transition，追求瞬间响应
          transition={{ duration: 0 }}
        >
          {currentFood}
        </Title>

        <SubText animate={{ opacity: isSpinning ? 0.8 : 0.6 }}>
          {isSpinning ? "点击锁定美味..." : "今日碳水命运指引"}
        </SubText>

        {!showResult && (
          <ControlGroup>
            <ActionArea
              // 🌟 修复：使用 onPointerDown 替代 onClick
              // onPointerDown 在手指接触屏幕瞬间触发，比 onClick 快 300ms
              onPointerDown={handleToggle}
              
              whileTap={{ scale: 0.95 }}
              animate={isSpinning ? {
                scale: 0.98,
                backgroundColor: 'rgba(255, 87, 34, 0.9)',
                color: '#fff',
              } : {
                scale: [1, 1.02, 1], // 减小呼吸幅度
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#4a3b32',
                transition: { scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }
              }}
            >
              {isSpinning ? "停！" : "开始随机"}
            </ActionArea>

            <AnimatePresence>
              {!isSpinning && (
                <BonusBadge
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span>🧧</span> 惊喜掉落：有机会免单！
                </BonusBadge>
              )}
            </AnimatePresence>
          </ControlGroup>
        )}

        <AnimatePresence>
          {showResult && (
            <ResultOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // 同样使用 onPointerDown 保证关闭弹窗也快
              onPointerDown={handleToggle}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: { type: "spring", stiffness: 300, damping: 15 } 
                }}
              >
                <div style={{ 
                  padding: '50px', 
                  background: '#fff', 
                  borderRadius: '30px', 
                  textAlign: 'center',
                  boxShadow: '0 20px 60px rgba(246, 211, 101, 0.4)',
                }}>
                  <div style={{ fontSize: '1rem', color: '#ff9a9e', fontWeight: 'bold', marginBottom: '5px' }}>
                     2026元旦快乐
                  </div>
                  <div style={{ fontSize: '1.2rem', color: '#999', marginBottom: '10px' }}>
                    决定就是你了
                  </div>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '900', 
                    color: '#e67e22',
                    marginBottom: '30px'
                  }}>
                    {currentFood}
                  </div>
                  
                  {/* <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#d35400', 
                    marginBottom: '20px', 
                    fontWeight: 'bold',
                    background: '#fff3cd',
                    padding: '5px 15px',
                    borderRadius: '15px',
                    display: 'inline-block'
                  }}>
                    截屏给老板看，万一免单了呢？😉
                  </div>
                   */}
                  <br/>

                  <div style={{ 
                    display: 'inline-block',
                    padding: '12px 36px',
                    background: '#e67e22',
                    color: '#fff',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 5px 15px rgba(230, 126, 34, 0.4)'
                  }}>
                    再来一次
                  </div>
                </div>
              </motion.div>
            </ResultOverlay>
          )}
        </AnimatePresence>

      </Container>
    </>
  );
}