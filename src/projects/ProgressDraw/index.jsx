import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Settings,
  Search,
  Trophy,
  Users,
  Target,
  Zap,
  Star,
  Cloud,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
} from '../../components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import useFavicon from '../../hooks/index';
import { CONFIG, verifyPassword, hasAdminQuery, githubAPI } from './config';

const DEFAULT_MILESTONES = [
  { threshold: 2000, prize: '🎮 Gaming Headset', achieved: false },
  { threshold: 5000, prize: '💰 $5,000 Cash Prize', achieved: false },
  { threshold: 10000, prize: '🏆 Premium Gaming Setup', achieved: false },
  { threshold: 20000, prize: '💎 $50,000 JACKPOT', achieved: false },
];

const maskUsername = username => {
  if (!username || username.length <= 3) return username;
  return `${username.slice(0, 2)}${'*'.repeat(
    username.length - 3
  )}${username.slice(-1)}`;
};

const GamingButton = ({ children, className = '', ...props }) => (
  <Button
    className={`
      relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500
      hover:from-purple-500 hover:via-blue-500 hover:to-cyan-400
      text-white font-bold border-2 border-cyan-400/50
      shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]
      transition-all duration-300 transform hover:scale-105
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
      ${className}
    `}
    {...props}
  >
    {children}
  </Button>
);

const NeonText = ({ children, className = '', color = 'cyan' }) => {
  const colorMap = {
    cyan: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]',
    purple: 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]',
    pink: 'text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]',
    green: 'text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]',
  };

  return (
    <span className={`${colorMap[color]} font-bold ${className}`}>
      {children}
    </span>
  );
};

const SettingsModal = ({
  onFileUpload,
  onMilestonesChange,
  currentMilestones,
}) => {
  const [open, setOpen] = useState(false);
  const [milestones, setMilestones] = useState(
    currentMilestones || DEFAULT_MILESTONES
  );
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // 当外部milestones更新时，同步内部状态
  React.useEffect(() => {
    if (currentMilestones) {
      setMilestones(currentMilestones);
    }
  }, [currentMilestones]);

  const handleFileChange = useCallback(
    event => {
      const file = event.target.files[0];
      if (file) {
        setIsProcessing(true);
        setProgress(0);

        const reader = new FileReader();
        reader.onprogress = e => {
          if (e.lengthComputable) {
            setProgress((e.loaded / e.total) * 100);
          }
        };

        reader.onload = e => {
          const content = e.target.result;
          const lines = content
            .split('\n')
            .slice(1)
            .filter(line => line.trim() !== '');

          const accountList = lines.reduce((acc, line) => {
            const [username, ticket] = line.trim().split(',');
            if (username && ticket) {
              if (!acc[username]) {
                acc[username] = [];
              }
              acc[username].push(ticket);
            }
            return acc;
          }, {});

          onFileUpload(accountList);
          setIsProcessing(false);
        };

        reader.readAsText(file);
      }
    },
    [onFileUpload]
  );

  const handleMilestoneChange = useCallback(
    (index, field, value) => {
      setMilestones(prev => {
        const newMilestones = [...prev];
        newMilestones[index] = { ...newMilestones[index], [field]: value };
        onMilestonesChange(newMilestones);
        return newMilestones;
      });
    },
    [onMilestonesChange]
  );

  const addMilestone = useCallback(() => {
    const newMilestone = {
      threshold: 0,
      prize: '🎁 New Prize',
      achieved: false,
    };
    setMilestones(prev => {
      const newMilestones = [...prev, newMilestone];
      onMilestonesChange(newMilestones);
      return newMilestones;
    });
  }, [onMilestonesChange]);

  const removeMilestone = useCallback(
    index => {
      setMilestones(prev => {
        const newMilestones = prev.filter((_, i) => i !== index);
        onMilestonesChange(newMilestones);
        return newMilestones;
      });
    },
    [onMilestonesChange]
  );

  return (
    <>
      <motion.div
        className="fixed bottom-4 left-4 z-[20]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 
                   hover:from-purple-500 hover:to-blue-500 border-2 border-cyan-400/50
                   shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]
                   transition-all duration-300"
        >
          <Settings className="w-7 h-7 text-white" />
        </Button>
      </motion.div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-4xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-2 border-cyan-400/50">
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-cyan-400/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-cyan-400" />
                <NeonText className="text-xl">
                  Upload Participants List
                </NeonText>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <GamingButton
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing
                  ? `Processing ${progress.toFixed(1)}%`
                  : '🎮 Select CSV File'}
              </GamingButton>
              {isProcessing && (
                <div className="w-full bg-black/50 rounded-full h-3 mt-3 border border-cyan-400/30">
                  <motion.div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>

            {/* Milestones Settings */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-400/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-purple-400" />
                <NeonText color="purple" className="text-xl">
                  Milestone Settings
                </NeonText>
              </div>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-4 bg-black/40 p-4 rounded-lg border border-purple-400/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Input
                      type="number"
                      value={milestone.threshold}
                      onChange={e =>
                        handleMilestoneChange(
                          index,
                          'threshold',
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Threshold"
                      className="w-32 bg-black/50 border-cyan-400/50 text-cyan-400 placeholder:text-cyan-400/50"
                    />
                    <Input
                      type="text"
                      value={milestone.prize}
                      onChange={e =>
                        handleMilestoneChange(index, 'prize', e.target.value)
                      }
                      placeholder="Prize description"
                      className="flex-1 bg-black/50 border-purple-400/50 text-purple-400 placeholder:text-purple-400/50"
                    />
                    <Button
                      onClick={() => removeMilestone(index)}
                      className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-400/50"
                    >
                      Remove
                    </Button>
                  </motion.div>
                ))}
                <GamingButton onClick={addMilestone} className="w-full">
                  ➕ Add Milestone
                </GamingButton>
              </div>
            </div>

            <GamingButton
              onClick={() => setOpen(false)}
              className="w-full h-12"
            >
              ✅ Confirm Settings
            </GamingButton>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const ProgressBar = ({ current, milestones }) => {
  const maxThreshold = Math.max(...milestones.map(m => m.threshold));
  const progressPercentage = Math.min((current / maxThreshold) * 100, 100);

  return (
    <div
      className="bg-black/40 backdrop-blur-sm rounded-2xl border-2 border-cyan-400/30 p-8 
                    shadow-[0_0_30px_rgba(59,130,246,0.2)]"
    >
      <div className="flex items-center gap-4 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Target className="w-10 h-10 text-cyan-400" />
        </motion.div>
        <NeonText className="text-4xl">PROGRESS TRACKER</NeonText>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-8 h-8 text-yellow-400" />
        </motion.div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <NeonText className="text-2xl">
            Total Tickets: {current.toLocaleString()}
          </NeonText>
          <NeonText color="green" className="text-2xl">
            {progressPercentage.toFixed(1)}%
          </NeonText>
        </div>
        <div className="w-full bg-black/60 rounded-full h-6 border-2 border-cyan-400/30 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                          animate-pulse"
            />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {milestones.map((milestone, index) => {
          const achieved = current >= milestone.threshold;
          return (
            <motion.div
              key={index}
              className={`p-6 rounded-xl border-2 transition-all duration-500 ${
                achieved
                  ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                  : 'bg-black/30 border-cyan-400/30 hover:border-cyan-400/50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-lg text-white mb-1">
                    {milestone.prize}
                  </p>
                  <p className="text-cyan-400">
                    {milestone.threshold.toLocaleString()} tickets
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    achieved
                      ? 'bg-green-500 border-green-400'
                      : 'bg-black/50 border-cyan-400/50'
                  }`}
                >
                  {achieved ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Star className="w-4 h-4 text-white" />
                    </motion.div>
                  ) : (
                    <div className="w-3 h-3 bg-cyan-400/50 rounded-full" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ParticipantsList = ({ participants, searchTerm }) => {
  const ROW_HEIGHT = 70;

  const filteredParticipants = useMemo(() => {
    const flattenedParticipants = Object.entries(participants).map(
      ([username, tickets]) => ({
        username,
        ticketCount: tickets.length,
        tickets: tickets.join(', '),
      })
    );

    if (!searchTerm) return flattenedParticipants;

    return flattenedParticipants.filter(participant =>
      participant.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [participants, searchTerm]);

  const Row = ({ index, style }) => {
    const participant = filteredParticipants[index];
    const isEven = index % 2 === 0;

    return (
      <motion.div
        style={style}
        className={`flex items-center px-6 py-4 border-b border-cyan-400/20 ${
          isEven ? 'bg-black/20' : 'bg-black/40'
        } hover:bg-purple-600/20 transition-colors duration-200`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
      >
        <div className="flex-1 grid grid-cols-3 gap-6">
          <div className="font-bold text-cyan-400">
            {maskUsername(participant.username)}
          </div>
          <div className="text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold text-lg">
              {participant.ticketCount}
            </span>
          </div>
          <div className="text-sm text-gray-300 truncate">
            {participant.tickets}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="bg-black/40 backdrop-blur-sm rounded-2xl border-2 border-purple-400/30 p-6 flex-1
                    shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-purple-400" />
        <NeonText color="purple" className="text-3xl">
          PARTICIPANTS
        </NeonText>
        <div className="ml-auto">
          <NeonText color="cyan" className="text-xl">
            {filteredParticipants.length} players
          </NeonText>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-4 p-4 bg-black/50 rounded-lg border border-cyan-400/30">
        <NeonText className="font-bold">Username</NeonText>
        <NeonText className="font-bold text-center">Tickets</NeonText>
        <NeonText className="font-bold">Numbers</NeonText>
      </div>

      <div
        className="flex-1 border-2 border-cyan-400/30 rounded-lg overflow-hidden"
        style={{ height: '500px' }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={filteredParticipants.length}
              itemSize={ROW_HEIGHT}
              width={width}
              overscanCount={5}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

const ProgressDraw = () => {
  useFavicon();

  // 状态管理
  const [accountList, setAccountList] = useState({});
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [githubSha, setGithubSha] = useState(null);

  // 权限控制 - 检查query参数和登录状态
  const hasAdminAccess = hasAdminQuery();
  const [isAdmin, setIsAdmin] = useState(() => {
    return (
      hasAdminAccess && localStorage.getItem('progressDraw_isAdmin') === 'true'
    );
  });
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // 在线状态监测
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

  // 初始化数据加载
  useEffect(() => {
    loadData();
  }, []);

  // 自动登出定时器
  useEffect(() => {
    if (isAdmin && CONFIG.SECURITY.AUTO_LOGOUT_MINUTES > 0) {
      const timer = setTimeout(() => {
        handleLogout();
        alert('会话已过期，请重新登录');
      }, CONFIG.SECURITY.AUTO_LOGOUT_MINUTES * 60 * 1000);

      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  const totalTickets = useMemo(() => {
    return Object.values(accountList).reduce(
      (sum, tickets) => sum + tickets.length,
      0
    );
  }, [accountList]);

  // 数据加载函数
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isOnline && CONFIG.GITHUB.TOKEN) {
        // 尝试从GitHub加载
        const result = await githubAPI.getData();
        if (result.success) {
          setAccountList(result.data.accountList || {});
          setMilestones(result.data.milestones || DEFAULT_MILESTONES);
          setGithubSha(result.sha);
          setLastSync(new Date().toISOString());

          // 同步到localStorage作为备份
          localStorage.setItem(
            'progressDraw_accountList',
            JSON.stringify(result.data.accountList || {})
          );
          localStorage.setItem(
            'progressDraw_milestones',
            JSON.stringify(result.data.milestones || DEFAULT_MILESTONES)
          );
        } else {
          throw new Error(result.error);
        }
      } else {
        // 离线模式：从localStorage加载
        const savedAccounts = localStorage.getItem('progressDraw_accountList');
        const savedMilestones = localStorage.getItem('progressDraw_milestones');

        setAccountList(savedAccounts ? JSON.parse(savedAccounts) : {});
        setMilestones(
          savedMilestones ? JSON.parse(savedMilestones) : DEFAULT_MILESTONES
        );
      }
    } catch (error) {
      console.error('数据加载失败:', error);
      // Fallback到localStorage
      try {
        const savedAccounts = localStorage.getItem('progressDraw_accountList');
        const savedMilestones = localStorage.getItem('progressDraw_milestones');

        setAccountList(savedAccounts ? JSON.parse(savedAccounts) : {});
        setMilestones(
          savedMilestones ? JSON.parse(savedMilestones) : DEFAULT_MILESTONES
        );
      } catch (localError) {
        console.error('本地数据加载也失败:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  // 数据保存函数
  const saveData = useCallback(
    async (newAccountList, newMilestones) => {
      const data = {
        accountList: newAccountList,
        milestones: newMilestones,
        lastUpdate: new Date().toISOString(),
      };

      try {
        if (isOnline && CONFIG.GITHUB.TOKEN && isAdmin) {
          // 保存到GitHub
          const result = await githubAPI.saveData(data, githubSha);
          if (result.success) {
            setGithubSha(result.sha);
            setLastSync(new Date().toISOString());
            console.log('数据已保存到GitHub');
          } else {
            throw new Error(result.error);
          }
        }

        // 总是保存到localStorage作为备份
        localStorage.setItem(
          'progressDraw_accountList',
          JSON.stringify(newAccountList)
        );
        localStorage.setItem(
          'progressDraw_milestones',
          JSON.stringify(newMilestones)
        );
      } catch (error) {
        console.error('数据保存失败:', error);
        // 至少保存到localStorage
        localStorage.setItem(
          'progressDraw_accountList',
          JSON.stringify(newAccountList)
        );
        localStorage.setItem(
          'progressDraw_milestones',
          JSON.stringify(newMilestones)
        );
        alert('在线保存失败，数据已保存到本地');
      }
    },
    [isOnline, githubSha, isAdmin]
  );

  const handleFileUpload = useCallback(
    async accounts => {
      setAccountList(accounts);
      await saveData(accounts, milestones);
    },
    [milestones, saveData]
  );

  const handleMilestonesChange = useCallback(
    async newMilestones => {
      setMilestones(newMilestones);
      await saveData(accountList, newMilestones);
    },
    [accountList, saveData]
  );

  const handlePasswordSubmit = useCallback(() => {
    if (loginAttempts >= CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS) {
      alert('登录尝试次数过多，请稍后再试');
      return;
    }

    if (verifyPassword(passwordInput)) {
      setIsAdmin(true);
      localStorage.setItem('progressDraw_isAdmin', 'true');
      setShowPasswordInput(false);
      setPasswordInput('');
      setLoginAttempts(0);
    } else {
      setLoginAttempts(prev => prev + 1);
      alert(
        `密码错误！还可以尝试 ${
          CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS - loginAttempts - 1
        } 次`
      );
      setPasswordInput('');
    }
  }, [passwordInput, loginAttempts]);

  const handleLogout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem('progressDraw_isAdmin');
  }, []);

  const handleClearData = useCallback(async () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可撤销！')) {
      const emptyData = {};
      const defaultMilestones = DEFAULT_MILESTONES;

      setAccountList(emptyData);
      setMilestones(defaultMilestones);

      await saveData(emptyData, defaultMilestones);
      alert('数据已清除！');
    }
  }, [saveData]);

  const handleRefreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
                    relative overflow-hidden"
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute top-0 left-0 w-full h-full 
                        bg-[radial-gradient(circle_at_20%_50%,_rgba(59,130,246,0.3)_0%,_transparent_50%)]"
        />
        <div
          className="absolute top-0 right-0 w-full h-full 
                        bg-[radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.3)_0%,_transparent_50%)]"
        />
        <div
          className="absolute bottom-0 left-0 w-full h-full 
                        bg-[radial-gradient(circle_at_40%_80%,_rgba(34,211,238,0.3)_0%,_transparent_50%)]"
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)
               `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* 在线状态指示器 */}
      <motion.div
        className="fixed top-4 right-4 z-[20] flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-cyan-400/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">在线</span>
            {lastSync && (
              <span className="text-gray-400 text-xs">
                最后同步: {new Date(lastSync).toLocaleTimeString()}
              </span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">离线</span>
          </>
        )}
        {isLoading && (
          <motion.div
            className="w-3 h-3 bg-cyan-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* 管理员权限控制 - 只有在有admin query参数时才显示 */}
      {hasAdminAccess && (
        <>
          {isAdmin ? (
            <SettingsModal
              onFileUpload={handleFileUpload}
              onMilestonesChange={handleMilestonesChange}
              currentMilestones={milestones}
            />
          ) : (
            <motion.div
              className="fixed bottom-4 left-4 z-[20]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => setShowPasswordInput(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 
                         hover:from-gray-500 hover:to-gray-600 border-2 border-gray-400/50
                         shadow-[0_0_20px_rgba(75,85,99,0.4)] hover:shadow-[0_0_30px_rgba(75,85,99,0.6)]
                         transition-all duration-300"
              >
                <Settings className="w-7 h-7 text-white" />
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* 管理员登出按钮 */}
      {hasAdminAccess && isAdmin && (
        <div className="fixed bottom-4 left-20 z-[20] flex gap-3">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 
                       hover:from-red-500 hover:to-red-600 border-2 border-red-400/50
                       shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]
                       transition-all duration-300 text-white font-bold"
            >
              退出管理
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              onClick={handleRefreshData}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 
                       hover:from-blue-500 hover:to-blue-600 border-2 border-blue-400/50
                       shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]
                       transition-all duration-300 text-white font-bold"
              disabled={isLoading}
            >
              <Cloud className="w-4 h-4 mr-1" />
              {isLoading ? '同步中...' : '同步数据'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              onClick={handleClearData}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 
                       hover:from-orange-500 hover:to-orange-600 border-2 border-orange-400/50
                       shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]
                       transition-all duration-300 text-white font-bold"
            >
              🗑️ 清除数据
            </Button>
          </motion.div>
        </div>
      )}

      {/* 密码输入对话框 */}
      <AlertDialog open={showPasswordInput} onOpenChange={setShowPasswordInput}>
        <AlertDialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-2 border-cyan-400/50">
          <div className="space-y-6 p-6">
            <div className="text-center">
              <NeonText className="text-2xl mb-2">🔐 管理员验证</NeonText>
              <p className="text-gray-300">请输入管理员密码以访问设置功能</p>
            </div>

            <Input
              type="password"
              placeholder="输入密码..."
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handlePasswordSubmit()}
              className="bg-black/50 border-cyan-400/50 text-cyan-400 placeholder:text-cyan-400/50
                       focus:border-cyan-400 focus:ring-cyan-400/50"
            />

            <div className="flex gap-3">
              <GamingButton onClick={handlePasswordSubmit} className="flex-1">
                🔓 验证
              </GamingButton>
              <Button
                onClick={() => {
                  setShowPasswordInput(false);
                  setPasswordInput('');
                }}
                className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 border-gray-400/50"
              >
                取消
              </Button>
            </div>

            <div className="text-center text-sm text-gray-400 space-y-2">
              {/* <p>💡 可用密码：</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CONFIG.ADMIN_PASSWORDS.map((password, index) => (
                  <span
                    key={index}
                    className="bg-gray-800/50 px-2 py-1 rounded text-xs font-mono"
                  >
                    {password}
                  </span>
                ))}
              </div> */}
              {/* <p className="text-xs">
                💡 要修改密码，请编辑{' '}
                <code className="bg-gray-800/50 px-1 rounded">
                  src/projects/ProgressDraw/config.js
                </code>
              </p> */}
              <p className="text-xs">
                🔒 剩余尝试次数:{' '}
                {CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS - loginAttempts}
              </p>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto p-6 space-y-8 relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="inline-block mb-6"
            animate={{
              textShadow: [
                '0 0 20px rgba(59,130,246,0.5)',
                '0 0 30px rgba(168,85,247,0.5)',
                '0 0 20px rgba(34,211,238,0.5)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1
              className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 
                         bg-clip-text text-transparent mb-4"
            >
              🎮 PROGRESS LOTTERY
            </h1>
          </motion.div>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Level up your lottery experience! Track your progress and unlock
            amazing gaming prizes! 🚀
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <ProgressBar current={totalTickets} milestones={milestones} />
        </motion.div>

        <div className="flex flex-col xl:flex-row gap-8">
          <motion.div
            className="xl:w-1/3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div
              className="bg-black/40 backdrop-blur-sm rounded-2xl border-2 border-green-400/30 p-6
                          shadow-[0_0_30px_rgba(34,197,94,0.2)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-6 h-6 text-green-400" />
                <NeonText color="green" className="text-2xl">
                  SEARCH PLAYER
                </NeonText>
              </div>
              <Input
                type="text"
                placeholder="🔍 Enter username to search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-black/50 border-green-400/50 text-green-400 placeholder:text-green-400/50
                         focus:border-green-400 focus:ring-green-400/50"
              />
            </div>
          </motion.div>

          <motion.div
            className="xl:w-2/3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <ParticipantsList
              participants={accountList}
              searchTerm={searchTerm}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDraw;
