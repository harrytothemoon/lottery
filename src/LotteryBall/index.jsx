import React, { useState, useEffect, useCallback, useRef } from "react";
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
const WINNING_CATEGORIES = [6, 5, 4, 3, 2];

const PRIZE_LABELS = {
  6: { label: "Grand Prize", icon: "👑" },
  5: { label: "First Prize", icon: "🏆" },
  4: { label: "Second Prize", icon: "🥈" },
  3: { label: "Third Prize", icon: "🥉" },
  2: { label: "Lucky Prize", icon: "🎯" },
};

const maskUsername = (username) => {
  if (!username || username.length <= 3) return username;
  return `${username.slice(0, 2)}${"*".repeat(
    username.length - 3
  )}${username.slice(-1)}`;
};

const CompanyLogos = () => (
  <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
    <img
      src={`${process.env.PUBLIC_URL}/lawin/logo.jpeg`}
      alt="Lawin"
      className="h-16 object-contain"
    />
    <img
      src={`${process.env.PUBLIC_URL}/lodibet/logo.jpeg`}
      alt="Lodibet"
      className="h-16 object-contain"
    />
  </div>
);

const Ball = ({ number, isSpinning, finalNumber, shouldReveal }) => {
  const [currentNumber, setCurrentNumber] = useState(1);

  useEffect(() => {
    let interval;
    if (isSpinning && !shouldReveal) {
      interval = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * 47) + 1);
      }, 50);
    } else if (shouldReveal) {
      setCurrentNumber(finalNumber);
    }
    return () => clearInterval(interval);
  }, [isSpinning, finalNumber, shouldReveal]);

  return (
    <div className="relative">
      <div
        className={`
        w-20 h-20 rounded-full
        flex items-center justify-center
        text-3xl font-bold
        bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500
        text-white
        shadow-lg
        transform transition-all duration-200
        ${isSpinning && !shouldReveal ? "animate-bounce" : ""}
        border-4 border-white/30
      `}
      >
        {String(currentNumber).padStart(2, "0")}
      </div>
    </div>
  );
};

const LotteryMachine = React.forwardRef(({ onComplete }, ref) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [numbers, setNumbers] = useState(Array(6).fill(null));
  const [revealedCount, setRevealedCount] = useState(0);

  const spin = useCallback(
    (result) => {
      setIsSpinning(true);
      setNumbers(Array(6).fill(null));
      setRevealedCount(0);

      const revealNextNumber = (index) => {
        if (index < 6) {
          setTimeout(
            () => {
              setNumbers((prev) => {
                const newNumbers = [...prev];
                newNumbers[index] = result[index];
                return newNumbers;
              });
              setRevealedCount(index + 1);
              revealNextNumber(index + 1);
            },
            index === 5 ? 2000 : 1000
          );
        } else {
          setIsSpinning(false);
          onComplete(result);
        }
      };

      revealNextNumber(0);
    },
    [onComplete]
  );

  React.useImperativeHandle(ref, () => ({
    spin,
  }));

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent -z-10 rounded-3xl" />
      <div className="flex justify-center space-x-4 mb-8 p-8 rounded-3xl border-2 border-blue-200/30 backdrop-blur-sm">
        {numbers.map((number, index) => (
          <Ball
            key={index}
            number={number}
            isSpinning={isSpinning}
            finalNumber={number}
            shouldReveal={index < revealedCount}
          />
        ))}
      </div>
    </div>
  );
});

const PrizeSettings = ({ onPrizeChange }) => {
  const [prizes, setPrizes] = useState({
    6: "",
    5: "",
    4: "",
    3: "",
    2: "",
  });

  const handlePrizeChange = (count, value) => {
    const newPrizes = { ...prizes, [count]: value };
    setPrizes(newPrizes);
    onPrizeChange(newPrizes);
  };

  return (
    <Card className="mb-6 bg-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Prize Settings</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {WINNING_CATEGORIES.map((count) => (
            <div key={count} className="flex items-center space-x-4">
              <label className="w-48 text-sm font-medium flex items-center gap-2">
                <span>{PRIZE_LABELS[count].icon}</span>
                <span>{PRIZE_LABELS[count].label}:</span>
              </label>
              <Input
                type="text"
                value={prizes[count]}
                onChange={(e) => handlePrizeChange(count, e.target.value)}
                placeholder={`Enter prize for ${PRIZE_LABELS[count].label}`}
                className="flex-1 bg-transparent"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ParticipantsList = ({ participants = {} }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredParticipants = React.useMemo(() => {
    return Object.entries(participants)
      .flatMap(([username, tickets]) =>
        tickets.map((ticket) => ({
          username,
          numbers: ticket.join(", "),
        }))
      )
      .filter(
        (item) =>
          item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.numbers.includes(searchTerm)
      );
  }, [participants, searchTerm]);

  const handleDownload = () => {
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
  };

  return (
    <Card className="mb-6  bg-transparent">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Participants List</h3>
            <span className="text-sm text-muted-foreground">
              ({filteredParticipants.length} tickets)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64  bg-transparent"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2 bg-transparent hover:bg-transparent  hover:bg-yellow-400/10 transition-all duration-300 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
        <div className="rounded-lg border">
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[200px]">Username</TableHead>
                  <TableHead>Numbers</TableHead>
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
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {maskUsername(p.username)}
                      </TableCell>
                      <TableCell>{p.numbers}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const ResultsDisplay = ({ winners, prizes }) => {
  const [winCounts, setWinCounts] = useState({
    6: 0,
    5: 0,
    4: 0,
    3: 0,
    2: 0,
  });

  useEffect(() => {
    const counts = {
      6: 0,
      5: 0,
      4: 0,
      3: 0,
      2: 0,
    };
    winners.forEach((winner) => {
      counts[winner.matchCount]++;
    });
    setWinCounts(counts);
  }, [winners]);

  return (
    <Card className="bg-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Results Summary</h3>
        </div>
        <div className="grid gap-4">
          {WINNING_CATEGORIES.map((count) => (
            <div
              key={count}
              className={`p-4 rounded-lg border flex justify-between items-center
                ${
                  count === 6
                    ? "bg-gradient-to-r from-yellow-500/30 to-amber-500/10 border-yellow-400 shadow-lg shadow-yellow-500/20"
                    : "bg-white/5 backdrop-blur-sm"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{PRIZE_LABELS[count].icon}</span>
                <div>
                  <span className="font-medium">
                    {PRIZE_LABELS[count].label}
                  </span>
                  <div className="text-sm text-muted-foreground">
                    Prize: {prizes[count] || "Not set"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {winCounts[count]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


const FileUpload = ({ onFileUpload, onPrizeChange, theme, themeName }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content
          .split("\n")
          .slice(1)
          .filter((line) => line.trim());
        const accounts = {};

        lines.forEach((line) => {
          const [username, ticket] = line.trim().split(",");
          if (username && ticket) {
            const numbers = ticket.replace("Lodi", "").split(".").map(Number);
            if (!accounts[username]) {
              accounts[username] = [];
            }
            accounts[username].push(numbers);
          }
        });

        onFileUpload(accounts);
      };
      reader.readAsText(file);
    }
  };

  const CustomFileInput = () => (
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
        className="w-full bg-transparent hover:bg-transparent  hover:bg-yellow-400/10 transition-all duration-300 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
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
  );

  return (
    <Card className="mb-6  bg-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Upload Data</h3>
        </div>
        <div className="space-y-4">
          <CustomFileInput />
        </div>
      </CardContent>
    </Card>
  );
};

const LottoDraw = () => {
  const [accountList, setAccountList] = useState({});
  const [winners, setWinners] = useState([]);
  const [prizes, setPrizes] = useState({});
  const [isSpinning, setIsSpinning] = useState(false);
  const lotteryMachineRef = useRef(null);

  const onFileUpload = (accounts) => {
        setAccountList(accounts);
        setWinners([]);
  };

  const handleSpin = () => {
    if (Object.keys(accountList).length === 0) {
      alert("Please upload the participants list first");
      return;
    }

    setIsSpinning(true);
    const winningNumbers = [...LOTTO_NUMBERS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .sort((a, b) => a - b);

    if (lotteryMachineRef.current) {
      lotteryMachineRef.current.spin(winningNumbers);
    }
  };

  const checkWinners = useCallback(
    (winningNumbers) => {
      const newWinners = [];

      Object.entries(accountList).forEach(([username, tickets]) => {
        tickets.forEach((ticket) => {
          const matchCount = ticket.filter((num) =>
            winningNumbers.includes(num)
          ).length;
          if (matchCount >= 2) {
            newWinners.push({
              username,
              numbers: ticket,
              matchCount,
              prize: prizes[matchCount],
            });
          }
        });
      });

      setWinners((prev) => [...prev, ...newWinners]);
      setIsSpinning(false);
    },
    [accountList, prizes]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-purple-900">
      <div className="container mx-auto p-8 max-w-7xl relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <CompanyLogos />
        <div className="grid gap-6 relative">
          <Card className="overflow-hidden bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <LotteryMachine
                ref={lotteryMachineRef}
                onComplete={checkWinners}
              />
              <div className="flex justify-center">
                <Button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="w-64 h-12 text-lg font-semibold border-2 border-yellow-400/50 
                bg-transparent hover:bg-yellow-400/10 transition-all duration-300
                backdrop-blur-sm text-yellow-400 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                  variant="outline"
                >
                  {isSpinning ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">🎲</span> Drawing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      🎲 Start Draw
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <FileUpload
                onFileUpload={onFileUpload}
                className="bg-white/10 backdrop-blur-sm border-white/20"
              />
              <PrizeSettings
                onPrizeChange={setPrizes}
                className="bg-white/10 backdrop-blur-sm border-white/20"
              />
            </div>
            <ResultsDisplay
              winners={winners}
              prizes={prizes}
              className="bg-white/10 backdrop-blur-sm border-white/20"
            />
          </div>

          <ParticipantsList
            participants={accountList}
            className="bg-white/10 backdrop-blur-sm border-white/20"
          />
        </div>
      </div>
    </div>
  );
};

export default LottoDraw;
