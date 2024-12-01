import React, { useState, useEffect, useCallback, useRef } from "react";
import { Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import { AlertDialog, AlertDialogContent } from "../components/ui/alert-dialog";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Trophy, Upload } from "lucide-react";

const WINNING_CATEGORIES = [6, 5, 4];
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

const DEFAULT_PRIZES = {
  6: "₱1,000,000",
  5: "₱3,888",
  4: "₱88",
};

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

const SettingsModal = ({ onFileUpload, onPrizeChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 w-12 h-12 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 border-2 border-yellow-400/50"
      >
        <Settings className="w-6 h-6 text-yellow-300" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-2xl bg-black/95 border-2 border-yellow-400">
          <PrizeSettings onPrizeChange={onPrizeChange} />
          <FileUpload onFileUpload={onFileUpload} />
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full h-12 rounded-l bg-yellow-500/20 hover:bg-yellow-500/30 border-2 border-yellow-400/50"
          >
           Confirm
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsModal;
