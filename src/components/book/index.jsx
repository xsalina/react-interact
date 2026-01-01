import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

// --- ⚙️ 全局配置 ---
const CONFIG = {
  duration: 2.2,       
  stagger: 0.15,       
  perspective: 2500,
  leatherColor: '#1a0b0c', 
  paperColor: '#f3e5d0',   
  textColor: '#2b1b17',    
  pageCount: 6,
  fanAngle: 5,
  bgGradient: 'radial-gradient(circle at center, #1f2335 0%, #050505 100%)'
};

const ANSWERS = [
  "答案显而易见",
  "再多一点耐心",
  "听从直觉",
  "这就是信号",
  "结果会让你惊喜",
  "绝不",
  "坚持下去",
  "换个角度看",
  "是的，毫无疑问",
  "放下执念",
  "你会后悔的",
  "孤注一掷",
  "专注于当下",
  "不要回头",
  "运气站在你这边",
  "大笑三声",
  "保持沉默",
  "时机未到",
  "去冒险吧",
  "不要犹豫",
  "机会难得",
  "听从内心的声音",
  "这不是个好主意",
  "你需要更多信息",
  "现在行动",
  "放手一搏",
  "结果会很棒",
  "谨慎行事",
  "大胆尝试",
  "答案隐藏在细节中",
  "信任你的直觉",
  "这是命运的指引",
  "不要害怕失败",
  "机会稍纵即逝",
  "你会成功的",
  "保持乐观",
  "这需要时间",
  "去追寻你的梦想",
  "不要回避挑战",
  "相信过程",
  "你已经准备好了",
  "结果可能出乎意料",
  "坚持就是胜利",
  "这是个陷阱",
  "你需要更有耐心",
  "去问问专家",
  "答案就在眼前",
  "不要轻易放弃",
  "这是个好机会",
  "你会找到答案的",
  "现在不是时候",
  "相信自己",
  "保持冷静",
  "再等等",
  "是的",
  "跟随你的心",
  "不要以此为赌注",
  "绝对可以",
  "现在还太早",
  "这真的重要吗？",
  "毫无疑问",
  "结果可能不尽如人意",
  "你需要寻求帮助",
  "这就去行动",
  "不要做愚蠢的事",
  "去问问你最信任的人",
  "结局会让你惊喜",
  "一个月后再问",
  "专注于你的目标",
  "你是对的",
  "情况很快会发生变化",
  "这不值得你费心",
  "不要忽略细节",
  "值得一试",
  "现在放弃是最好的选择",
  "这取决于你的决心",
  "这是你一直在等的时机",
  "不要急于下结论",
  "如果你必须问，那答案就是否定的",
  "放下你的自尊",
  "让事情自然发展",
  "无论如何，不要这样做",
  "换个角度看问题",
  "哪怕是为了取悦自己，也值得",
  "等待一个更好的机会",
  "这会让你夜不能寐",
  "这也是生活的一部分",
  "这会带来好运",
  "耐心是关键",
  "你需要停下来",
  "无论结果如何，都要接受",
  "把它变成现实",
  "现在看来还不明朗",
  "这是一个陷阱",
  "你需要更灵活一点",
  "相信你的直觉，它是对的",
  "你需要先处理好其他事",
  "不要在这个问题上浪费时间了",
  "不要被情绪左右",
  "如果你不抗拒，结果就是好的",
  "如果现在行动，你会手忙脚乱",
  "你要面对现实",
  "这是成长的代价",
  "这是个好主意",
  "再考虑一下",
  "这不太可能发生",
  "你需要为此付出代价",
  "也许过几天你会改变主意",
  "不要强求",
  "这无关紧要",
  "不要犹豫，去吧",
  "把决定留给明天",
  "这会带来麻烦",
  "做一个大胆的决定",
  "这将是你做过最好的决定",
  "现在不是采取行动的时候",
  "保留你的实力，别用在这里",
  "如果你改变现在的想法，结果就会不同",
  "所有的信号都指向“可行”",
  "先观察一下别人的做法",
  "最好别这么做",
  "你是唯一能决定的人",
  "你会获得支持的",
  "保持现状",
  "让子弹再飞一会儿",
  "笑一笑，这没什么大不了的"
];

// --- 🖋️ 样式定义 ---
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

  body, html {
    margin: 0; padding: 0; width: 100%; height: 100%;
    background: ${CONFIG.bgGradient};
    overflow: hidden;
    font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
`;

const Scene = styled.div`
  width: 100vw; height: 100vh;
  display: flex; justify-content: center; align-items: center;
  perspective: ${CONFIG.perspective}px;
  position: relative;
  z-index: 1; 
`;

const BookRoot = styled(motion.div)`
  width: 380px; height: 540px;
  position: relative;
  transform-style: preserve-3d;
  cursor: pointer;
  z-index: 10;
  
  @media (max-width: 768px) {
    width: 300px; height: 430px;
  }
`;

const PageBase = styled(motion.div)`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 2px 8px 8px 2px;
  transform-origin: left center;
  transform-style: preserve-3d;
  box-shadow: inset 1px 0 2px rgba(0,0,0,0.1);
`;

const BackCover = styled(PageBase)`
  background: ${CONFIG.leatherColor};
  z-index: 0;
  box-shadow: 25px 30px 60px rgba(0,0,0,0.6);
`;

const RightPaperBlock = styled(PageBase)`
  background: ${CONFIG.paperColor};
  z-index: 1;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: inset 15px 0 25px rgba(0,0,0,0.1), 1px 0 0 #e6d6c0, 2px 0 0 #e6d6c0, 3px 0 0 #e6d6c0;
`;

const MovingPage = styled(PageBase)`
  background: ${CONFIG.paperColor};
  z-index: 5;
  border: 1px solid rgba(0,0,0,0.05);
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
`;

const FrontCover = styled(PageBase)`
  background: ${CONFIG.leatherColor};
  z-index: 100;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  border: 1px solid #3e2723;
  backface-visibility: hidden;
  background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0px, transparent 2px, transparent 6px);

  &::after {
    content: ''; position: absolute;
    top: 20px; bottom: 20px; left: 20px; right: 20px;
    border: 2px solid rgba(212, 175, 55, 0.4);
    border-radius: 2px;
  }
`;

const AnswerContainer = styled(motion.div)`
  width: 100%; height: 100%;
  position: absolute; top: 0; left: 0;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 20px;
  box-sizing: border-box;
  background-color: ${CONFIG.paperColor};
  backface-visibility: visible;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");

  &.flipped {
    transform: rotateY(180deg);
  }
`;

const BorderFrame = styled(motion.div)`
  width: 100%; height: 100%;
  border: 3px double rgba(43, 27, 23, 0.2);
  display: flex; flex-direction: column; 
  justify-content: center;
  align-items: center;
  position: relative; 

  &::before {
    content: '✦'; position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
    color: #bfa05f; font-size: 1.5rem;
  }
  &::after {
    content: '✦'; position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%);
    color: #bfa05f; font-size: 1.5rem;
  }
`;

const MysticSymbol = styled(motion.div)`
  font-size: 3rem;
  color: rgba(43, 27, 23, 0.15);
  margin-bottom: 20px;
  font-weight: bold;
`;

const AnswerText = styled(motion.h2)`
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  font-size: 3rem; 
  color: ${CONFIG.textColor};
  line-height: 1.3;
  margin: 0;
  text-align: center;
  text-shadow: 0px 1px 0px rgba(255,255,255,0.8);
  padding: 0 10px;
`;

const SubText = styled(motion.div)`
  position: absolute;      
  bottom: 35px;            
  left: 50%; 
  transform: translateX(-50%);
  width: 140px;
  text-align: center;
  font-family: 'Noto Serif SC', serif;
  font-size: 0.85rem;
  letter-spacing: 0.3em; 
  color: #8d6e63;
  font-weight: bold;
  opacity: 0.6;
  border-top: 1px solid rgba(141, 110, 99, 0.3);
  padding-top: 8px;
`;

// --- 🌟 引导层 (保持你的最终位置调整) ---
const InstructionOverlay = styled(motion.div)`
  position: fixed;
  top: 50%; 
  left: 50%; 
  margin: auto;
  
  /* 你的自定义偏移 */
  margin-top: -220px;
  
  width: 380px;
  pointer-events: none;
  z-index: 9999;
  
  display: flex;
  justify-content: center; 
  align-items: center;
  
  @media (max-width: 768px) {
    transform: translate(-50%, -50%) scale(0.9);
    margin-top: 140px; 
  }
`;

const InstructionBox = styled(motion.div)`
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 10px 24px;
  border-radius: 99px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  
  display: flex;
  align-items: center;
  gap: 12px;
  
  box-shadow: 0 5px 20px rgba(0,0,0,0.4);
`;

const TapIcon = styled(motion.div)`
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.7);
  position: relative;
  
  &::before {
    content: ''; position: absolute;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 5px; height: 5px;
    background: #d4af37;
    border-radius: 50%;
  }
`;

const TextGroup = styled.div`
  display: flex; flex-direction: column; align-items: flex-start;
`;

const MainInstruction = styled.div`
  font-family: 'Noto Serif SC', serif;
  font-size: 0.95rem;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
`;

const SubInstruction = styled.div`
  font-family: 'Noto Serif SC', serif;
  font-size: 0.7rem;
  letter-spacing: 2px;
  color: #d4af37;
  opacity: 0.8;
  margin-top: 2px;
`;

function BackgroundEffect() {
  return <Sparkles count={50} scale={12} size={3} speed={0.4} opacity={0.5} color="#ffd700" />;
}

// --- 🚀 主逻辑 ---
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ text: "", side: "right" });

  const toggleBook = () => {
    if (!isOpen) {
      const text = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      const side = Math.random() > 0.5 ? "left" : "right";
      setData({ text, side });
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setTimeout(() => setData({ text: "", side: "right" }), 2000);
    }
  };

  const transitionConfig = (index, isCover = false) => {
    if (isOpen) {
      return { duration: CONFIG.duration, ease: [0.2, 0.6, 0.2, 1], delay: isCover ? 0 : index * CONFIG.stagger };
    } else {
      return { duration: isCover ? 2.0 : 1.2, ease: [0.4, 0, 0.2, 1], delay: isCover ? 0.3 : 0 };
    }
  };

  const revealDelay = CONFIG.duration + (CONFIG.pageCount * CONFIG.stagger);

  const AnswerContent = () => (
    <AnswerContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: revealDelay * 0.8, duration: 1 }}
    >
      <BorderFrame
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }} 
      >
        <MysticSymbol
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
        >👁</MysticSymbol>
        
        <AnimatePresence mode='wait'>
          <AnswerText
            key={data.text}
            initial={{ opacity: 0, filter: 'blur(10px)', y: 5 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ delay: 3.5, duration: 2.0, ease: "easeOut" }} 
          >
            {data.text}
          </AnswerText>
        </AnimatePresence>

        <SubText
             initial={{ opacity: 0 }}
             animate={{ opacity: 0.8 }}
             transition={{ delay: 0.7, duration: 1 }}
        >命运如是说</SubText>

      </BorderFrame>
    </AnswerContainer>
  );

  return (
    <>
      <GlobalStyle />
      
      <div style={{position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none'}}>
        <Canvas camera={{ position: [0, 0, 8] }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <BackgroundEffect />
        </Canvas>
      </div>

      <Scene>
        <BookRoot 
          onClick={toggleBook}
          whileHover={{ y: -5, transition: { duration: 0.3 } }}
          whileTap={{ scale: 0.95 }}
          
          variants={{
            closed: { 
              x: 0, 
              scale: 1, 
              transition: { duration: 1.5, ease: "easeInOut" } 
            },
            open: { 
              x: 150,
              scale: 1.15, 
              transition: { duration: 2.2, ease: [0.2, 0.6, 0.2, 1] } 
            }
          }}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
        >
          <BackCover />
          
          <RightPaperBlock>
            {isOpen && data.side === 'right' && <AnswerContent />}
            <motion.div style={{position: 'absolute', inset: 0, background: '#1a0b0c'}} animate={{ opacity: isOpen ? 0 : 0.8 }} transition={{ duration: 1.5 }} />
          </RightPaperBlock>

          {[...Array(CONFIG.pageCount)].map((_, index) => {
            const isLastPage = index === CONFIG.pageCount - 1;
            const zIndex = 50 - index;
            return (
              <MovingPage
                key={index}
                style={{ zIndex, backfaceVisibility: 'visible' }}
                variants={{
                  closed: { rotateY: 0 },
                  open: { rotateY: -178 + (index * CONFIG.fanAngle) } 
                }}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                transition={transitionConfig(index)}
              >
                {isLastPage && isOpen && data.side === 'left' && (
                   <div style={{width: '100%', height: '100%', className: 'flipped', transform: 'rotateY(180deg)'}}>
                       <AnswerContent />
                   </div>
                )}
                
                {(!isLastPage || data.side !== 'left') && (
                   <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)', pointerEvents: 'none'}} />
                )}
              </MovingPage>
            );
          })}

          <FrontCover
            variants={{ closed: { rotateY: 0 }, open: { rotateY: -180 } }}
            initial="closed" animate={isOpen ? "open" : "closed"}
            transition={transitionConfig(0, true)}
          >
             <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
               <div style={{fontSize: '4rem', color: '#cfa156', opacity: 0.8}}>❈</div>
               <h1 style={{
                 fontFamily: 'Noto Serif SC, serif', 
                 fontSize: '3.5rem', 
                 color: '#cfa156', 
                 letterSpacing: '10px', 
                 margin: '20px 0', 
                 textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                 writingMode: 'horizontal-tb' 
               }}>
                 答案之书
               </h1>
               <div style={{
                 fontSize: '1rem', 
                 color: '#cfa156', 
                 letterSpacing: '5px', 
                 opacity: 0.6,
                 borderTop: '1px solid rgba(207, 161, 86, 0.5)',
                 paddingTop: '10px',
                 marginTop: '10px'
               }}>
                 叩问 · 命运 · 启示
               </div>
             </div>
             <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '25px', background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)'}} />
          </FrontCover>
        </BookRoot>
      </Scene>

      <AnimatePresence mode="wait">
        {!isOpen && (
          <InstructionOverlay
            key="guide"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8, ease: "easeOut" }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2, delay: 0 } }}
          >
             <InstructionBox
               animate={{ 
                 y: [0, -3, 0],
                 boxShadow: [
                   "0 5px 20px rgba(0,0,0,0.4)",
                   "0 10px 30px rgba(212, 175, 55, 0.15)",
                   "0 5px 20px rgba(0,0,0,0.4)"
                 ]
               }} 
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             >
               <TapIcon 
                  animate={{ scale: [1, 0.8, 1], opacity: [0.7, 0.3, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               />
               <TextGroup>
                 <MainInstruction>心中默念疑问</MainInstruction>
                 <SubInstruction>点击封面 · 开启神谕</SubInstruction>
               </TextGroup>
             </InstructionBox>
          </InstructionOverlay>
        )}
      </AnimatePresence>
    </>
  );
}