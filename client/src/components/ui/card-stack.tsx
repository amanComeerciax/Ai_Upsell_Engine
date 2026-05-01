import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    content: React.ReactNode;
    image?: string;
  }[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState(items);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[500px] w-full md:h-[650px] max-w-6xl mx-auto flex items-center justify-center">
      <AnimatePresence>
        {cards.map((card, index) => {
          return (
            <motion.div
              key={card.id}
              className="absolute bg-white dark:bg-black w-full h-full rounded-[48px] shadow-2xl border border-black/10 dark:border-white/10 flex flex-col md:flex-row overflow-hidden"
              style={{
                transformOrigin: "top center",
                zIndex: cards.length - index,
              }}
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR,
              }}
              exit={{
                opacity: 0,
                y: -150,
                scale: 0.9,
                transition: { duration: 0.5, ease: "easeInOut" },
              }}
            >
              {/* Left Content Area */}
              <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-between relative z-10 bg-white dark:bg-black">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{card.designation}</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tighter leading-none">
                    {card.name}
                  </h3>
                  <div className="text-lg md:text-xl text-black/60 dark:text-white/60 font-medium leading-relaxed max-w-sm">
                    {card.content}
                  </div>
                </div>
                
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
                  <span className="text-xs font-bold text-black/30 dark:text-white/30 uppercase tracking-[0.3em]">Engine v4.0</span>
                </div>
              </div>

              {/* Right Image Area */}
              <div className="w-full md:w-1/2 h-64 md:h-full relative bg-[#0a0a0b]">
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-transparent to-transparent z-10" />
                {card.image && (
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className="w-full h-full object-cover opacity-100"
                  />
                )}
                {/* Decorative Elements */}
                <div className="absolute bottom-10 right-10 z-20 flex gap-2">
                   <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                   <div className="h-2 w-2 rounded-full bg-blue-500/40" />
                   <div className="h-2 w-2 rounded-full bg-blue-500/20" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
