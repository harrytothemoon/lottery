import React, { useCallback, useRef, useEffect } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

const CelebrationEffect = React.memo(({ show }) => {
  const refAnimationInstance = useRef(null);
  const intervalId = useRef(null);

  const getInstance = ({ confetti }) => {
    refAnimationInstance.current = confetti;
  };

  const makeShot = useCallback((opts) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        particleCount: 15,
        spread: 360,
        startVelocity: 100,
        gravity: 0,
        ticks: 500,
        decay:0.99,
        colors: ["#FFD700", "#FFA500", "#DAA520", "#F0E68C"],
        shapes: ["circle"],
        scalar: 3,
        shapeOptions: {
          blur: 0.4,
          stroke: true,
          strokeWidth: 2,
        },
        ...opts,
      });
  }, []);

  const startAnimation = useCallback(() => {
    if (intervalId.current) return;

    // 設置連續爆炸的間隔
    intervalId.current = setInterval(() => {
      // 隨機位置爆炸
      makeShot();
    }, 120);
  }, [makeShot]);

  const stopAnimation = useCallback(() => {
    refAnimationInstance.current && refAnimationInstance.current.reset()
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }, []);

  useEffect(() => {
    if (show) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [show, startAnimation, stopAnimation]);

  return (
    <ReactCanvasConfetti
      onInit={getInstance}
      style={{
        position: "fixed",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    />
  );
});

export default CelebrationEffect;
