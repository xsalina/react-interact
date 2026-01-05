import React, { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Sparkles, Stars } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import styled, {
  createGlobalStyle,
  keyframes,
  ThemeProvider,
} from "styled-components";
// ⚠️ 务必确保这个路径正确，现在完全靠它了！
import { randomTexts } from "@/utils/writingText";
// 在其他 import 下面加这一行
import logoImg from "@/assets/logo.png"; // ⚠️ 替换成你实际的 logo 路径

// --- 🎨 0. 主题配置系统 (柔光护眼版) ---
// --- 🎨 0. 主题配置系统 (大光斑·氛围版) ---
const THEMES = [
  // Theme 0: 🧀 芝士海盐 -> 配 ☁️ 奶油白光斑
  {
    name: "Cheese",
    background: "linear-gradient(135deg, #FDC830 0%, #F37335 100%)",
    textPrimary: "#543a3a",
    textSecondary: "#fff",
    accent: "#F37335",
    sparkle: "#FFFACD", // LemonChiffon (柠檬绸色)，在橙黄背景上很通透
    glassBg: "rgba(255, 255, 255, 0.6)",
    glassBorder: "rgba(255, 255, 255, 0.8)",
  },

  // Theme 1: 🍓 草莓大福 -> 配 ✨ 香槟金光斑
  {
    name: "Berry",
    background:
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
    textPrimary: "#5e2a2a",
    textSecondary: "#fff",
    accent: "#ff758c",
    sparkle: "#FFE4B5", // Moccasin (鹿皮鞋色)，温暖的金色调
    glassBg: "rgba(255, 240, 245, 0.55)",
    glassBorder: "rgba(255, 255, 255, 0.7)",
  },

  // Theme 2: ☕️ 焦糖玛奇朵 -> 配 🍬 焦糖琥珀光斑
  {
    name: "Macchiato",
    background: "linear-gradient(135deg, #eacda3 0%, #d6ae7b 100%)",
    textPrimary: "#3b2e2e",
    textSecondary: "#f5e6d3",
    accent: "#8B4513",
    sparkle: "#FFD700", // Gold (纯金)，在咖色背景里非常高级
    glassBg: "rgba(255, 250, 240, 0.5)",
    glassBorder: "rgba(255, 255, 255, 0.6)",
  },

  // Theme 3: 🍊 橘子汽水 -> 配 🍋 柠檬黄光斑
  {
    name: "Soda",
    background: "linear-gradient(to right, #ff512f 0%, #dd2476 100%)",
    textPrimary: "#2c0e0e",
    textSecondary: "#ffcbcb",
    accent: "#ff0000",
    sparkle: "#FFFFE0", // LightYellow (亮黄)，在红橙背景里像气泡
    glassBg: "rgba(255, 230, 230, 0.45)",
    glassBorder: "rgba(255, 255, 255, 0.5)",
  },

  // Theme 4: 🍇 芋泥波波 -> 配 🔮 梦幻青光斑
  {
    name: "Taro",
    background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    textPrimary: "#4a2c68",
    textSecondary: "#fff",
    accent: "#c44569",
    sparkle: "#E0FFFF", // LightCyan (浅青)，跟紫色形成冷暖对比，很仙
    glassBg: "rgba(255, 255, 255, 0.5)",
    glassBorder: "rgba(255, 255, 255, 0.7)",
  },
];

// --- 1. 全局样式 (动态主题) ---
const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: ${(props) => props.theme.background}; 
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: none;
    transition: background 1s ease; 
  }
`;

// --- 2. 动画定义 ---
const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const zenBreath = keyframes`
  0% { 
    transform: scale(1) translateZ(0); 
    border-color: rgba(255, 255, 255, 0.5);
  }
  50% { 
    transform: scale(1.05) translateZ(10px); 
    border-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }
  100% { 
    transform: scale(1) translateZ(0); 
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const smoothScroll = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(0, -50%, 0); }
`;

// --- 3. 样式组件 ---
const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  padding-bottom: 5%;
  pointer-events: none;
`;

const CanvasWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

const MarqueeWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  width: 100%;
  max-width: 600px;
  height: 40vh;
  perspective: 1000px;
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 20%,
    black 80%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 20%,
    black 80%,
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
`;

const MarqueeTrack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0;
  gap: 40px;
  will-change: transform;
  transform-style: preserve-3d;
  animation: ${smoothScroll} 60s linear infinite;
  transform: rotateX(5deg);
`;

const MarqueeItem = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
  padding: 0 40px;

  background: ${(props) => props.theme.glassBg};
  backdrop-filter: blur(6px);
  border-radius: 100px;

  border: 2px solid ${(props) => props.theme.glassBorder};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

  color: ${(props) => props.theme.textPrimary};
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: 2px;
  white-space: nowrap;

  transform-style: preserve-3d;
  animation: ${zenBreath} 8s ease-in-out infinite;

  &:nth-child(odd) {
    animation-duration: 7s;
    animation-delay: 0s;
  }
  &:nth-child(even) {
    animation-duration: 9s;
    animation-delay: -3s;
  }
`;

const Title = styled(motion.h1)`
  margin-top: 25vh;
  color: ${(props) => props.theme.textPrimary};
  font-size: 3.8rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 0;
  z-index: 20;
  padding: 0 20px;
  text-shadow: 3px 3px 0px #fff, 0 0 20px rgba(255, 255, 255, 0.5);
  transform: translateZ(0);
  min-height: 1.5em;
  pointer-events: auto;
`;

const SubText = styled(motion.p)`
  color: ${(props) => props.theme.textSecondary};
  font-size: 1.1rem;
  margin-top: 20px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  z-index: 20;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ControlGroup = styled(motion.div)`
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 30;
  pointer-events: auto;
`;

const ActionArea = styled(motion.button)`
  width: 220px;
  height: 80px;
  border: none;
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.textPrimary};
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
`;

const BonusBadge = styled(motion.div)`
  margin-top: 20px;
  padding: 6px 14px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 800;
  color: ${(props) => props.theme.accent};
  background: linear-gradient(45deg, #fff, #ffeaa7, #fff);
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease infinite;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
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

  /* ❌ 原来是几乎不透明的白： background: rgba(255, 255, 255, 0.98); */

  /* ✅ 现在是通透的磨砂玻璃 */
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px); /* 强力模糊背景，聚焦前景 */
  -webkit-backdrop-filter: blur(20px);

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 50;
  pointer-events: auto;
`;

const LogoWrapper = styled(motion.img)`
  width: 120px; /* 根据你的 logo 形状调整大小 */
  height: 120px;
  object-fit: cover; /* 如果是圆形 logo 用 cover，如果是长方形用 contain */
  border-radius: 50%; /* 圆形切角，如果是长方形 logo 可以改成 20px */

  /* 💎 质感：加个白边和投影，像贴纸或徽章 */
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  z-index: 25; /* 保证在文字之上 */
  margin-bottom: 20px; /* 和标题拉开一点距离 */
  margin-top: 15vh; /* 📍 核心定位：把原来 Title 的 margin 分给它一部分 */

  pointer-events: auto; /* 允许点击 logo */
  cursor: pointer;
`;

// --- 4. 3D 背景组件 ---
const BackgroundScene = ({ theme }) => {
  return (
    <>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      </Float>
      <Sparkles
        count={110} /* ⚖️ 数量：100 (丰富但不拥挤) */
        scale={15} /* 📐 范围：分布在较大的空间里 */
        size={12} /* 🌕 大小：30 (超大柔光光斑，唯美感) */
        speed={0.5} /* 🍃 速度：中速漂浮 */
        opacity={0.9} /* 💧 透明度：清晰可见 */
        noise={0.4} /* 🌫 噪点：增加一点质感 */
        color={theme.sparkle}
      />
    </>
  );
};

// --- 5. 主程序 ---
export default function App() {
  const foods = ["梅干菜扣肉饼", "红糖烤饼", "葱花鲜肉饼"];
  const [currentFood, setCurrentFood] = useState("今天吃什么饼🫓?");
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const intervalRef = useRef(null);

  // 计算主题
  const currentTheme = useMemo(() => {
    const day = new Date().getDay();
    const themeIndex = day % THEMES.length;
    return THEMES[2];
  }, []);

  // 🔥 修正版：没有任何兜底数据！
  // 1. 读取 randomTexts
  // 2. 随机排序取30个
  // 3. 复制双份做滚动
  const marqueeList = useMemo(() => {
    // 技术性安全检查：防止 import 失败导致 crash
    const sourceData = Array.isArray(randomTexts) ? randomTexts : [];

    // 如果 sourceData 是空的，这里就是空的，不再生成假数据
    const shuffled = [...sourceData]
      .sort(() => 0.5 - Math.random())
      .slice(0, 30);
    return [...shuffled, ...shuffled];
  }, []);

  const handleToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (showResult) {
      setShowResult(false);
      setCurrentFood("今天吃什么饼🫓?");
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
      }, 80);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />

      <CanvasWrapper>
        <Suspense fallback={null}>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ alpha: true, antialias: false }}
          >
            <BackgroundScene theme={currentTheme} />
          </Canvas>
        </Suspense>
      </CanvasWrapper>

      <Container>
        {/* 调试信息：可以看到当前加载了多少条真实数据 */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            color: "rgba(0,0,0,0.1)",
            fontSize: "10px",
            zIndex: 999,
          }}
        >
          Theme: {currentTheme.name} | Items: {marqueeList.length / 2}
        </div>

        <MarqueeWrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <MarqueeTrack>
            {marqueeList.map((text, index) => (
              <MarqueeItem key={index}>{text}</MarqueeItem>
            ))}
          </MarqueeTrack>
        </MarqueeWrapper>
        {/* --- 📍 位置 1：主页 Logo --- */}
        {/* <LogoWrapper
          src={logoImg}
          alt="小白的烤饼"
          initial={{ scale: 0, opacity: 0, y: -50 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            rotate: [0, -5, 5, 0], // 微微晃动，像挂着的招牌
          }}
          transition={{ 
            type: "spring",
            duration: 1.5,
            rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" } // 持续轻微摆动
          }}
          whileHover={{ scale: 1.1, rotate: 0 }}
          whileTap={{ scale: 0.9 }}
        /> */}
        <Title
          animate={{
            scale: isSpinning ? 1.05 : 1,
            color: isSpinning ? currentTheme.accent : currentTheme.textPrimary,
          }}
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
              onPointerDown={handleToggle}
              whileTap={{ scale: 0.95 }}
              animate={
                isSpinning
                  ? {
                      scale: 0.98,
                      backgroundColor: currentTheme.accent,
                      color: "#fff",
                    }
                  : {
                      scale: [1, 1.02, 1],
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      color: currentTheme.textPrimary,
                      transition: {
                        scale: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      },
                    }
              }
            >
              {isSpinning ? "停！" : "开始随机 🎲"}
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
              onPointerDown={handleToggle}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} // 防止点卡片误触关闭
              >
                <div
                  style={{
                    padding: "30px",
                    /* 卡片本体：高亮白，但稍微透一点点 */
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "30px",
                    textAlign: "center",
                    /* 阴影：使用主题色的玻璃边框色，营造光晕感 */
                    boxShadow: `0 30px 80px -20px ${currentTheme.sparkle}`,
                    border: `1px solid ${currentTheme.glassBorder}`,
                    minWidth: "300px", // 保证宽度
                  }}
                >
                  {/* --- 📍 位置 2：结果卡片 Logo --- */}
                  <img
                    src={logoImg}
                    style={{
                      width: "140px", /* 根据你的 logo 形状调整大小 */
                      height: "140px",
                      borderRadius: "15px", /* 圆形切角，如果是长方形 logo 可以改成 20px */
                      objectFit:"cover", /* 如果是圆形 logo 用 cover，如果是长方形用 contain */
                      // border: "4px solid rgba(255, 255, 255, 0.8)",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                      marginBottom: "5px",
                      // boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "1rem",
                      color: currentTheme.accent, // 跟随主题强调色
                      fontWeight: "800",
                      marginBottom: "8px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                    }}
                  >
                    ✨ LUCKY CHOICE ✨
                  </div>

                  <div
                    style={{
                      fontSize: "1.1rem",
                      color: "#888",
                      marginBottom: "20px",
                      fontWeight: "500",
                    }}
                  >
                    今日份的快乐源泉是
                  </div>

                  <div
                    style={{
                      fontSize: "3.5rem",
                      fontWeight: "900",
                      color: currentTheme.textPrimary, // 跟随主题主色
                      marginBottom: "40px",
                      lineHeight: "1.2",
                      textShadow: "0 4px 10px rgba(0,0,0,0.05)",
                    }}
                  >
                    {currentFood}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggle}
                    style={{
                      border: "none",
                      padding: "16px 48px",
                      background: currentTheme.accent, // 按钮跟随主题
                      color: "#fff",
                      borderRadius: "50px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: `0 10px 25px -10px ${currentTheme.accent}`, // 按钮发光
                      outline: "none",
                    }}
                  >
                    再来一次 🎲
                  </motion.button>
                </div>
              </motion.div>
            </ResultOverlay>
          )}
        </AnimatePresence>
      </Container>
    </ThemeProvider>
  );
}
