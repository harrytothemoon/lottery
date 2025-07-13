import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Settings,
  Cloud,
  Wifi,
  WifiOff,
  Trophy,
  Users,
  Crown,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
} from '../../components/ui/alert-dialog';
import { motion } from 'framer-motion';
import useSound from 'use-sound';
import Confetti from 'react-confetti';
import { useTheme } from '../../themes';
import useFavicon from '../../hooks/index';
import { hasAdminQuery } from './config';
import { googleSheetsAPI, GOOGLE_SHEETS_CONFIG } from './googleSheets';
import spinSound from '../../sounds/spin.wav';
import winSound from '../../sounds/win.mp3';
import ChristmasEffects from '../../components/christmasEffects';

// 用户名遮罩函数
const maskUsername = username => {
  if (!username || username.length <= 3) return username;
  return `${username.slice(0, 2)}${'*'.repeat(
    username.length - 3
  )}${username.slice(-1)}`;
};

// 设置模态框组件
const SettingsModal = ({
  onRefreshData,
  onSheetUrlChange,
  currentSheetUrl,
  isLoading,
  connectionStatus,
}) => {
  const [open, setOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(
    currentSheetUrl || GOOGLE_SHEETS_CONFIG.SHEET_URL
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const handleTestConnection = useCallback(async () => {
    setIsTestingConnection(true);
    setTestStatus(null);

    try {
      const result = await googleSheetsAPI.testConnection(sheetUrl);
      setTestStatus(result);
    } catch (error) {
      setTestStatus({
        success: false,
        error: error.message,
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [sheetUrl]);

  const handleSheetUrlSubmit = useCallback(() => {
    onSheetUrlChange(sheetUrl);
    setTestStatus(null);
  }, [sheetUrl, onSheetUrlChange]);

  return (
    <>
      <motion.div
        className="fixed bottom-4 left-4 z-[20]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 
                   hover:from-green-500 hover:to-emerald-500 border-2 border-green-400/50
                   shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]
                   transition-all duration-300"
        >
          <Settings className="w-7 h-7 text-white" />
        </Button>
      </motion.div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-4xl bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 border-2 border-green-400/70 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
          <div className="space-y-6">
            <div className="bg-black/80 backdrop-blur-md rounded-xl border border-green-400/50 p-6 shadow-[0_0_25px_rgba(34,197,94,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-green-400" />
                <span className="text-green-400 font-bold text-xl drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                  Google Sheets Data Source
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">
                    Google Sheets URL
                  </label>
                  <Input
                    type="url"
                    value={sheetUrl}
                    onChange={e => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-black/70 border-green-400/70 text-white placeholder:text-green-400/70
                              focus:border-green-400 focus:ring-2 focus:ring-green-400/30"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500
                             text-white font-bold border-2 border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  >
                    {isTestingConnection ? 'Testing...' : '🔗 Test Connection'}
                  </Button>
                  <Button
                    onClick={handleSheetUrlSubmit}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500
                             text-white font-bold border-2 border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  >
                    ✅ Save Config
                  </Button>
                </div>

                <Button
                  onClick={onRefreshData}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500
                           text-white font-bold border-2 border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                >
                  🔄 Refresh Data
                </Button>

                {testStatus && (
                  <div
                    className={`p-4 rounded-lg border ${
                      testStatus.success
                        ? 'bg-green-600/20 border-green-400/50 text-green-400'
                        : 'bg-red-600/20 border-red-400/50 text-red-400'
                    }`}
                  >
                    {testStatus.success ? (
                      <div>
                        <p className="font-bold">✅ Connection Success!</p>
                        <p>Users: {testStatus.userCount}</p>
                        <p>Total Tickets: {testStatus.totalTickets}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold">❌ Connection Failed</p>
                        <p>{testStatus.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => setOpen(false)}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500
                       text-white font-bold border-2 border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              ✅ Confirm Settings
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// 中奖模态框组件
const WinnerModal = ({
  isOpen,
  onClose,
  winner,
  prize,
  theme,
  themeName,
  onConfirm,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [playWinSound] = useSound(winSound, { volume: 0.3 });

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      playWinSound();
    } else {
      setShowConfetti(false);
    }
  }, [isOpen, playWinSound]);

  const handleClose = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      {showConfetti && <Confetti gravity={0.4} initialVelocityY={100} />}
      <ChristmasEffects />
      <Card
        themeName={themeName}
        className="w-[90%] max-w-[500px] shadow-2xl rounded-3xl border-4 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 border-green-400/50"
      >
        <CardContent className="p-8 text-center" themeName={themeName}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-400 mb-4">
              🎉 Congratulations!
            </h2>
            <p className="text-2xl text-green-300 mb-2">Winner: {winner}</p>
            <p className="text-xl text-green-300 mb-6">Prize: {prize}</p>
          </motion.div>

          <Button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500
                     text-white font-bold py-3 px-6 rounded-full text-lg border-2 border-green-400/50
                     shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// 转盘组件
const Reel = ({ spinning, stopSymbol, shouldReveal, theme }) => {
  const symbols = React.useMemo(
    () => ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    []
  );
  const [position, setPosition] = useState(
    Math.floor(Math.random() * symbols.length)
  );

  useEffect(() => {
    let interval;
    if (spinning && !shouldReveal) {
      interval = setInterval(() => {
        setPosition(Math.floor(Math.random() * symbols.length));
      }, 50);
    } else if (shouldReveal) {
      clearInterval(interval);
      setPosition(symbols.indexOf(stopSymbol));
    }
    return () => clearInterval(interval);
  }, [spinning, stopSymbol, symbols, shouldReveal]);

  return (
    <div
      className="reel overflow-hidden h-28 w-20 border-3 flex items-center justify-center text-6xl font-bold 
                  bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 border-green-400/70 
                  text-green-400 shadow-[0_0_25px_rgba(34,197,94,0.4)] rounded-lg
                  relative before:absolute before:inset-0 before:border-2 before:border-green-400/30 before:rounded-lg"
    >
      {symbols[position]}
    </div>
  );
};

// 老虎机组件
const SlotMachine = React.forwardRef(
  ({ onComplete, digitCount, theme }, ref) => {
    const [spinning, setSpinning] = useState(false);
    const [stopSymbols, setStopSymbols] = useState(
      Array(digitCount).fill(null)
    );
    const [revealedCount, setRevealedCount] = useState(0);
    const [playSpinSound] = useSound(spinSound, { volume: 0.3 });

    const spin = useCallback(
      result => {
        playSpinSound();
        setSpinning(true);
        setStopSymbols(Array(digitCount).fill(null));
        setRevealedCount(0);

        const revealNextDigit = index => {
          if (index < digitCount) {
            setTimeout(
              () => {
                setStopSymbols(prev => {
                  const newSymbols = [...prev];
                  newSymbols[index] = result[index];
                  return newSymbols;
                });
                setRevealedCount(index + 1);
                revealNextDigit(index + 1);
              },
              index === digitCount - 1 ? 3000 : 1500
            );
          } else {
            setSpinning(false);
            onComplete(result.join(''));
          }
        };

        revealNextDigit(0);
      },
      [onComplete, digitCount, playSpinSound]
    );

    React.useImperativeHandle(ref, () => ({
      spin,
    }));

    return (
      <div
        className="flex justify-center space-x-3 mb-4 p-8 rounded-xl shadow-inner border-4 
                  bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 border-green-400/70
                  relative overflow-hidden"
      >
        {stopSymbols.map((symbol, index) => (
          <Reel
            key={index}
            spinning={spinning}
            stopSymbol={symbol}
            shouldReveal={index < revealedCount}
            theme={theme}
          />
        ))}
      </div>
    );
  }
);

// 获奖者列表组件
const WinnersList = ({ winners, theme }) => {
  if (winners.length === 0) return null;

  return (
    <div className="bg-black/80 backdrop-blur-md rounded-xl border border-yellow-400/50 p-6 mb-6 shadow-[0_0_30px_rgba(255,193,7,0.2)]">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <span className="text-yellow-400 font-bold text-xl drop-shadow-[0_0_10px_rgba(255,193,7,0.8)]">
          Winners ({winners.length})
        </span>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {winners.map(winner => (
          <div
            key={winner.id}
            className="p-4 mb-3 rounded-lg bg-yellow-900/20 border border-yellow-400/40 hover:border-yellow-400/70 
                     transition-all hover:shadow-[0_0_15px_rgba(255,193,7,0.3)]"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium text-lg">
                  {maskUsername(winner.username)}
                </span>
              </div>
              <span className="text-yellow-400 font-bold text-sm">
                {winner.timestamp}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-300 text-sm">Prize:</span>
              <span className="text-yellow-400 font-bold">{winner.prize}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 text-sm">Ticket:</span>
              <span className="px-2 py-1 bg-yellow-600/30 text-yellow-300 text-xs rounded border border-yellow-400/50">
                {winner.ticket}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 参与者列表组件
const ParticipantsList = ({
  participants,
  theme,
  totalAvailableTickets,
  usedTickets,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = React.useMemo(() => {
    if (!searchTerm) return participants;
    return participants.filter(
      participant =>
        participant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.tickets.some(ticket => ticket.includes(searchTerm)) ||
        participant.remainingTickets.some(ticket => ticket.includes(searchTerm))
    );
  }, [participants, searchTerm]);

  return (
    <div className="bg-black/80 backdrop-blur-md rounded-xl border border-green-400/50 p-6 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-green-400" />
        <span className="text-green-400 font-bold text-xl drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
          Participants ({participants.length} people)
        </span>
      </div>

      {/* 显示剩余票数统计 */}
      <div className="mb-4 p-3 bg-green-600/20 border border-green-400/50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-green-300">Total Available Tickets:</span>
          <span className="text-green-400 font-bold">
            {totalAvailableTickets}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-green-300">Used Tickets:</span>
          <span className="text-red-400 font-bold">{usedTickets.size}</span>
        </div>
      </div>

      <Input
        type="text"
        placeholder="Search username or ticket number..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full mb-4 bg-black/70 border-green-400/70 text-white placeholder:text-green-400/70
                  focus:border-green-400 focus:ring-2 focus:ring-green-400/30"
      />

      <div className="max-h-[48rem] overflow-y-auto">
        {filteredParticipants.map((participant, index) => (
          <div
            key={participant.username}
            className="p-4 mb-3 rounded-lg bg-black/70 border border-green-400/40 hover:border-green-400/70 
                     transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium text-lg">
                  {maskUsername(participant.username)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-green-400 font-bold text-sm">
                    {participant.remainingCount}/{participant.totalTickets}
                  </div>
                  <div className="text-green-300 text-xs">remaining</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {participant.tickets.map((ticket, ticketIndex) => {
                const isUsed = usedTickets.has(ticket);
                return (
                  <span
                    key={ticketIndex}
                    className={`px-2 py-1 text-xs rounded border transition-all ${
                      isUsed
                        ? 'bg-red-600/30 text-red-300 border-red-400/50 line-through opacity-60'
                        : 'bg-green-600/30 text-green-300 border-green-400/50 hover:bg-green-600/40'
                    }`}
                  >
                    {ticket}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 主要组件
const Naseebet = () => {
  useFavicon();
  const theme = useTheme('green');
  const [accountList, setAccountList] = useState({});
  const [winnerResult, setWinnerResult] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prize, setPrize] = useState('');
  const [digitCount, setDigitCount] = useState(6);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [sheetUrl, setSheetUrl] = useState(GOOGLE_SHEETS_CONFIG.SHEET_URL);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [winners, setWinners] = useState([]);
  const [usedTickets, setUsedTickets] = useState(new Set()); // 记录已抽过的票号

  const slotMachineRef = useRef(null);

  // 网络状态监听
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 加载 Google Sheets 数据
  const loadGoogleSheetsData = useCallback(async () => {
    setIsLoading(true);
    setConnectionStatus(null);

    try {
      const data = await googleSheetsAPI.fetchSheetData(sheetUrl);
      setAccountList(data);

      // 计算最大票号位数
      const maxTicket = Object.values(data)
        .flat()
        .reduce((max, ticket) => {
          const match = ticket.match(/[1-9]\d*/);
          if (match) {
            const numericPart = match[0];
            return numericPart.length > max.length ? numericPart : max;
          }
          return max;
        }, '');

      setDigitCount(maxTicket.length || 6);
      setConnectionStatus({
        success: true,
        message: 'Data loaded successfully',
      });
    } catch (error) {
      console.error('Data loading failed:', error);
      setConnectionStatus({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [sheetUrl]);

  // 初始化数据加载
  useEffect(() => {
    loadGoogleSheetsData();
  }, [loadGoogleSheetsData]);

  // 处理抽奖
  const handleDraw = useCallback(() => {
    if (!prize.trim()) {
      alert('Please enter prize name');
      return;
    }

    if (Object.keys(accountList).length === 0) {
      alert('No participant data available');
      return;
    }

    setIsDrawing(true);

    // 创建所有票号的数组，排除已抽过的票号
    const allTickets = [];
    Object.entries(accountList).forEach(([username, tickets]) => {
      tickets.forEach(ticket => {
        // 只添加未被抽过的票号
        if (!usedTickets.has(ticket)) {
          allTickets.push({ username, ticket });
        }
      });
    });

    // 检查是否还有可抽奖的票号
    if (allTickets.length === 0) {
      alert('No more tickets available for drawing!');
      setIsDrawing(false);
      return;
    }

    // 随机选择一个票号
    const randomIndex = Math.floor(Math.random() * allTickets.length);
    const winningTicket = allTickets[randomIndex];

    // 提取票号中的数字部分
    const match = winningTicket.ticket.match(/[1-9]\d*/);
    const winningNumber = match ? match[0] : winningTicket.ticket;

    // 开始老虎机动画
    slotMachineRef.current?.spin(
      winningNumber.padStart(digitCount, '0').split('')
    );

    const currentWinner = {
      winner: winningTicket.username,
      ticket: winningTicket.ticket,
      prize: prize,
    };

    setWinnerResult(currentWinner);
  }, [accountList, prize, digitCount, usedTickets]);

  // 处理抽奖完成
  const handleDrawComplete = useCallback(() => {
    setIsDrawing(false);
    setShowWinnerModal(true);
  }, []);

  // 处理确认获奖者（弹窗关闭时调用）
  const handleConfirmWinner = useCallback(() => {
    if (winnerResult) {
      // 添加到获奖者列表
      setWinners(prev => [
        ...prev,
        {
          id: Date.now(),
          username: winnerResult.winner,
          prize: winnerResult.prize,
          ticket: winnerResult.ticket,
          timestamp: new Date().toLocaleString(),
        },
      ]);

      // 将中奖票号添加到已使用票号集合中
      setUsedTickets(prev => new Set([...prev, winnerResult.ticket]));
    }
  }, [winnerResult]);

  // 转换为参与者数组，计算剩余票数
  const participants = React.useMemo(() => {
    return Object.entries(accountList).map(([username, tickets]) => {
      const remainingTickets = tickets.filter(
        ticket => !usedTickets.has(ticket)
      );
      return {
        username,
        tickets,
        remainingTickets,
        totalTickets: tickets.length,
        remainingCount: remainingTickets.length,
      };
    });
  }, [accountList, usedTickets]);

  // 计算总的可用票数
  const totalAvailableTickets = React.useMemo(() => {
    return participants.reduce(
      (sum, participant) => sum + participant.remainingCount,
      0
    );
  }, [participants]);

  return (
    <div className="min-h-screen relative bg-gray-900">
      {/* 背景图片 - 居中缩小 */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-90"
        style={{
          backgroundImage: `url("${process.env.PUBLIC_URL}/naseebet/background.jpeg")`,
        }}
      ></div>
      {/* 背景动画效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-emerald-800/20 to-green-900/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]"></div>

      <div className="min-h-screen bg-black/40 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* 网络状态指示器 */}
          <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-green-400" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-400" />
            )}
            <span
              className={`text-sm ${
                isOnline ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={`${process.env.PUBLIC_URL}/naseebet/logo.jpeg`}
              alt="Naseebet Logo"
              className="mx-auto h-60 w-auto rounded-xl mb-6"
            />
          </div>

          {/* 加载状态 */}
          {isLoading && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-green-400">
                <Cloud className="w-5 h-5 animate-spin" />
                <span>Loading data...</span>
              </div>
            </div>
          )}

          {/* 主要内容区域 - 左右分栏布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：抽奖区域 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 老虎机 */}
              <Card className="bg-black/80 backdrop-blur-md border-2 border-green-400/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-green-400 font-bold text-2xl drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                      LUCKY NUMBERS
                    </span>
                  </div>
                  <SlotMachine
                    ref={slotMachineRef}
                    onComplete={handleDrawComplete}
                    digitCount={digitCount}
                    theme={theme}
                  />
                  <Button
                    onClick={handleDraw}
                    disabled={
                      isDrawing ||
                      !prize.trim() ||
                      Object.keys(accountList).length === 0 ||
                      totalAvailableTickets === 0
                    }
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500
                             text-white font-bold py-4 px-6 rounded-full text-lg border-2 border-green-400/70
                             shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.6)]
                             transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                  translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                    ></div>
                    <div className="relative flex items-center justify-center gap-2">
                      {isDrawing ? 'Drawing...' : '🎲 Start Draw'}
                    </div>
                  </Button>
                </CardContent>
              </Card>

              {/* 获奖者列表 */}
              <WinnersList winners={winners} theme={theme} />

              {/* 奖品输入 */}
              <Card className="bg-black/80 backdrop-blur-md border-2 border-green-400/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <label className="text-green-400 font-bold text-lg">
                      Set Prize Name:
                    </label>
                  </div>
                  <Input
                    type="text"
                    value={prize}
                    onChange={e => setPrize(e.target.value)}
                    placeholder="Enter prize name"
                    className="w-full mb-4 bg-black/70 border-green-400/70 text-white placeholder:text-green-400/70 
                             focus:border-green-400 focus:ring-2 focus:ring-green-400/30"
                  />
                </CardContent>
              </Card>
            </div>

            {/* 右侧：参与者列表 */}
            <div className="lg:col-span-1">
              <ParticipantsList
                participants={participants}
                theme={theme}
                totalAvailableTickets={totalAvailableTickets}
                usedTickets={usedTickets}
              />
            </div>
          </div>

          {/* 连接状态 */}
          {connectionStatus && (
            <div
              className={`text-center my-6 p-4 rounded-lg border ${
                connectionStatus.success
                  ? 'bg-green-600/20 border-green-400/50 text-green-400'
                  : 'bg-red-600/20 border-red-400/50 text-red-400'
              }`}
            >
              {connectionStatus.message}
            </div>
          )}

          {/* 设置模态框 - 只有管理员才能看到 */}
          {hasAdminQuery() && (
            <SettingsModal
              onRefreshData={loadGoogleSheetsData}
              onSheetUrlChange={setSheetUrl}
              currentSheetUrl={sheetUrl}
              isLoading={isLoading}
              connectionStatus={connectionStatus}
            />
          )}

          {/* 中奖模态框 */}
          <WinnerModal
            isOpen={showWinnerModal}
            onClose={() => setShowWinnerModal(false)}
            onConfirm={handleConfirmWinner}
            winner={winnerResult?.winner}
            prize={winnerResult?.prize}
            theme={theme}
            themeName="green"
          />
        </div>
      </div>
    </div>
  );
};

export default Naseebet;
