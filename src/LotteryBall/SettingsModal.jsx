import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { AlertDialog, AlertDialogContent } from '../components/ui/alert-dialog';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Trophy, Upload } from 'lucide-react';

const WINNING_CATEGORIES = [6, 5, 4];
const PRIZE_LABELS = {
  6: {
    label: 'Jackpot',
    icon: '👑',
    className: 'text-2xl font-bold text-yellow-300',
  },
  5: {
    label: 'First Prize',
    icon: '🏆',
    className: 'text-xl font-bold text-yellow-300',
  },
  4: {
    label: 'Second Prize',
    icon: '🥈',
    className: 'text-xl font-bold text-yellow-300',
  },
};

const DEFAULT_PRIZES = {
  6: '₱1,000,000',
  5: '₱3,888',
  4: '₱88',
};

const PrizeSettings = React.memo(({ onPrizeChange }) => {
  const [prizes, setPrizes] = useState(DEFAULT_PRIZES);

  useEffect(() => {
    onPrizeChange(prizes);
  }, [onPrizeChange, prizes]);

  const handlePrizeChange = useCallback(
    (count, value) => {
      setPrizes(prev => {
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
          {WINNING_CATEGORIES.map(count => (
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
                onChange={e => handlePrizeChange(count, e.target.value)}
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
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);

  // 創建 Web Worker 來處理檔案
  const createWorker = () => {
    try {
      const workerCode = `
        self.onmessage = function(e) {
          try {
            const { content, chunkSize } = e.data;
            // 移除開頭的 BOM 和換行符，然後過濾空行
            const lines = content.split('\\n').slice(1).filter(line => line.trim());
            const accounts = {};
            let processedLines = 0;
            const totalLines = lines.length;

            // 分批處理數據
            for (let i = 0; i < lines.length; i += chunkSize) {
              const chunk = lines.slice(i, i + chunkSize);
              
              chunk.forEach(line => {
                // 移除可能的換行符 \\r
                const cleanLine = line.replace(/\\r$/, '');
                // 使用正則表達式來正確處理CSV格式
                const match = cleanLine.match(/^([^,]+),(".*")$/);
                if (match) {
                  const username = match[1];
                  const ticketStr = match[2];
                  if (username && ticketStr) {
                    // 去掉外層引號,然後分割數字
                    const numbers = ticketStr.replace(/^"|"$/g, '').split(',').map(Number);
                    if (!accounts[username]) {
                      accounts[username] = [];
                    }
                    accounts[username].push(numbers);
                  }
                }
              });

              processedLines += chunk.length;
              // 回報進度
              self.postMessage({
                type: 'progress',
                progress: (processedLines / totalLines) * 100
              });
            }

            // 完成處理，返回結果
            self.postMessage({
              type: 'complete',
              accounts
            });
          } catch (error) {
            self.postMessage({
              type: 'error',
              error: error.message
            });
          }
        };
      `;


      const blob = new Blob([workerCode], { type: 'text/javascript' });
      return new Worker(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error creating worker:', error);
      throw error;
    }
  };

  const cleanupWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const handleFileChange = useCallback(
    event => {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file);
        setIsProcessing(true);
        setProgress(0);
        setError(null);

        // 清理舊的 Worker
        cleanupWorker();

        const reader = new FileReader();
        reader.onload = e => {
          try {
            // 創建新的 Worker
            workerRef.current = createWorker();

            workerRef.current.onmessage = workerEvent => {
              const { type, progress, accounts, error } = workerEvent.data;

              if (type === 'progress') {
                setProgress(Math.round(progress));
              } else if (type === 'complete') {
                onFileUpload(accounts);
                setIsProcessing(false);
                cleanupWorker();
              } else if (type === 'error') {
                setError(error);
                setIsProcessing(false);
                cleanupWorker();
              }
            };

            workerRef.current.onerror = error => {
              setError(error.message);
              setIsProcessing(false);
              cleanupWorker();
            };

            // 發送數據到 Worker
            workerRef.current.postMessage({
              content: e.target.result,
              chunkSize: 1000,
            });
          } catch (error) {
            setError(error.message);
            setIsProcessing(false);
            cleanupWorker();
          }
        };

        reader.onerror = error => {
          setError(error.message);
          setIsProcessing(false);
          cleanupWorker();
        };

        // 以文本方式讀取檔案
        reader.readAsText(file);
      }
    },
    [onFileUpload, cleanupWorker]
  );

  // 組件卸載時清理 Worker
  React.useEffect(() => {
    return () => {
      cleanupWorker();
    };
  }, [cleanupWorker]);

  const handleRetry = useCallback(() => {
    setError(null);
    setProgress(0);
    setIsProcessing(false);
    cleanupWorker();
    fileInputRef.current.value = '';
  }, [cleanupWorker]);

  return (
    <Card className="mb-6 bg-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-white-500" />
          <h3 className="text-lg font-semibold">Upload Data</h3>
        </div>
        <div className="space-y-4">
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
            disabled={isProcessing}
            className="w-full bg-transparent hover:bg-transparent hover:bg-yellow-400/10 transition-all duration-300 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isProcessing
              ? `Processing ${progress.toFixed(1)}%`
              : selectedFile
              ? selectedFile.name
              : 'Select Participants File'}
          </Button>
          {isProcessing && (
            <div className="w-full bg-yellow-900/20 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {error && (
            <div className="mt-2">
              <p className="text-red-500">Error: {error}</p>
              <Button
                variant="outline"
                onClick={handleRetry}
                className="mt-2 bg-red-500/20 hover:bg-red-500/30"
              >
                Retry
              </Button>
            </div>
          )}
          {selectedFile && !isProcessing && !error && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected file: {selectedFile.name}
            </p>
          )}
        </div>
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
        className="fixed bottom-4 left-4 w-12 h-12 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 border-2 border-yellow-400/50 z-[20]"
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
