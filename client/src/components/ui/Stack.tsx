// Stack.tsx — fixed: stable rotations, no infinite re-render loop, smooth autoplay
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import './Stack.css';

/* ─── CardRotate ──────────────────────────────────────────────────────────── */
interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
  disableDrag?: boolean;
}

function CardRotate({ children, onSendToBack, sensitivity, disableDrag = false }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_: unknown, info: { offset: { x: number; y: number } }) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  if (disableDrag) {
    return (
      <motion.div className="card-rotate-disabled" style={{ x: 0, y: 0 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card-rotate"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stack ───────────────────────────────────────────────────────────────── */
interface StackItem {
  id: number;
  content: React.ReactNode;
  rotation: number; // FIX: stable rotation computed once at init
}

interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  cards?: React.ReactNode[];
  animationConfig?: { stiffness: number; damping: number };
  sendToBackOnClick?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  mobileClickOnly?: boolean;
  mobileBreakpoint?: number;
}

export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cards = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  mobileClickOnly = false,
  mobileBreakpoint = 768,
}: StackProps) {
  const [isMobile, setIsMobile]   = useState(() => typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false);
  const [isPaused, setIsPaused]   = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mobileBreakpoint]);

  const shouldDisableDrag = mobileClickOnly && isMobile;
  const shouldEnableClick = sendToBackOnClick || shouldDisableDrag;

  // FIX: initialise stack ONCE with stable rotations; never reset on re-render
  const [stack, setStack] = useState<StackItem[]>(() =>
    cards.map((content, index) => ({
      id: index + 1,
      content,
      rotation: randomRotation ? Math.random() * 10 - 5 : 0,
    }))
  );

  // FIX: only sync content (not rotation, not structure) when cards array length changes
  const prevLengthRef = useRef(cards.length);
  useEffect(() => {
    if (cards.length !== prevLengthRef.current) {
      prevLengthRef.current = cards.length;
      setStack(cards.map((content, index) => ({
        id: index + 1,
        content,
        rotation: randomRotation ? Math.random() * 10 - 5 : 0,
      })));
    }
  }, [cards.length, randomRotation]);

  // FIX: update card content without resetting the stack order or rotations
  useEffect(() => {
    setStack(prev => prev.map(item => ({
      ...item,
      content: cards[item.id - 1] ?? item.content,
    })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const sendToBack = useCallback((id: number) => {
    setStack(prev => {
      const newStack = [...prev];
      const index = newStack.findIndex(card => card.id === id);
      if (index === -1) return prev;
      const [card] = newStack.splice(index, 1);
      newStack.unshift(card);
      return newStack;
    });
  }, []);

  // FIX: use a ref for the stack length so the interval doesn't re-create on every stack change
  const stackRef = useRef(stack);
  stackRef.current = stack;

  useEffect(() => {
    if (!autoplay || stackRef.current.length <= 1) return;

    const tick = () => {
      if (!isPaused) {
        const topCardId = stackRef.current[stackRef.current.length - 1].id;
        sendToBack(topCardId);
      }
    };

    const interval = setInterval(tick, autoplayDelay);
    return () => clearInterval(interval);
  // FIX: removed `stack` from deps — use ref instead so interval is stable
  }, [autoplay, autoplayDelay, isPaused, sendToBack]);

  return (
    <div
      className="stack-container"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => (
        <CardRotate
          key={card.id}
          onSendToBack={() => sendToBack(card.id)}
          sensitivity={sensitivity}
          disableDrag={shouldDisableDrag}
        >
          <motion.div
            className="card"
            onClick={() => shouldEnableClick && sendToBack(card.id)}
            animate={{
              // FIX: use stable pre-computed rotation; no Math.random() on render
              rotateZ: (stack.length - index - 1) * 4 + card.rotation,
              scale: 1 + index * 0.06 - stack.length * 0.06,
              transformOrigin: '90% 90%',
            }}
            initial={false}
            transition={{
              type: 'spring',
              stiffness: animationConfig.stiffness,
              damping: animationConfig.damping,
            }}
          >
            {card.content}
          </motion.div>
        </CardRotate>
      ))}
    </div>
  );
}
