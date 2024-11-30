import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useReducer,
} from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Trophy, Users, Download, Upload } from "lucide-react";

const LOTTO_NUMBERS = Array.from({ length: 47 }, (_, i) => i + 1);

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
    className: "text-2xl font-bold text-yellow-300",
  },
  5: {
    label: "First Prize",
    icon: "🏆",
    className: "text-xl font-bold text-yellow-300",
  },
  4: {
    label: "Second Prize",
    icon: "🥈",
    className: "text-xl font-bold text-yellow-300",
  },
};
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

const BackgroundLogos = React.memo(({ logos }) => (
  <div className="flex flex-col items-center gap-12 mt-12 w-full">
    {logos.map((src, index) => (
      <img
        key={index}
        src={`${process.env.PUBLIC_URL}/${src}`}
        width="100%"
        alt="background"
        className=""
      />
    ))}
  </div>
));

const Ball = React.memo(({ number, isSpinning, finalNumber, shouldReveal }) => {
  const [currentNumber, setCurrentNumber] = useState("00");

  useEffect(() => {
    let interval;
    if (isSpinning && !shouldReveal) {
      interval = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * 47) + 1);
      }, 50);
    } else if (shouldReveal && finalNumber) {
      setCurrentNumber(finalNumber);
    }
    return () => clearInterval(interval);
  }, [isSpinning, finalNumber, shouldReveal]);

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
        ${isSpinning && !shouldReveal ? "animate-bounce" : ""}
        border-4 border-yellow-300
      `}
      >
        {String(currentNumber).padStart(2, "0")}
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
      const nextNumber =
        remainingNumbers[Math.floor(Math.random() * remainingNumbers.length)];

      setTimeout(() => {
        setState((prev) => {
          const newNumbers = [...prev.numbers];
          newNumbers[prev.currentIndex] = nextNumber;

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
      }, 2000);
    }, [state.currentIndex, state.numbers, onComplete]);

    React.useImperativeHandle(ref, () => ({
      drawNextNumber,
      isDrawing: state.isDrawing,
      currentIndex: state.currentIndex,
    }));

    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 to-transparent -z-10 rounded-3xl" />
        <div className="flex justify-center space-x-4 mb-8 p-8 rounded-3xl border-2 border-green-200/30 backdrop-blur-sm">
          {state.numbers.map((number, index) => (
            <Ball
              key={index}
              number={number}
              isSpinning={state.isSpinning && index === state.currentIndex}
              finalNumber={number}
              shouldReveal={index < state.currentIndex}
            />
          ))}
        </div>
      </div>
    );
  })
);

const PrizeSettings = React.memo(({ onPrizeChange }) => {
  const [prizes, setPrizes] = useState(DEFAULT_PRIZES);

  useEffect(() => {
    onPrizeChange(prizes);
  }, [onPrizeChange, prizes]);

  const handlePrizeChange = useCallback(
    (count, value) => {
      setPrizes((prev) => {
        const newPrizes = { ...prev, [count]: value };
        onPrizeChange(newPrizes);
        return newPrizes;
      });
    },
    [onPrizeChange]
  );

 return (
   <Card className="mb-6 bg-transparent">
     <CardContent className="p-6">
       <div className="flex items-center gap-2 mb-4">
         <Trophy className="w-6 h-6 text-yellow-300" />
         <h3 className="text-2xl font-bold text-yellow-300">Prize Settings</h3>
       </div>
       <div className="grid grid-cols-1 gap-4">
         {WINNING_CATEGORIES.map((count) => (
           <div
             key={count}
             className="flex items-center space-x-4 bg-red-900/60 p-4 rounded-lg"
           >
             <label className="w-fit font-medium flex items-center gap-3">
               <span className="text-2xl">{PRIZE_LABELS[count].icon}</span>
               <span className={PRIZE_LABELS[count].className}>
                 {PRIZE_LABELS[count].label}:
               </span>
             </label>
             <Input
               type="text"
               value={prizes[count]}
               onChange={(e) => handlePrizeChange(count, e.target.value)}
               placeholder={`Enter prize for ${PRIZE_LABELS[count].label}`}
               className="flex-1 bg-red-800/60 border-yellow-400/50 text-yellow-300 text-xl placeholder:text-yellow-300/50 font-bold text-end border-none"
             />
           </div>
         ))}
       </div>
     </CardContent>
   </Card>
 );
});



const ParticipantsList = React.memo(({ participants = {} }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useRef(null);

  // 使用 useMemo 優化篩選邏輯
  const filteredParticipants = React.useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return Object.entries(participants)
      .flatMap(([username, tickets]) =>
        tickets.map((ticket) => ({
          username,
          numbers: ticket.join(", "),
        }))
      )
      .filter(
        (item) =>
          item.username.toLowerCase().includes(searchLower) ||
          item.numbers.includes(searchTerm)
      );
  }, [participants, searchTerm]);

  // 優化搜索處理函數
  const handleSearch = useCallback((e) => {
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
    debouncedSearch.current = setTimeout(() => {
      setSearchTerm(e.target.value);
    }, 300);
  }, []);

  // 優化下載處理函數
  const handleDownload = useCallback(() => {
    const csv = [
      ["Username", "Numbers"],
      ...filteredParticipants.map((p) => [p.username, p.numbers]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants_list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredParticipants]);

  // 優化表格渲染
  const TableContent = React.useMemo(
    () => (
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[200px] text-lg">Username</TableHead>
            <TableHead className="text-lg">Numbers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredParticipants.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={2}
                className="text-center text-muted-foreground"
              >
                No participants found
              </TableCell>
            </TableRow>
          ) : (
            filteredParticipants.map((p, i) => (
              <TableRow key={`${p.username}-${i}`}>
                <TableCell className="font-bold text-lg">
                  {maskUsername(p.username)}
                </TableCell>
                <TableCell className="font-bold text-lg">{p.numbers}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    ),
    [filteredParticipants]
  );

  return (
    <Card className="mb-6 bg-transparent">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white-500" />
            <h3 className="text-lg font-semibold">Participants List</h3>
            <span className="text-sm text-muted-foreground">
              ({filteredParticipants.length} tickets)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="search"
              placeholder="Search..."
              onChange={handleSearch}
              className="w-64 bg-transparent"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2 bg-transparent hover:bg-transparent hover:bg-yellow-400/10 transition-all duration-300 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
        <div className="rounded-lg border">
          <div className="max-h-[400px] overflow-auto">{TableContent}</div>
        </div>
      </CardContent>
    </Card>
  );
});

const ResultsDisplay = React.memo(({ winners, prizes }) => {
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

  return (
    <Card className="bg-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-300" />
          <h3 className="text-2xl font-bold text-yellow-300">
            Results Summary
          </h3>
        </div>
        <div className="grid gap-4">
          {WINNING_CATEGORIES.map((count) => (
            <div
              key={count}
              className={`p-6 rounded-lg border flex justify-between items-center
                ${
                  count === 6
                    ? "bg-gradient-to-r from-red-900/80 to-red-800/80 border-yellow-400 shadow-lg shadow-yellow-500/20"
                    : "bg-red-900/60 backdrop-blur-sm"
                }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{PRIZE_LABELS[count].icon}</span>
                <div>
                  <span className={PRIZE_LABELS[count].className}>
                    {PRIZE_LABELS[count].label}
                  </span>
                  <div className="text-3xl font-semibold text-yellow-300 mt-1">
                    {prizes[count] || DEFAULT_PRIZES[count]}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-yellow-300" />
                <span className="text-4xl font-bold text-yellow-300">
                  {winCounts[count]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});


const FileUpload = React.memo(({ onFileUpload }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            const lines = content
              .split("\n")
              .slice(1)
              .filter((line) => line.trim());
            const accounts = {};

            lines.forEach((line) => {
              const [username, ticket] = line.trim().split(",");
              if (username && ticket) {
                const numbers = ticket
                  .replace("Lodi", "")
                  .split(".")
                  .map(Number);
                if (!accounts[username]) {
                  accounts[username] = [];
                }
                accounts[username].push(numbers);
              }
            });

            onFileUpload(accounts);
          } catch (error) {
            console.error("Error processing file:", error);
            alert("Error processing file. Please check the file format.");
          }
        };
        reader.readAsText(file);
      }
    },
    [onFileUpload]
  );

  const CustomFileInput = React.useMemo(
    () => (
      <div className="mt-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-transparent hover:bg-transparent hover:bg-yellow-400/10 transition-all duration-300 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
        >
          <Upload className="w-4 h-4 mr-2" />
          {selectedFile ? selectedFile.name : "Select Participants File"}
        </Button>
        {selectedFile && (
          <p className="text-sm text-muted-foreground mt-1">
            Selected file: {selectedFile.name}
          </p>
        )}
        {!selectedFile && (
          <p className="text-sm text-muted-foreground mt-1">No file selected</p>
        )}
      </div>
    ),
    [selectedFile, handleFileChange]
  );

  return (
    <Card className="mb-6 bg-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-white-500" />
          <h3 className="text-lg font-semibold">Upload Data</h3>
        </div>
        <div className="space-y-4">{CustomFileInput}</div>
      </CardContent>
    </Card>
  );
});

const LottoDraw = () => {
  // 使用 useReducer 來管理複雜的狀態邏輯
  const [state, dispatch] = useReducer(reducer, {
    accountList: {},
    winners: [],
    prizes: DEFAULT_PRIZES,
  });

  const lotteryMachineRef = useRef(null);

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
      <div className="grid gap-6 relative">
        <Card className="overflow-hidden bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8">
            <LotteryMachine ref={lotteryMachineRef} onComplete={checkWinners} />
            <div className="flex justify-center">
              <Button
                onClick={handleDrawNext}
                disabled={lotteryMachineRef.current?.isDrawing}
                className="w-100 h-16 text-2xl font-semibold border-2 border-yellow-400/50 
              bg-transparent hover:bg-yellow-400/10 transition-all duration-300
              backdrop-blur-sm text-yellow-400 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                variant="outline"
              >
                {lotteryMachineRef.current?.isDrawing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">🎲</span> Drawing...
                  </span>
                ) : lotteryMachineRef.current?.currentIndex === 6 ? (
                  <span className="flex items-center gap-2">
                    🎯 Draw Complete
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🎲 Draw Number
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <PrizeSettings
              onPrizeChange={setPrizes}
              className="bg-white/10 backdrop-blur-sm border-white/20"
            />
            <FileUpload
              onFileUpload={onFileUpload}
              className="bg-white/10 backdrop-blur-sm border-white/20"
            />
          </div>
          <ResultsDisplay
            winners={state.winners}
            prizes={state.prizes}
            className="bg-white/10 backdrop-blur-sm border-white/20"
          />
        </div>

        <ParticipantsList
          participants={state.accountList}
          className="bg-white/10 backdrop-blur-sm border-white/20"
        />
      </div>
    ),
    [
      handleDrawNext,
      checkWinners,
      onFileUpload,
      setPrizes,
      state.winners,
      state.prizes,
      state.accountList,
    ]
  );

  return (
    <div
      className="min-h-screen bg-cover"
      style={{
        backgroundImage: `url("${process.env.PUBLIC_URL}/integrate/background.png")`,
      }}
    >
      <div className="container mx-auto p-4 max-w-screen-2xl relative">
        <CompanyLogos />
        <div className="grid grid-cols-[20%_minmax(600px,_60%)_20%] gap-4">
          <BackgroundLogos
            logos={[
              "integrate/left1.png",
              "integrate/left1.png",
              "integrate/left1.png",
            ]}
          />
          {mainContent}
          <BackgroundLogos
            logos={["integrate/right1.png", "integrate/right1.png"]}
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
