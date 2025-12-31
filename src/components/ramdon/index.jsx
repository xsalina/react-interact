import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Cloud } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { createGlobalStyle, keyframes } from 'styled-components'; // 引入 keyframes 做流光

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); 
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
`;

// 定义流光动画关键帧
const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center; // 垂直居中
  align-items: center;
  z-index: 10;
  padding-bottom: 10%; // 稍微向上偏移一点，视觉重心更好
`;

const Title = styled(motion.h1)`
  color: #4a3b32;
  font-size: 3.5rem;
  font-weight: 900;
  text-align: center;
  margin: 0;
  z-index: 20;
  padding: 0 20px;
  text-shadow: 2px 2px 0px #fff, 4px 4px 0px rgba(0,0,0,0.1); 
`;

const SubText = styled(motion.p)`
  color: #fff;
  font-size: 1.1rem;
  margin-top: 20px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 20;
  margin-bottom: 40px; // 给下方按钮和提示留出空间
`;

// 新增：福利标签组件
const BonusBadge = styled(motion.div)`
  margin-bottom: 20px; // 与按钮的间距
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 800;
  color: #d35400;
  background: linear-gradient(45deg, #fff, #ffeaa7, #fff); // 金色流光底
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease infinite; // 流光动画
  box-shadow: 0 4px 15px rgba(211, 84, 0, 0.2);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ActionArea = styled(motion.button)`
  // 移除 absolute 定位，改为 Flex 布局自然排列
  // position: absolute; bottom: 15%; 
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
  background: rgba(255, 255, 255, 0.4); 
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  z-index: 30;
  outline: none;
`;

const ResultOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85); 
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 50;
`;

// --- 3D 背景 (保持极速版) ---
const BackgroundScene = () => {
  return (
    <>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <Cloud opacity={0.3} speed={2} width={10} depth={1.5} segments={20} position={[-4, 2, -5]} color="#fff" />
        <Cloud opacity={0.3} speed={2} width={10} depth={1.5} segments={20} position={[4, -2, -8]} color="#fff" />
      </Float>
      <Sparkles count={100} scale={12} size={8} speed={2.5} opacity={0.6} color="#d35400" />
    </>
  );
};

export default function App() {
  const foods = ['梅干菜扣肉饼', '红糖烤饼', '葱花鲜肉饼'];
  const [currentFood, setCurrentFood] = useState('今天吃什么饼🫓?');
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const intervalRef = useRef(null);

  const handleToggle = () => {
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
      intervalRef.current = setInterval(() => {
        const randomFood = foods[Math.floor(Math.random() * foods.length)];
        setCurrentFood(randomFood);
      }, 30);
    }
  };

  return (
    <>
      <GlobalStyle />
      
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }}>
          <BackgroundScene />
        </Canvas>
      </div>

      <Container>
        <AnimatePresence mode='wait'>
          <Title
            key={currentFood}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0, scale: isSpinning ? 1.1 : 1 }}
            transition={{ duration: 0.03 }}
          >
            {currentFood}
          </Title>
        </AnimatePresence>

        <SubText animate={{ opacity: isSpinning ? 0.8 : 0.6 }}>
          {isSpinning ? "点击锁定美味..." : "今日碳水命运指引"}
        </SubText>

        {/* 新增：免单提示 
          只在静止且未出结果时显示，开始滚动后隐藏以减少干扰
        */}
        <AnimatePresence>
          {!isSpinning && !showResult && (
            <BonusBadge
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: [0, -5, 0], // 上下漂浮动画
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" } // 这里的动画很柔和
              }}
            >
              <span>✨</span> 惊喜掉落：有机会免单！
            </BonusBadge>
          )}
        </AnimatePresence>

        {!showResult && (
          <ActionArea
            onClick={handleToggle}
            animate={isSpinning ? {
              scale: 0.95,
              backgroundColor: 'rgba(255, 87, 34, 0.8)',
              color: '#fff',
              boxShadow: "0 10px 40px rgba(255, 87, 34, 0.4)" 
            } : {
              scale: [1, 1.1, 1],
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              color: '#4a3b32',
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              transition: { scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            {isSpinning ? "停！" : "开始随机"}
          </ActionArea>
        )}

        <AnimatePresence>
          {showResult && (
            <ResultOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleToggle}
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
                  boxShadow: '0 20px 60px rgba(246, 211, 101, 0.6)',
                }}>
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
                  
                  {/* 结果页的小彩蛋 */}
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
                  </div> */}
                  
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