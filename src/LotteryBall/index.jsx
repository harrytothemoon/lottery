import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useReducer,
} from "react";
import { Card, CardContent } from "../components/ui/card";

import { Button } from "../components/ui/button";
import { Trophy, Users } from "lucide-react";
import { AlertDialog, AlertDialogContent } from "../components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import CelebrationEffect from "./CelebratationEffect";
import SettingsModal from "./SettingsModal";
import ParticipantsList from "./ParticipantsList";

const WINNER_EFFECT_COUNT = 4;
const BALL_COUNTS = 47;
const DRAW_DURATION_SECONDS = 2;

const LOTTO_NUMBERS = Array.from({ length: BALL_COUNTS }, (_, i) => i + 1);

const WINNING_CATEGORIES = [6, 5, 4];
const DEFAULT_PRIZES = {
  6: "₱1,000,000",
  5: "₱3,888",
  4: "₱88",
};
const PRIZE_LABELS = {
  6: {
    label: "Jackpot",
    icon: "👑",
    className: "text-4xl font-bold text-yellow-300",
  },
  5: {
    label: "First Prize",
    icon: "🏆",
    className: "text-3xl font-bold text-yellow-300",
  },
  4: {
    label: "Second Prize",
    icon: "🥈",
    className: "text-2xl font-bold text-yellow-300",
  },
};

const WinnersList = React.memo(({ winners, matchCount, onClose }) => {
  const WINNER_ROW_HEIGHT = 100;
  const filteredWinners = React.useMemo(
    () => winners.filter((w) => w.matchCount === matchCount),
    [winners, matchCount]
  );

  const WinnerRow = React.memo(({ index, style }) => {
    const winner = filteredWinners[index];

    return (
      <motion.div
        style={style}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.1, delay: 0.1 }}
      >
        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-400/30 mx-4">
          <div className="text-5xl font-bold text-yellow-300 text-center">
            {maskUsername(winner.username)}
          </div>
          <div className="text-yellow-400/80 text-center">
            Numbers: {winner.numbers.join(", ")}
          </div>
        </div>
      </motion.div>
    );
  });

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent
        className="bg-black/90 border-2 border-yellow-400 max-w-2xl max-h-[80vh] overflow-hidden fixed"
        handleBackgroundClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-4xl font-bold text-yellow-300 mb-2"
            >
              {PRIZE_LABELS[matchCount].icon} {PRIZE_LABELS[matchCount].label}{" "}
              Winners!
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-3xl text-yellow-400"
            >
              Prize: {DEFAULT_PRIZES[matchCount]}
            </motion.div>
          </div>

          <div style={{ height: "50vh" }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={filteredWinners.length}
                  itemSize={WINNER_ROW_HEIGHT}
                  width={width}
                  overscanCount={2}
                >
                  {WinnerRow}
                </List>
              )}
            </AutoSizer>
          </div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
});

const maskUsername = (username) => {
  if (!username || username.length <= 3) return username;
  return `${username.slice(0, 2)}${"*".repeat(
    username.length - 3
  )}${username.slice(-1)}`;
};

const CompanyLogos = React.memo(() => (
  <div className="flex justify-center items-center gap-8 mb-6 w-full px-8">
    <img
      src={`${process.env.PUBLIC_URL}/integrate/lawinLogo.png`}
      alt="Lawin"
      width="30%"
      className="h-24 object-contain"
    />
    <img
      src={`${process.env.PUBLIC_URL}/integrate/hawkplayLogo.png`}
      alt="hawkplay"
      width="40%"
      style={{ transform: "scale(1.2)" }}
      className="h-24 object-contain"
    />
    <img
      src={`${process.env.PUBLIC_URL}/integrate/LODILogo.png`}
      alt="Lodibet"
      width="30%"
      className="h-24 object-contain"
    />
  </div>
));


const BackgroundLogos = React.memo(({ logos }) => {
  // 判斷媒體類型
  const getMediaType = (src) => {
    const extension = src.split(".").pop().toLowerCase();
    if (["webp"].includes(extension)) return "animation";
    return "image";
  };

  // 媒體渲染組件
  const MediaItem = React.memo(({ src }) => {
    const mediaType = getMediaType(src);

    if (mediaType === "animation") {
      return (
        <img
          src={`${process.env.PUBLIC_URL}/${src}`}
          width="75%"
          alt="animated background"
          className="object-contain transform-gpu will-change-transform"
          loading="lazy"
          decoding="async"
        />
      );
    }

    return (
      <img
        src={`${process.env.PUBLIC_URL}/${src}`}
        width="75%"
        alt="background"
        className="object-contain"
        loading="lazy"
        decoding="async"
      />
    );
  });

  return (
    <div className="flex flex-col items-center gap-12 mt-12 w-full">
      {logos.map((src, index) => (
        <div key={index} className="w-full flex justify-center">
          <MediaItem src={src} />
        </div>
      ))}
    </div>
  );
});

const Ball = React.memo(({ number, shouldReveal }) => {
  return (
    <div className="relative">
      <div
        className={`
          w-24 h-24 rounded-full
          flex items-center justify-center
          text-4xl font-bold
          bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500
          text-white
          shadow-lg
          transform transition-all duration-200
          border-4 border-yellow-300
        `}
      >
        {shouldReveal ? String(number).padStart(2, "0") : "00"}
      </div>
    </div>
  );
});

const LotteryMachine = React.memo(
  React.forwardRef(({ onComplete }, ref) => {
    const [state, setState] = useState({
      isSpinning: false,
      numbers: Array(6).fill(null),
      currentIndex: 0,
      isDrawing: false,
    });
    const [showAnimation, setShowAnimation] = useState(false);
    const [nextNumber, setNextNumber] = useState(null);
    const [showFinalBall, setShowFinalBall] = useState(false);
    const [isBallRevealed, setIsBallRevealed] = useState(false);

    const handleAnimationComplete = useCallback(
      (number) => {
        setShowAnimation(false);
        setShowFinalBall(false);
        setIsBallRevealed(false);
        setState((prev) => {
          const newNumbers = [...prev.numbers];
          newNumbers[prev.currentIndex] = number;

          const newState = {
            ...prev,
            numbers: newNumbers,
            isSpinning: false,
            isDrawing: false,
            currentIndex: prev.currentIndex + 1,
          };

          if (prev.currentIndex === 5) {
            setTimeout(() => onComplete(newNumbers), 1000);
          }

          return newState;
        });
      },
      [onComplete]
    );

    const drawNextNumber = useCallback(() => {
      if (state.currentIndex >= 6) return;

      setState((prev) => ({
        ...prev,
        isSpinning: true,
        isDrawing: true,
      }));

      const remainingNumbers = LOTTO_NUMBERS.filter(
        (num) => !state.numbers.slice(0, state.currentIndex).includes(num)
      );
      const number =
        remainingNumbers[Math.floor(Math.random() * remainingNumbers.length)];

      setNextNumber(number);
      setShowAnimation(true);

      // 2秒後顯示中獎球
      setTimeout(() => {
        setShowFinalBall(true);
      }, DRAW_DURATION_SECONDS * 1000);
    }, [state.currentIndex, state.numbers]);

    React.useImperativeHandle(ref, () => ({
      drawNextNumber,
      isDrawing: state.isDrawing,
      currentIndex: state.currentIndex,
    }));

    const getRandomPosition = () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    });

    return (
      <>
        <AlertDialog open={showAnimation} onOpenChange={setShowAnimation}>
          <AlertDialogContent className="fixed flex items-center justify-center bg-transparent border-none shadow-none max-w-none w-screen h-screen p-0 m-0">
            <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
              {/* Random floating balls */}
              {Array.from({ length: BALL_COUNTS }).map((_, i) => {
                const initialPos = getRandomPosition();
                const finalPos = getRandomPosition();

                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 w-fit h-fit"
                    initial={initialPos}
                    animate={
                      showFinalBall
                        ? {
                            filter: "blur(3px)",
                          }
                        : {
                            x: [initialPos.x, finalPos.x],
                            y: [initialPos.y, finalPos.y],
                            transition: {
                              duration: DRAW_DURATION_SECONDS,
                              ease: "linear",
                            },
                          }
                    }
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {i + 1}
                    </div>
                  </motion.div>
                );
              })}

              {/* Center ball */}
              {showFinalBall && (
                <motion.div
                  className="absolute"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  <motion.div
                    className="w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 
                             shadow-[0_0_50px_rgba(250,204,21,0.5)] flex items-center justify-center cursor-pointer"
                    onClick={() => !isBallRevealed && setIsBallRevealed(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={["initial"]}
                    variants={{
                      initial: {
                        y: [-10, 10],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        },
                      },
                    }}
                  >
                    <motion.div
                      className="w-full h-full rounded-full flex items-center justify-center text-7xl font-bold text-white"
                      initial={false}
                      transition={{ duration: 0.6 }}
                    >
                      {isBallRevealed ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {String(nextNumber).padStart(2, "0")}
                        </motion.span>
                      ) : (
                        "?"
                      )}
                    </motion.div>
                  </motion.div>
                  {!isBallRevealed && (
                    <motion.div
                      className="absolute top-full mt-8 text-center w-full text-yellow-300 text-2xl font-bold"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Click to reveal number
                    </motion.div>
                  )}
                  {isBallRevealed && (
                    <motion.button
                      className="absolute top-full mt-8 px-6 py-3 bg-yellow-500/50 rounded-xl text-yellow-300 text-xl hover:bg-yellow-500/60 transition-colors w-full font-bold"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => handleAnimationComplete(nextNumber)}
                    >
                      Confirm
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 to-transparent -z-10 rounded-3xl" />
          <div className="flex justify-center space-x-4 mb-4 p-8 rounded-3xl border-2 border-green-200/30 backdrop-blur-sm">
            {state.numbers.map((number, index) => (
              <Ball
                key={index}
                number={number}
                shouldReveal={index < state.currentIndex}
              />
            ))}
          </div>
        </div>
      </>
    );
  })
);

const ResultsDisplay = React.memo(({ winners, prizes, onShowCoinRain }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const winCounts = React.useMemo(() => {
    const counts = {
      6: 0,
      5: 0,
      4: 0,
    };
    winners.forEach((winner) => {
      if (counts[winner.matchCount] !== undefined) {
        counts[winner.matchCount]++;
      }
    });
    return counts;
  }, [winners]);

  const handleShowWinners = useCallback(
    (category) => {
      setSelectedCategory(category);
      if (category >= WINNER_EFFECT_COUNT) {
        onShowCoinRain(true);
      }
    },
    [onShowCoinRain]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedCategory(null);
    onShowCoinRain(false);
  }, [onShowCoinRain]);

  const PrizeAmountDisplay = ({ amount }) => (
    <motion.div
      className="text-5xl font-semibold mt-1"
      animate={{
        opacity: [1, 0.7, 1],
        textShadow: [
          "0 0 10px rgba(250,204,21,0.5)",
          "0 0 20px rgba(250,204,21,0.8)",
          "0 0 10px rgba(250,204,21,0.5)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {amount}
    </motion.div>
  );

  const JackpotTrophy = () => (
    <motion.div
      className="text-5xl"
      animate={{
        rotate: [0, 10, -10, 0],
        scale: [1, 2.5, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {PRIZE_LABELS[6].icon}
    </motion.div>
  );

  return (
    <Card className="bg-transparent flex-1">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-10 h-10 text-yellow-300" />
          <h3 className="text-[40px] font-bold text-yellow-300">
            Results Summary
          </h3>
        </div>
        <div className="grid gap-4">
          {WINNING_CATEGORIES.map((count) => (
            <motion.div
              key={count}
              className={`p-4 rounded-lg border flex justify-between items-center relative overflow-visible
                ${
                  count === 6
                    ? "bg-gradient-to-r from-red-900/80 to-red-800/80 border-yellow-400 shadow-lg shadow-yellow-500/20"
                    : "bg-red-900/60 backdrop-blur-sm"
                }`}
            >
              <div className="flex flex-col items-center gap-2 w-full relative">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    {count === 6 ? (
                      <JackpotTrophy />
                    ) : (
                      <div className="text-5xl h-full">
                        {PRIZE_LABELS[count].icon}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={PRIZE_LABELS[count].className}>
                      {PRIZE_LABELS[count].label}
                    </div>
                    <PrizeAmountDisplay
                      amount={prizes[count] || DEFAULT_PRIZES[count]}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Users className="w-5 h-5 text-white-100" />
                    <span className="text-4xl font-bold text-white-100">
                      {winCounts[count]}
                    </span>
                  </div>
                </div>
                {winCounts[count] > 0 && (
                  <>
                    <div className="flex w-full border-t" />
                    <Button
                      variant="outline"
                      className="w-full h-12 mx-4 border-none bg-transparent hover:bg-yellow-400/10 text-yellow-300 font-bold text-2xl"
                      onClick={() => handleShowWinners(count)}
                    >
                      Show Winners {PRIZE_LABELS[count].icon}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedCategory !== null && (
            <WinnersList
              winners={winners}
              matchCount={selectedCategory}
              onClose={handleCloseModal}
            />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

const LottoDraw = () => {
  const [state, dispatch] = useReducer(reducer, {
    accountList: {},
    winners: [],
    prizes: DEFAULT_PRIZES,
  });
  const [showCoinRain, setShowCoinRain] = useState(false);
  const lotteryMachineRef = useRef(null);

  const handleShowCoinRain = useCallback((show) => {
    setShowCoinRain(show);
  }, []);

  // 使用 useCallback 優化回調函數
  const onFileUpload = useCallback((accounts) => {
    dispatch({ type: "SET_ACCOUNTS", payload: accounts });
  }, []);

  const setPrizes = useCallback((prizes) => {
    dispatch({ type: "SET_PRIZES", payload: prizes });
  }, []);

  const handleDrawNext = useCallback(() => {
    if (Object.keys(state.accountList).length === 0) {
      alert("Please upload the participants list first");
      return;
    }

    if (lotteryMachineRef.current && !lotteryMachineRef.current.isDrawing) {
      lotteryMachineRef.current.drawNextNumber();
    }
  }, [state.accountList]);

  const checkWinners = useCallback(
    (winningNumbers) => {
      const newWinners = [];
      Object.entries(state.accountList).forEach(([username, tickets]) => {
        tickets.forEach((ticket) => {
          const matchCount = ticket.filter((num) =>
            winningNumbers.includes(num)
          ).length;
          if (matchCount >= 4) {
            newWinners.push({
              username,
              numbers: ticket,
              matchCount,
              prize: state.prizes[matchCount],
            });
          }
        });
      });

      dispatch({ type: "ADD_WINNERS", payload: newWinners });
    },
    [state.accountList, state.prizes]
  );

  // 使用 useMemo 優化主要內容區域
  const mainContent = useMemo(
    () => (
      <div className="flex flex-col gap-6 relative">
        <Card className="overflow-hidden bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <LotteryMachine ref={lotteryMachineRef} onComplete={checkWinners} />
            <div className="flex justify-center">
              <Button
                onClick={handleDrawNext}
                disabled={lotteryMachineRef.current?.isDrawing}
                className="w-100 h-24 text-[66px] font-semibold border-2 border-yellow-400/50 
                bg-transparent hover:bg-yellow-400/10 transition-all duration-300
                backdrop-blur-sm text-yellow-400 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                variant="outline"
              >
                {lotteryMachineRef.current?.isDrawing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">🎲</span> Drawing...
                  </span>
                ) : lotteryMachineRef.current?.currentIndex === 6 ? (
                  <span className="flex items-center gap-2">🎯 Complete</span>
                ) : (
                  <span className="flex items-center gap-2">🎲 Draw</span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-6">
          <ResultsDisplay
            winners={state.winners}
            prizes={state.prizes}
            onShowCoinRain={handleShowCoinRain}
            className="bg-white/10 backdrop-blur-sm border-white/20"
          />

          <ParticipantsList
            participants={state.accountList}
            className="bg-white/10 backdrop-blur-sm border-white/20"
          />
        </div>
      </div>
    ),
    [
      handleDrawNext,
      checkWinners,
      state.winners,
      state.prizes,
      state.accountList,
      handleShowCoinRain,
    ]
  );

  return (
    <div
      className="min-h-screen bg-cover"
      style={{
        backgroundImage: `url("${process.env.PUBLIC_URL}/integrate/background.png")`,
      }}
    >
      <CelebrationEffect show={showCoinRain} />
      <SettingsModal onFileUpload={onFileUpload} onPrizeChange={setPrizes} />

      <div className="container mx-auto p-4 max-w-full relative">
        <CompanyLogos />
        <div className="grid grid-cols-[20%_minmax(600px,_60%)_20%] gap-4">
          <BackgroundLogos
            logos={[
              "integrate/left1.webp",
              "integrate/left2.webp",
              "integrate/left3.webp",
            ]}
          />
          {mainContent}
          <BackgroundLogos
            logos={["integrate/right1.png", "integrate/right2.png"]}
          />
        </div>
      </div>
    </div>
  );
};

// Reducer 函數用於處理狀態更新
const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ACCOUNTS":
      return {
        ...state,
        accountList: action.payload,
        winners: [], // Reset winners when new accounts are loaded
      };
    case "SET_PRIZES":
      return {
        ...state,
        prizes: action.payload,
      };
    case "ADD_WINNERS":
      return {
        ...state,
        winners: [...state.winners, ...action.payload],
      };
    default:
      return state;
  }
};

export default LottoDraw;
