// components/ChristmasEffects.jsx
import React, { useEffect } from "react";
import useSound from "use-sound";
import game from "../sounds/game-music.mp3";

const Snowfall = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-snowfall"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }}
        >
          ❄️
        </div>
      ))}
    </div>
  );
};

const ChristmasEffects = ({ isEnabled }) => {
  const [playJingle, { stop }] = useSound(game, {
    volume: 0.25,
    loop: true,
  });

  useEffect(() => {
    if (isEnabled) {
      playJingle();
    }
    return () => stop();
  }, [isEnabled, playJingle, stop]);

  if (!isEnabled) return null;

  return <Snowfall />;
};

export default ChristmasEffects;
