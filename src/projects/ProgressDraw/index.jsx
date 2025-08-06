import { useState, useCallback, useMemo, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Settings,
  Search,
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
import { motion } from 'framer-motion';
import useFavicon from '../../hooks/index';
import { CONFIG, verifyPassword, hasAdminQuery } from './config';
import { googleSheetsAPI, GOOGLE_SHEETS_CONFIG } from './googleSheets';

const DEFAULT_MILESTONES = [
  { threshold: 200, prize: '🎮 Gaming Headset', achieved: false },
  { threshold: 500, prize: '💰 $5,000 Cash Prize', achieved: false },
  { threshold: 1000, prize: '🏆 Premium Gaming Setup', achieved: false },
  { threshold: 2000, prize: '💎 $50,000 JACKPOT', achieved: false },
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
  onRefreshData,
  onSheetUrlChange,
  currentSheetUrl,
}) => {
  const [open, setOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(
    currentSheetUrl || GOOGLE_SHEETS_CONFIG.SHEET_URL
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleTestConnection = useCallback(async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      const result = await googleSheetsAPI.testConnection(sheetUrl);
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        error: error.message,
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [sheetUrl]);

  const handleSheetUrlSubmit = useCallback(() => {
    onSheetUrlChange(sheetUrl);
    setConnectionStatus(null);
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
            {/* Google Sheets Configuration */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-cyan-400/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-cyan-400" />
                <NeonText className="text-xl">
                  Google Sheets Data Source
                </NeonText>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Google Sheets URL
                  </label>
                  <Input
                    type="url"
                    value={sheetUrl}
                    onChange={e => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-black/50 border-cyan-400/50 text-cyan-400 placeholder:text-cyan-400/50"
                  />
                </div>

                <div className="flex gap-3">
                  <GamingButton
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="flex-1"
                  >
                    {isTestingConnection ? 'Testing...' : '🔗 Test Connection'}
                  </GamingButton>
                  <GamingButton
                    onClick={handleSheetUrlSubmit}
                    className="flex-1"
                  >
                    ✅ Save Configuration
                  </GamingButton>
                </div>

                <GamingButton onClick={onRefreshData} className="w-full">
                  🔄 Refresh Data
                </GamingButton>

                {connectionStatus && (
                  <div
                    className={`p-4 rounded-lg border ${
                      connectionStatus.success
                        ? 'bg-green-600/20 border-green-400/50 text-green-400'
                        : 'bg-red-600/20 border-red-400/50 text-red-400'
                    }`}
                  >
                    {connectionStatus.success ? (
                      <div>
                        <p className="font-bold">✅ Connection Successful!</p>
                        <p>Player Count: {connectionStatus.userCount}</p>
                        <p>Total Tickets: {connectionStatus.totalTickets}</p>
                        <p>
                          Milestone Count: {connectionStatus.milestoneCount}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold">❌ Connection Failed</p>
                        <p>{connectionStatus.error}</p>
                      </div>
                    )}
                  </div>
                )}
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

const ProgressBar = ({ current, milestones, totalTickets }) => {
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <NeonText className="text-2xl">
                Total Players: {current.toLocaleString()}
              </NeonText>
            </div>
            <div className="flex items-center gap-3">
              <NeonText color="purple" className="text-xl">
                Total Tickets: {totalTickets.toLocaleString()}
              </NeonText>
            </div>
          </div>
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
                    {milestone.threshold.toLocaleString()} players
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
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const filteredParticipants = useMemo(() => {
    const flattenedParticipants = Object.entries(participants).map(
      ([username, tickets]) => ({
        username,
        ticketCount: tickets.length,
        tickets: tickets.join(', '),
        allTickets: tickets,
      })
    );

    if (!searchTerm) return flattenedParticipants;

    return flattenedParticipants.filter(participant =>
      participant.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [participants, searchTerm]);

  const handleShowTickets = useCallback(participant => {
    setSelectedParticipant(participant);
    setShowTicketModal(true);
  }, []);

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
          <div className="text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="truncate flex-1">
                {participant.allTickets.slice(0, 3).join(', ')}
                {participant.ticketCount > 3 && '...'}
              </span>
              <Button
                onClick={() => handleShowTickets(participant)}
                className="px-3 py-1 text-xs bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/50 text-cyan-400 rounded transition-all duration-200 hover:scale-105"
              >
                Detail
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
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
                itemSize={70}
                width={width}
                overscanCount={5}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>

      {/* Ticket Modal */}
      <AlertDialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <AlertDialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-2 border-cyan-400/50">
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="text-center">
              <NeonText className="text-xl sm:text-2xl mb-2">
                🎫 All Tickets
              </NeonText>
              <p className="text-gray-300 text-sm sm:text-base">
                {selectedParticipant &&
                  maskUsername(selectedParticipant.username)}
              </p>
            </div>

            {selectedParticipant && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-black/30 rounded-lg border border-cyan-400/30 gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <span className="text-cyan-400 font-bold text-sm sm:text-base">
                      Total Tickets:
                    </span>
                  </div>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold text-lg sm:text-xl">
                    {selectedParticipant.ticketCount}
                  </span>
                </div>

                <div className="bg-black/30 rounded-lg border border-cyan-400/30 p-3 sm:p-4">
                  <div className="text-cyan-400 font-bold mb-2 sm:mb-3 text-sm sm:text-base">
                    Ticket Numbers:
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {selectedParticipant.allTickets.map((ticket, index) => (
                        <motion.div
                          key={index}
                          className="bg-cyan-600/20 border border-cyan-400/50 rounded p-1 sm:p-2 text-center text-cyan-400 font-mono text-xs sm:text-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {ticket}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <GamingButton
              onClick={() => setShowTicketModal(false)}
              className="w-full h-10 sm:h-12 text-sm sm:text-base"
            >
              ✅ Close
            </GamingButton>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const ProgressDraw = () => {
  useFavicon();

  // State management
  const [accountList, setAccountList] = useState({});
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [sheetUrl, setSheetUrl] = useState(GOOGLE_SHEETS_CONFIG.SHEET_URL);

  // Permission control - check query parameters and login status
  const hasAdminAccess = hasAdminQuery();
  const [isAdmin, setIsAdmin] = useState(() => {
    return (
      hasAdminAccess && localStorage.getItem('progressDraw_isAdmin') === 'true'
    );
  });
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Data loading function
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load all data from Google Sheets (user data and milestone data)
      const { accountList: accountData, milestones: milestoneData } =
        await googleSheetsAPI.fetchAllData(sheetUrl);

      setAccountList(accountData);
      setMilestones(milestoneData);
      setLastSync(new Date().toISOString());

      // Cache to local storage
      localStorage.setItem(
        'progressDraw_accountList',
        JSON.stringify(accountData)
      );
      localStorage.setItem(
        'progressDraw_milestones',
        JSON.stringify(milestoneData)
      );
      localStorage.setItem('progressDraw_lastSync', new Date().toISOString());
    } catch (error) {
      console.error('Google Sheets data loading failed:', error);
      // Fallback to local storage
      try {
        const savedAccounts = localStorage.getItem('progressDraw_accountList');
        const savedMilestones = localStorage.getItem('progressDraw_milestones');
        const savedLastSync = localStorage.getItem('progressDraw_lastSync');

        setAccountList(savedAccounts ? JSON.parse(savedAccounts) : {});
        setMilestones(
          savedMilestones ? JSON.parse(savedMilestones) : DEFAULT_MILESTONES
        );
        setLastSync(savedLastSync);
      } catch (localError) {
        console.error('Local data loading also failed:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [sheetUrl]);

  // Online status monitoring
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

  // Initialize data loading
  useEffect(() => {
    // Load saved Sheet URL from local storage
    const savedSheetUrl = localStorage.getItem('progressDraw_sheetUrl');
    if (savedSheetUrl) {
      setSheetUrl(savedSheetUrl);
    }

    loadData();
  }, []);

  // Auto refresh data
  useEffect(() => {
    if (GOOGLE_SHEETS_CONFIG.AUTO_REFRESH) {
      const interval = setInterval(() => {
        loadData();
      }, GOOGLE_SHEETS_CONFIG.REFRESH_INTERVAL * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [loadData]);

  // Auto logout timer
  useEffect(() => {
    if (isAdmin && CONFIG.SECURITY.AUTO_LOGOUT_MINUTES > 0) {
      const timer = setTimeout(() => {
        handleLogout();
        alert('Session expired, please login again');
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

  const totalPlayers = useMemo(() => {
    return Object.keys(accountList).length;
  }, [accountList]);

  const handleSheetUrlChange = useCallback(newSheetUrl => {
    setSheetUrl(newSheetUrl);
    localStorage.setItem('progressDraw_sheetUrl', newSheetUrl);
  }, []);

  const handleRefreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  const handlePasswordSubmit = useCallback(() => {
    if (loginAttempts >= CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS) {
      alert('Too many login attempts, please try again later');
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
        `Wrong password! You can try ${
          CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS - loginAttempts - 1
        } more times`
      );
      setPasswordInput('');
    }
  }, [passwordInput, loginAttempts]);

  const handleLogout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem('progressDraw_isAdmin');
  }, []);

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

      {/* Online status indicator */}
      <motion.div
        className="fixed top-4 right-4 z-[20] flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-cyan-400/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Online</span>
            {lastSync && (
              <span className="text-gray-400 text-xs">
                Last sync: {new Date(lastSync).toLocaleTimeString()}
              </span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Offline</span>
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

      {/* Admin permission control - only show when admin query parameter is present */}
      {hasAdminAccess && (
        <>
          {isAdmin ? (
            <SettingsModal
              onRefreshData={handleRefreshData}
              onSheetUrlChange={handleSheetUrlChange}
              currentSheetUrl={sheetUrl}
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

      {/* Admin logout button */}
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
              Logout Admin
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
              {isLoading ? 'Syncing...' : 'Sync Data'}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Password input dialog */}
      <AlertDialog open={showPasswordInput} onOpenChange={setShowPasswordInput}>
        <AlertDialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-2 border-cyan-400/50">
          <div className="space-y-6 p-6">
            <div className="text-center">
              <NeonText className="text-2xl mb-2">
                🔐 Admin Verification
              </NeonText>
              <p className="text-gray-300">
                Please enter admin password to access settings
              </p>
            </div>

            <Input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handlePasswordSubmit()}
              className="bg-black/50 border-cyan-400/50 text-cyan-400 placeholder:text-cyan-400/50
                       focus:border-cyan-400 focus:ring-cyan-400/50"
            />

            <div className="flex gap-3">
              <GamingButton onClick={handlePasswordSubmit} className="flex-1">
                🔓 Verify
              </GamingButton>
              <Button
                onClick={() => {
                  setShowPasswordInput(false);
                  setPasswordInput('');
                }}
                className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 border-gray-400/50"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center text-sm text-gray-400 space-y-2">
              <p className="text-xs">
                🔒 Remaining attempts:{' '}
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
          <div className="text-center">
            <img
              src={`${process.env.PUBLIC_URL}/progress/logo.jpeg`}
              alt="Naseebet Logo"
              className="mx-auto h-50 w-auto rounded-xl"
            />
          </div>
          <motion.p
            className="text-2xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            More Tickets = Higher Ranking = Bigger Prizes !
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <ProgressBar
            current={totalPlayers}
            totalTickets={totalTickets}
            milestones={milestones}
          />
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
