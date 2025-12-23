import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coffee, Cpu, Zap, WifiOff, ArrowRight, Menu, X, Terminal, Instagram, Github, MapPin, XCircle, ChevronLeft, ChevronRight, Scan, LocateFixed } from 'lucide-react';
import { motion, useMotionValue, useSpring, useScroll, useTransform, AnimatePresence, animate } from 'framer-motion';

// --- 自定義圖標: 思緒超頻杯 (Coffee + Zap) ---
const OverclockCup = ({ size = 24, className }) => (
  <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
    <Coffee size={size} className="text-[#C89F65]" />
    <Zap size={size * 0.5} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#231714] fill-[#231714]" />
  </div>
);

// --- Data: 裝備庫 ---
const gearData = [
    {
        id: 'g1', type: 'FUTURES', title: 'G.SKILL Trident Z5 Royal', subtitle: '賽博銀條 / 皇家戟',
        desc: '這不只是記憶體，這是理財商品。價格波動堪比期貨，插在主機板上的不是矽晶圓，是尊爵不凡的台幣戰士證明。',
        img: 'https://www.gskill.com/img/pr/2025.01.16-gskill-announces-ddr5-6400-c30-large-capacity-specification/02-gskill-ddr5-trident-z5-royal-silver.jpg', 
        specs: ['DDR5-8000', '晶鑽導光條', '財富自由象徵']
    },
    {
        id: 'g2', type: 'ENTROPY', title: 'La Marzocco Linea Mini', subtitle: '義式神機 / 人生隱喻',
        desc: '人生就像拉花，就算你買了最頂的機器，有時候還是會拉出一坨鳥鳥的奶泡。接受它，這就是生活。',
        img: 'https://www.lamarzocco.com/tw/wp-content/uploads/2024/02/linea-mini-r-2-scaled.jpg', 
        specs: ['雙鍋爐 PID', '飽和沖煮頭', '鳥奶泡製造機']
    },
    {
        id: 'g3', type: 'DREAM', title: 'Fujifilm X100VI', subtitle: '時間切片機 / 理想型',
        desc: '我想紀錄每分每秒的流動，奈何現實骨感。目前手上只有 iPhone + Dazz 濾鏡，但賺錢的話我包衝這台。',
        img: 'https://www.fujifilm.com.tw/products-cameras-static/x100vi/assets/images/top/sageabe_device_img_01_01.jpg',
        specs: ['40MP X-Trans', '底片模擬', '還在存錢中']
    },
    {
        id: 'g4', type: 'GRIND', title: 'Comandante C40 MK4', subtitle: '德國司令官 / 手部重訓',
        desc: '在一切都自動化的時代，我選擇手動磨豆。感受豆子被粉碎的觸覺回饋，這是屬於工程師的類比浪漫。',
        img: 'https://goodmanroaster.tw/cdn/shop/files/B133B341-7E8B-4936-B671-319AB35FAED7_1024x1024.jpg?v=1740662141',
        specs: ['高氮不鏽鋼刀盤', 'Click 刻度', '純物理運算']
    }
];

// --- Components ---

const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };
  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });
  return (
    <motion.button
      ref={ref} className={className}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.button>
  );
};

// 2. 焦點輪播 (V3.0 Logic: Infinite Virtual Loop Engine)
const GearCarousel = () => {
    // 使用虛擬索引，可以無限增加或減少
    const [index, setIndex] = useState(1000); // 從一個大數字開始，確保左邊有東西
    const [isDragging, setIsDragging] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const containerRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 核心參數定義
    const isMobile = windowWidth < 768;
    const cardWidth = isMobile ? windowWidth * 0.70 : 500;
    const gap = isMobile ? 24 : 80;
    const step = cardWidth + gap;

    // 自動播放
    useEffect(() => {
        if (isDragging || selectedId) return;
        const timer = setInterval(() => {
            setIndex((prev) => prev + 1);
        }, 4000);
        return () => clearInterval(timer);
    }, [isDragging, selectedId]);

    // 拖曳處理
    const onDragEnd = (e, { offset, velocity }) => {
        setIsDragging(false);
        const swipe = Math.abs(offset.x) * velocity.x;
        if (swipe < -8000 || offset.x < -80) {
            setIndex((prev) => prev + 1);
        } else if (swipe > 8000 || offset.x > 80) {
            setIndex((prev) => prev - 1);
        }
    };

    // 虛擬渲染計算：只渲染當前索引附近的 5 張卡片
    const visibleRange = [-2, -1, 0, 1, 2]; 

    return (
        <div className="relative py-24 overflow-hidden w-full max-w-[100vw]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 px-6 md:px-16 max-w-[1600px] mx-auto gap-4">
                <div>
                    <h3 className="text-xl md:text-3xl font-bold text-[#C89F65] font-mono uppercase tracking-widest">/// GEAR.LOAD()</h3>
                    <div className="text-[10px] md:text-xs font-mono text-[#9C8E85] mt-2 animate-pulse">FOCUS MODE // INFINITE LOOP</div>
                </div>
                <div className="flex gap-4 self-end md:self-auto z-10">
                    <button onClick={() => setIndex((prev) => prev - 1)} className="p-3 border border-[#C89F65]/30 bg-[#1A110F] rounded-full hover:border-[#C89F65] active:scale-95 transition-all"><ChevronLeft className="text-[#C89F65]" size={20}/></button>
                    <button onClick={() => setIndex((prev) => prev + 1)} className="p-3 border border-[#C89F65]/30 bg-[#1A110F] rounded-full hover:border-[#C89F65] active:scale-95 transition-all"><ChevronRight className="text-[#C89F65]" size={20}/></button>
                </div>
            </div>

            {/* 輪播軌道 */}
            <div className="h-[550px] w-full flex items-center justify-center relative perspective-1000">
                <motion.div 
                    className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={onDragEnd}
                >
                    {/* 渲染虛擬卡片 */}
                    {visibleRange.map((offset) => {
                        const i = index + offset;
                        // 取餘數計算真實數據索引 (處理負數情況)
                        const dataIndex = ((i % gearData.length) + gearData.length) % gearData.length;
                        const item = gearData[dataIndex];
                        const isActive = offset === 0;

                        return (
                            <motion.div 
                                key={i} // 使用虛擬索引作為 key
                                layoutId={`card-${i}`}
                                onClick={() => isActive ? setSelectedId(item.id) : setIndex(i)}
                                className={`absolute bg-[#1A110F] overflow-hidden border transition-shadow duration-500
                                    ${isActive ? 'border-[#C89F65] shadow-[0_0_60px_rgba(200,159,101,0.3)] z-20' : 'border-[#3E2C26] z-10'}
                                `}
                                initial={false}
                                animate={{ 
                                    x: offset * step, // 0 = 正中間
                                    scale: isActive ? 1.1 : 0.85,
                                    opacity: isActive ? 1 : 0.3, 
                                    filter: isActive ? 'blur(0px) grayscale(0%)' : 'blur(4px) grayscale(100%)',
                                    zIndex: isActive ? 20 : 10 - Math.abs(offset)
                                }}
                                transition={{ type: "spring", stiffness: 250, damping: 30 }}
                                style={{
                                    width: isMobile ? '70vw' : '500px',
                                    height: '450px',
                                    borderRadius: '4px',
                                    left: '50%',
                                    marginLeft: isMobile ? '-35vw' : '-250px' 
                                }}
                            >
                                <div className="h-3/5 overflow-hidden relative">
                                    <motion.img src={item.img} className="w-full h-full object-cover" />
                                    <div className={`absolute top-4 right-4 bg-[#C89F65] text-[#231714] p-2 rounded-full transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}><Scan size={18} /></div>
                                    {!isActive && <div className="absolute inset-0 bg-[#1A110F]/60 transition-colors" />}
                                </div>
                                <div className="p-6 h-2/5 flex flex-col justify-between relative">
                                    <div>
                                        <span className="text-xs font-mono text-[#C89F65] mb-2 block">{item.type} // UNIT</span>
                                        <h4 className="text-2xl font-bold text-[#E6DCC8] line-clamp-1">{item.title}</h4>
                                        <p className="text-xs text-[#9C8E85] font-mono mt-2">{item.subtitle}</p>
                                    </div>
                                    <motion.div 
                                        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }} 
                                        className="text-[#C89F65] text-xs font-mono flex items-center gap-2 mt-4"
                                    >
                                        VIEW SPECS <ArrowRight size={12}/>
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* 進度條 */}
            <div className="flex justify-center gap-3 mt-4">
                {gearData.map((_, i) => {
                    const currentIndex = ((index % gearData.length) + gearData.length) % gearData.length;
                    return (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-12 bg-[#C89F65]' : 'w-2 bg-[#3E2C26]'}`} 
                        />
                    )
                })}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" onClick={() => setSelectedId(null)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#231714]/95 backdrop-blur-md" />
                        {gearData.filter(item => item.id === selectedId).map(item => (
                            <motion.div key="modal" initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-5xl bg-[#1A110F] border border-[#C89F65] flex flex-col md:grid md:grid-cols-2 shadow-2xl overflow-hidden rounded-sm max-h-[90vh] md:max-h-none overflow-y-auto">
                                <button onClick={() => setSelectedId(null)} className="absolute top-4 right-4 z-20 text-[#E6DCC8] bg-black/50 rounded-full p-2 hover:rotate-90 transition-transform"><XCircle size={28}/></button>
                                <div className="h-[300px] md:h-full relative overflow-hidden"><motion.img src={item.img} className="w-full h-full object-cover" /></div>
                                <div className="p-6 md:p-16 flex flex-col justify-center">
                                    <h4 className="text-3xl md:text-5xl font-black text-[#E6DCC8] mb-4">{item.title}</h4>
                                    <p className="text-[#E6DCC8] text-sm md:text-lg leading-relaxed mb-8 border-l-2 border-[#C89F65] pl-6">{item.desc}</p>
                                    <ul className="space-y-2 font-mono text-sm text-[#9C8E85]">{item.specs.map((s,i)=><li key={i}>// {s}</li>)}</ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 3. 戰術地圖
const TacticalMap = () => (
    <div className="w-full h-full relative bg-[#1A110F] overflow-hidden group border border-[#3E2C26]">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(#3E2C26 1px, transparent 1px), linear-gradient(90deg, #3E2C26 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <svg className="absolute inset-0 w-full h-full opacity-30 stroke-[#C89F65]" style={{strokeWidth: 2, fill: 'none'}}>
            <path d="M-10,100 Q150,120 400,80 T800,150" />
            <path d="M200,-10 L180,400" />
            <path d="M500,-10 L520,400" />
            <path d="M0,300 L800,280" />
            <circle cx="350" cy="180" r="150" strokeDasharray="4 4" className="animate-[spin_20s_linear_infinite]" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"><div className="w-4 h-4 bg-[#C89F65] rounded-full animate-ping absolute"/> <div className="w-4 h-4 bg-[#C89F65] rounded-full relative z-10"/> <div className="h-12 w-px bg-[#C89F65] mt-1"/> <div className="bg-[#C89F65] text-[#1A110F] text-xs font-bold px-2 py-1 mt-1 font-mono">TARGET</div></div>
        <div className="absolute top-4 left-4 border border-[#C89F65] px-2 py-1"><p className="text-[10px] text-[#C89F65] font-mono tracking-widest">SAT_VIEW_LIVE</p></div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[#C89F65] font-mono text-[10px]"><LocateFixed size={16} className="animate-spin-slow"/> GPS: 24.08N / 120.54E</div>
    </div>
);

// 4. 首頁 (Banner - New Copy)
const HomeView = ({ setPage }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 1.15]);
  const bgRadius = useTransform(scrollYProgress, [0, 0.5], ["40px", "0px"]);
  const bgShadow = useTransform(scrollYProgress, [0, 0.5], ["0 25px 50px -12px rgba(0,0,0,0.5)", "none"]);
  const bgOverlayOpacity = useTransform(scrollYProgress, [0.4, 1], [0.3, 0.7]);

  const textXLeft = useTransform(scrollYProgress, [0, 0.4], ["0%", "-150%"]);
  const textXRight = useTransform(scrollYProgress, [0, 0.4], ["0%", "150%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  const features = [
    { title: "單一產區", engTitle: "KERNEL SOURCE", icon: Coffee, text: "像追蹤原始碼一樣，回溯風味的源頭。", detail: "拒絕風味模糊的商業拼配。我只挑選衣索比亞 Yirgacheffe 的日曬處理豆，或是哥倫比亞 Huila 的高海拔產區。前者帶著瘋狂的水果酸香，後者則是厚實的黑巧克力尾韻。這就是我的 Source Code，乾淨、強大、層次分明。" },
    { title: "精密萃取", engTitle: "PRECISION BUILD", icon: Zap, text: "PID 溫控 92°C：容不下 1bit 誤差的編譯過程。", detail: "萃取咖啡就像 Build 專案，水溫只要差 1 度，苦澀就會像 Bug 一樣湧現。我將變壓曲線鎖定在 9bar 的恆定壓力，用毫秒級的精度監控每一滴濃縮。你可以不理解我的偏執，但你不能不承認這杯咖啡的完美。" },
    { title: "沉浸空間", engTitle: "IMMERSIVE UX", icon: Terminal, text: "降噪聲學與 75cm 打字高度：為高效能腦核設計。", detail: "這裡沒有干擾。我計算過吧台與桌面的黃金比例，那是長時間敲擊鍵盤最舒服的角度。配上這間古厝特有的吸音結構，這裡只有 Jazz 的低鳴與磨豆機的類比噪音。在這裡，使用者經驗（UX）不是設計圖，是觸覺。" },
    { title: "數位排毒", engTitle: "SYSTEM RESET", icon: WifiOff, text: "暫時終止所有背景程序，執行清理磁區。", detail: "網路世界太吵了。來這裡請放下你的 iPhone。在一杯手沖咖啡慢慢流淌的 3 分鐘裡，關閉通訊軟體的 API，讓大腦重新冷卻、重組數據。偶爾的離線（Offline），是為了下一次更強大的連線。" }
  ];

  return (
    <div className="w-full bg-[#231714]">
      {/* 背景層 */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 flex items-center justify-center p-4 md:p-8 pointer-events-none">
          <motion.div style={{ scale: bgScale, borderRadius: bgRadius, boxShadow: bgShadow }} className="w-full h-full relative overflow-hidden will-change-transform">
              <img src="https://img.shoplineapp.com/media/image_clips/67e9fae23a0b83c63aef68d1/original.jpg?1743387362" alt="Espresso Shot" className="w-full h-full object-cover grayscale-[20%] sepia-[10%]" />
              <motion.div style={{ opacity: bgOverlayOpacity }} className="absolute inset-0 bg-[#231714] mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#231714] via-transparent to-[#231714]/50" />
          </motion.div>
      </div>

      {/* 內容層 */}
      <div className="relative z-10">
          <section ref={ref} className="h-[300vh]">
              <div className="sticky top-0 h-screen flex flex-col justify-center items-center px-6 pointer-events-none">
                  <motion.div style={{ opacity: textOpacity }} className="text-center">
                      <div className="flex items-center justify-center gap-4 mb-6 opacity-80">
                          <div className="h-px w-12 bg-[#C89F65]" />
                          <span className="text-[#C89F65] text-xs font-mono tracking-widest">SYSTEM READY</span>
                          <div className="h-px w-12 bg-[#C89F65]" />
                      </div>
                      <h1 className="text-[12vw] lg:text-[10rem] font-black leading-none tracking-tighter text-[#E6DCC8] mb-8 drop-shadow-xl flex justify-center gap-4" style={{ fontFamily: 'Impact, sans-serif' }}>
                          <motion.span style={{ x: textXLeft }} className="inline-block">思緒</motion.span>
                          <motion.span style={{ x: textXRight }} className="inline-block text-[#C89F65]">超頻</motion.span>
                      </h1>
                  </motion.div>
                  
                  <motion.div style={{ opacity: contentOpacity }} className="text-center flex flex-col items-center pointer-events-auto">
                      <p className="text-lg lg:text-2xl font-serif italic max-w-xl text-[#E6DCC8] leading-relaxed mb-12 drop-shadow-md">
                          「呼吸，是探出水面求生的溫柔。」
                      </p>
                      <MagneticButton onClick={() => setPage('story')} className="group relative px-8 py-4 bg-[#C89F65] text-[#231714] text-sm font-bold uppercase tracking-widest overflow-hidden hover:bg-[#E6DCC8] transition-colors shadow-lg shadow-[#C89F65]/20">
                          <span className="relative z-10 flex items-center gap-3">
                              讀取日誌 <ArrowRight size={16} />
                        </span>
                      </MagneticButton>
                  </motion.div>
              </div>
          </section>

          <div className="bg-[#C89F65] text-[#231714] py-4 overflow-hidden border-y border-[#231714] relative z-20">
            <motion.div className="whitespace-nowrap flex gap-8" animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, ease: "linear", duration: 20 }}>
                {Array(10).fill("HAND DRIP · ESPRESSO · SYSTEM REBOOT · CAFFEINE INJECTION · FOCUS MODE ON · ").map((text, i) => (<span key={i} className="text-lg font-bold font-mono tracking-wider">{text}</span>))}
            </motion.div>
          </div>

          <section className="py-24 lg:py-48 px-6 lg:px-16 max-w-[1600px] mx-auto bg-[#231714] relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                <div className="lg:col-span-4">
                    <h2 className="text-5xl lg:text-6xl font-black mb-8 text-[#C89F65]" style={{ fontFamily: 'Impact, sans-serif' }}>規格<br/>SPEC</h2>
                    <p className="text-[#E6DCC8]/70 font-serif text-lg leading-relaxed mb-12">就像編寫一段優雅的程式碼，一杯完美的咖啡容不下任何冗餘。從選豆到萃取，我們將工程師的偏執帶入吧台。</p>
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 gap-0 border-t border-[#3E2C26]">
                    {features.map((item, idx) => (
                        <motion.div key={idx} initial="initial" whileHover="hover" className="group relative border-b border-[#3E2C26] py-12 cursor-pointer overflow-hidden">
                            <motion.div variants={{ initial: { scaleY: 0 }, hover: { scaleY: 1 } }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-[#3E2C26]/30 origin-top -z-10" />
                            <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12 relative z-10 px-4">
                                <span className="font-mono text-[#C89F65] text-sm">0{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-2xl lg:text-3xl font-bold text-[#E6DCC8] group-hover:text-[#C89F65] transition-colors flex items-center gap-4">{item.title} <item.icon className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-[#C89F65]" /></h3>
                                        <span className="hidden md:block font-mono text-xs text-[#5C4538] uppercase tracking-widest">{item.engTitle}</span>
                                    </div>
                                    <p className="text-lg text-[#9C8E85] font-light mb-2">{item.text}</p>
                                    <motion.div variants={{ initial: { height: 0, opacity: 0 }, hover: { height: 'auto', opacity: 1 } }} className="overflow-hidden"><p className="text-sm font-mono text-[#C89F65] pt-2 border-t border-[#3E2C26] mt-4">{'>'} {item.detail}</p></motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
          </section>
      </div>
    </div>
  );
};

// 5. 故事頁面
const StoryView = () => (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="pt-32 pb-24 px-6 lg:px-16 max-w-[1200px] mx-auto min-h-screen relative z-10 bg-[#231714]">
        <div className="mb-24">
            <h1 className="text-[12vw] lg:text-[8rem] font-black leading-none text-[#C89F65] mb-8" style={{ fontFamily: 'Impact, sans-serif' }}>MINIMAL<br/><span className="text-transparent" style={{ WebkitTextStroke: '2px #E6DCC8' }}>MAXIMAL</span></h1>
            <p className="text-xl lg:text-2xl font-serif text-[#E6DCC8] max-w-2xl leading-relaxed border-l-4 border-[#C89F65] pl-8">「Code 越簡潔越好，用 Minify 但不能犧牲美觀。人生也是，我們都是時間長河裡的過客，咖啡也是。」</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            <div className="space-y-8">
                <h3 className="text-2xl lg:text-3xl font-bold text-[#C89F65] flex items-center gap-3"><Terminal size={28} /> VIBE: JAZZ & FOAM</h3>
                <p className="text-[#9C8E85] text-lg leading-relaxed">我看著手沖咖啡慢慢流淌，就像時間的具象化。在這裡，香氣是我的芳香療法。在厭倦的下午，一杯口感綿密的奶泡配上 Jazz，絕對是靈魂的救贖。</p>
                <div className="bg-[#3E2C26]/30 p-8 border-l-2 border-[#C89F65] mt-12"><h4 className="font-mono text-[#C89F65] mb-4 uppercase tracking-widest">ABOUT GARY // 主理人參數</h4><p className="text-[#E6DCC8] leading-relaxed mb-4">拒絕封裝好的平庸。我偏愛衣索比亞 Yirgacheffe 的明亮酸質，或是哥倫比亞 Huila 的厚實苦韻。生活如果不帶點痛感，那跟喝三合一有什麼區別？這就是我的 Source Code，未經修飾，真實而強烈。</p></div>
            </div>
            <div className="bg-[#1A110F] p-8 border border-[#3E2C26]"><h3 className="text-xl font-mono text-[#C89F65] mb-6 uppercase tracking-widest border-b border-[#3E2C26] pb-4">Life Config // 生活配置</h3><div className="space-y-6">{[{ label: "Phone", val: "iPhone + Dazz Cam" }, { label: "Dream Gear", val: "Fujifilm X100VI" }, { label: "Coffee Style", val: "Hand Drip / Latte" }, { label: "Music", val: "Jazz / Lofi HipHop" }].map((item, i) => (<div key={i} className="grid grid-cols-12 gap-4 items-center text-sm"><div className="col-span-4 font-mono text-[#5C4538] uppercase">{item.label}</div><div className="col-span-1 text-center text-[#C89F65]">::</div><div className="col-span-7 text-[#E6DCC8] font-bold">{item.val}</div></div>))}</div></div>
        </div>
        <div className="border-t border-[#3E2C26] pt-16 mb-16"><GearCarousel /></div>
    </motion.div>
);

// 6. 地點頁面 (使用老宅圖 + 404/Loading 邏輯)
const LocationView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32 pb-24 px-6 lg:px-16 max-w-[1600px] mx-auto min-h-screen flex flex-col relative z-10 bg-[#231714]">
         <div className="mb-12 text-center"><h1 className="text-6xl lg:text-8xl font-black leading-none text-[#C89F65] mb-4" style={{ fontFamily: 'Impact, sans-serif' }}>COORDINATES</h1><p className="font-mono text-[#C89F65] tracking-[0.3em] uppercase">/// STABLE FLY MODE</p></div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8 order-2 lg:order-1"><div className="bg-[#1A110F] p-8 border border-[#C89F65] relative overflow-hidden h-full flex flex-col justify-center"><div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(200,159,101,0.1)_50%)] bg-[length:100%_4px]"></div><h3 className="text-2xl font-bold text-[#E6DCC8] mb-8 flex items-center gap-3"><MapPin className="text-[#C89F65]" /> 基地資訊</h3><div className="space-y-8 font-mono text-sm"><div><span className="text-[#5C4538] block mb-2 uppercase">Target // 目標</span><p className="text-[#E6DCC8] text-xl font-bold">Stable Fly 穩定飛行模式</p></div><div><span className="text-[#5C4538] block mb-2 uppercase">Address // 座標</span><p className="text-[#E6DCC8] text-lg">彰化市永樂街44巷2號</p></div><div><span className="text-[#5C4538] block mb-2 uppercase">Vibe // 氛圍</span><p className="text-[#E6DCC8]">老宅 / 復古 / 古厝</p></div></div></div></div>
            <div className="lg:col-span-2 relative order-1 lg:order-2 flex flex-col md:flex-row gap-4 h-[400px] md:h-auto"><div className="flex-[2] relative border border-[#C89F65] overflow-hidden group"><img src="https://tenjo.tw/wp-content/uploads/2025/01/DSC_7533.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter sepia-[.3] contrast-[1.1]" alt="Old House Cafe" /><div className="absolute inset-0 border-[1px] border-[#C89F65]/30 m-4 pointer-events-none" /><div className="absolute top-8 left-8 bg-[#231714]/80 text-[#C89F65] px-3 py-1 font-mono text-xs backdrop-blur-sm">CAM_01: LIVE</div><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#1A110F_120%)] opacity-50" /></div><div className="flex-1 relative min-h-[200px] md:min-h-0"><TacticalMap /></div></div>
        </div>
    </motion.div>
);

// 404 Component
const NotFoundView = () => (
    <div className="h-screen flex flex-col items-center justify-center bg-[#231714] text-[#E6DCC8]">
        <h1 className="text-[10rem] font-black text-[#C89F65] leading-none">404</h1>
        <p className="text-xl font-serif italic mt-4">「暫時歇業。迷路不是方向錯了，而是靈魂需要時差。」</p>
        <p className="text-xs font-mono text-[#5C4538] mt-8">SYSTEM_HALT // SOUL_LAG</p>
    </div>
)

// 7. 主程式 (App)
export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState('home'); 
  const cursorX = useMotionValue(-100); const cursorY = useMotionValue(-100);
  const cursorXSpring = useSpring(cursorX, { damping: 25, stiffness: 700 }); const cursorYSpring = useSpring(cursorY, { damping: 25, stiffness: 700 });

  useEffect(() => {
    let interval = setInterval(() => { setLoadProgress(prev => { if (prev >= 100) { clearInterval(interval); setTimeout(() => setLoading(false), 800); return 100; } return prev + Math.random() * 15; }); }, 100);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => { const moveCursor = (e) => { cursorX.set(e.clientX - 20); cursorY.set(e.clientY - 20); }; window.addEventListener('mousemove', moveCursor); return () => window.removeEventListener('mousemove', moveCursor); }, [cursorX, cursorY]);

  if (loading) { return (<div className="fixed inset-0 bg-[#231714] flex flex-col items-center justify-center z-50"><div className="text-center relative"><h1 className="text-[12rem] font-black text-[#C89F65] opacity-20 leading-none select-none" style={{ fontFamily: 'Impact, sans-serif' }}>{Math.floor(loadProgress)}%</h1><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 text-center"><span className="text-[#E6DCC8] font-mono text-sm tracking-widest uppercase block mb-2 animate-pulse">SYSTEM BREATHING...</span><div className="w-full h-1 bg-[#3E2C26] overflow-hidden"><motion.div className="h-full bg-[#C89F65]" style={{ width: `${loadProgress}%` }} /></div></div></div></div>); }

  return (
    <div className="min-h-screen relative bg-[#231714] text-[#E6DCC8] overflow-x-hidden selection:bg-[#C89F65] selection:text-[#231714] flex flex-col font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[60] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />
      <div className="fixed inset-0 pointer-events-none z-[55] bg-[radial-gradient(circle_at_center,transparent_50%,rgba(35,23,20,0.4)_100%)]" />
      <motion.div className="fixed w-8 h-8 border border-[#C89F65] rounded-full pointer-events-none z-[70] hidden lg:block mix-blend-difference" style={{ left: cursorXSpring, top: cursorYSpring }} />

      <nav className="fixed top-0 left-0 right-0 z-[80] px-6 py-6 lg:px-12 flex justify-between items-center mix-blend-difference text-[#E6DCC8]">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setPage('home')}><OverclockCup size={24} /><span className="font-bold tracking-[0.2em] uppercase text-sm">思緒超頻 | Gary's Lab</span></div>
        <div className="hidden md:flex gap-8 text-xs font-mono tracking-widest opacity-80"><button onClick={() => setPage('home')} className={`hover:text-[#C89F65] transition-colors ${page === 'home' ? 'text-[#C89F65]' : ''}`}>[ HOME ]</button><button onClick={() => setPage('story')} className={`hover:text-[#C89F65] transition-colors ${page === 'story' ? 'text-[#C89F65]' : ''}`}>[ STORY ]</button><button onClick={() => setPage('location')} className={`hover:text-[#C89F65] transition-colors ${page === 'location' ? 'text-[#C89F65]' : ''}`}>[ LOCATION ]</button></div>
        <button onClick={() => setMenuOpen(true)} className="md:hidden z-50"><Menu /></button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#231714]/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center"><button onClick={() => setMenuOpen(false)} className="absolute top-8 right-8 text-[#E6DCC8]"><X size={32} /></button><button onClick={() => { setPage('home'); setMenuOpen(false); }} className="text-5xl font-black mb-8 hover:text-[#C89F65] transition-colors uppercase font-serif">HOME</button><button onClick={() => { setPage('story'); setMenuOpen(false); }} className="text-5xl font-black mb-8 hover:text-[#C89F65] transition-colors uppercase font-serif">STORY</button><button onClick={() => { setPage('location'); setMenuOpen(false); }} className="text-5xl font-black mb-8 hover:text-[#C89F65] transition-colors uppercase font-serif">LOCATION</button></motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {page === 'home' && <HomeView key="home" setPage={setPage} />}
        {page === 'story' && <StoryView key="story" />}
        {page === 'location' && <LocationView key="location" />}
        {page === '404' && <NotFoundView key="404" />}
      </AnimatePresence>
      
      <footer className="py-16 text-center border-t border-[#3E2C26] mt-auto bg-[#1A110F] relative z-20"><p className="font-mono text-[#5C4538] text-xs mb-8 tracking-widest">DESIGNED BY ENGINEER. BREWED BY HEART.</p><div className="flex justify-center gap-8 mb-8"><a href="https://instagram.com/gary_kakoi" target="_blank" rel="noreferrer" className="text-[#9C8E85] hover:text-[#C89F65] transition-colors flex flex-col items-center gap-2 group"><div className="p-3 border border-[#3E2C26] rounded-full group-hover:border-[#C89F65] transition-colors hover:bg-[#C89F65]/10"><Instagram size={20} /></div><span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">IG</span></a><a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#9C8E85] hover:text-[#C89F65] transition-colors flex flex-col items-center gap-2 group"><div className="p-3 border border-[#3E2C26] rounded-full group-hover:border-[#C89F65] transition-colors hover:bg-[#C89F65]/10"><Github size={20} /></div><span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">GIT</span></a></div><p className="text-[#C89F65] font-serif italic text-lg opacity-80 mb-2">"My life, I define."</p><p className="text-[#5C4538] text-xs font-mono">@gary_kakoi</p></footer>
    </div>
  );
}