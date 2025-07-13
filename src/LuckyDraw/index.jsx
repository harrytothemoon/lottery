// App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import useSound from 'use-sound';
import Confetti from 'react-confetti';
import { useTheme } from '../themes';
import spinSound from '../sounds/spin.wav';
import winSound from '../sounds/win.mp3';
import winSoundChristmas from '../sounds/christmas-win.mp3';
import ChristmasEffects from '../components/christmasEffects';

const maskUsername = username => {
  if (!username || username.length <= 3) return username;
  return `${username.slice(0, 2)}${'*'.repeat(
    username.length - 3
  )}${username.slice(-1)}`;
};

const Modal = ({ isOpen, onClose, children, theme, themeName }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      {showConfetti && <Confetti gravity={0.4} initialVelocityY={100} />}
      <Card
        themeName={themeName}
        className={`w-[90%] max-w-[500px] shadow-2xl rounded-3xl border-4 ${theme.card.background} ${theme.card.border}`}
      >
        <CardContent className="p-6" themeName={themeName}>
          {children}
          <Button
            onClick={onClose}
            themeName={themeName}
            className={`mt-6 w-full hover:opacity-90 font-bold py-2 px-4 rounded-full text-lg ${theme.button.primary}`}
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

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
      className={`reel overflow-hidden h-24 w-16 border-2 flex items-center justify-center text-5xl font-bold ${theme.card.background} ${theme.border} ${theme.accent}`}
    >
      {symbols[position]}
    </div>
  );
};

const SlotMachine = React.forwardRef(
  ({ onComplete, digitCount, theme }, ref) => {
    const [spinning, setSpinning] = useState(false);
    const [stopSymbols, setStopSymbols] = useState(
      Array(digitCount).fill(null)
    );
    const [revealedCount, setRevealedCount] = useState(0);

    const spin = useCallback(
      result => {
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
      [onComplete, digitCount]
    );

    React.useImperativeHandle(ref, () => ({
      spin,
    }));

    return (
      <div
        className={`flex justify-center space-x-2 mb-4 p-6 rounded-lg shadow-inner border-4 ${theme.card.background} ${theme.card.border}`}
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

const FileUpload = ({
  onFileUpload,
  onPrizeChange,
  onDigitCountChange,
  theme,
  themeName,
}) => {
  const fileInputRef = useRef(null);
  const [prize, setPrize] = useState('');

  const handlePrizeChange = event => {
    setPrize(event.target.value);
    onPrizeChange(event.target.value);
  };

  const handleFileChange = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
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

        const maxTicket = lines.reduce((max, line) => {
          const parts = line.trim().split(',');
          if (parts.length < 2) return max;
          const ticket = parts[1];
          const match = ticket.match(/[1-9]\d*/);
          if (match) {
            const numericPart = match[0];
            return numericPart.length > max.length ? numericPart : max;
          }
          return max;
        }, '');
        const digits = maxTicket.length;
        onDigitCountChange(digits);

        onFileUpload(accountList);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mb-4">
      <label className={`block mb-2 ${theme.text.primary}`}>Enter Prize:</label>
      <Input
        type="text"
        value={prize}
        onChange={handlePrizeChange}
        placeholder="Enter the prize for this draw"
        className={`w-full ${theme.input.background} ${theme.input.text} ${theme.input.border}`}
      />
      <label className={`block mb-2 mt-2 ${theme.text.primary}`}>
        Upload Account List (CSV):
      </label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      <Button
        themeName={themeName}
        onClick={() => fileInputRef.current.click()}
        className={`w-full py-2 px-4 rounded mb-4 hover:opacity-90 font-bold ${theme.button.secondary}`}
      >
        Choose File
      </Button>
    </div>
  );
};

const FancyTable = ({
  data,
  columns,
  title,
  totalTickets,
  handleDownload,
  theme,
  themeName,
}) => {
  return (
    <div
      className={`mb-4 rounded-lg shadow overflow-hidden ${theme.card.background}`}
    >
      <h3
        className={`font-bold text-2xl p-4 sticky top-0 z-10 justify-between items-center flex ${theme.text.primary} ${theme.secondary}`}
      >
        {title}
        <span className={`font-bold text-2xl ${theme.text.primary}`}>
          {totalTickets !== undefined && `Total Tickets: ${totalTickets}`}
          {handleDownload !== undefined && (
            <Button
              onClick={handleDownload}
              className={`ml-4 ${theme.button.secondary}`}
              themeName={themeName}
            >
              Download
            </Button>
          )}
        </span>
      </h3>

      <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className={theme.table.header}>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-2 text-left ${theme.text.primary}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0 ? theme.table.rowEven : theme.table.rowOdd
                }
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-2 border-t ${theme.text.accent} ${theme.border}`}
                  >
                    {column.toLowerCase() === 'username'
                      ? maskUsername(row[column.toLowerCase()])
                      : row[column.toLowerCase()]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AccountList = ({ accounts, theme, themeName }) => {
  const data = Object.entries(accounts).flatMap(([username, tickets]) =>
    tickets.map(ticket => ({ username, ticket }))
  );

  const totalTickets = data.length;

  return (
    <FancyTable
      data={data}
      columns={['Username', 'Ticket']}
      title="Account List"
      totalTickets={totalTickets}
      theme={theme}
      themeName={themeName}
    />
  );
};

const WinnersList = ({ winners, theme, themeName }) => {
  const handleDownload = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Username,Ticket,Prize\n' +
      winners
        .map(w => `${maskUsername(w.username)},${w.ticket},${w.prize}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'winners_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <FancyTable
      data={winners}
      columns={['Username', 'Ticket', 'Prize']}
      title="Winners List"
      theme={theme}
      handleDownload={handleDownload}
      themeName={themeName}
    />
  );
};

const LuckyDraw = ({ backgroundImageUrl, LogoUrl, defaultTheme }) => {
  const [themeName, setThemeName] = useState(defaultTheme || 'blue');
  const theme = useTheme(themeName);
  const [accountList, setAccountList] = useState({});
  const [winners, setWinners] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [currentPrize, setCurrentPrize] = useState('');
  const [digitCount, setDigitCount] = useState(4);
  const slotMachineRef = useRef(null);
  const isChristmasTheme = themeName === 'christmas';

  const [playSpinSound, { stop: stopSpinSound }] = useSound(spinSound, {
    loop: true,
  });
  const [playWinSound, { stop: stopWinSound }] = useSound(
    isChristmasTheme ? winSoundChristmas : winSound
  );

  const handleSpin = useCallback(() => {
    if (Object.keys(accountList).length === 0) {
      alert('Please upload the account list first');
      return;
    }

    const allTickets = Object.entries(accountList).flatMap(
      ([username, tickets]) => tickets.map(ticket => ({ username, ticket }))
    );

    const remainingTickets = allTickets.filter(
      ticket => !winners.some(winner => winner.ticket === ticket.ticket)
    );

    if (remainingTickets.length === 0) {
      alert('All tickets have been drawn!');
      return;
    }

    setSpinning(true);
    playSpinSound();

    const randomIndex = Math.floor(Math.random() * remainingTickets.length);
    const winner = remainingTickets[randomIndex];

    const ticketNumber = winner.ticket.replace(/^\D+/, '');
    const paddedTicket = ticketNumber.padStart(digitCount, '0');
    const newNumbers = paddedTicket.slice(-digitCount).split('');

    if (slotMachineRef.current) {
      slotMachineRef.current.spin(newNumbers);
    }
  }, [accountList, winners, playSpinSound, digitCount]);

  const handleSpinComplete = useCallback(
    result => {
      setSpinning(false);
      stopSpinSound();
      const winner = Object.entries(accountList)
        .flatMap(([username, tickets]) =>
          tickets.map(ticket => ({ username, ticket }))
        )
        .find(ticket => {
          const numericPart = ticket.ticket.replace(/^\D+/, '');
          return numericPart.padStart(digitCount, '0').endsWith(result);
        });

      if (winner) {
        winner.prize = currentPrize;
        setWinners(prev => [...prev, winner]);
        setCurrentWinner(winner);

        setTimeout(() => {
          setIsModalOpen(true);
          playWinSound();
        }, 300);

        setAccountList(prevList => {
          const newList = { ...prevList };
          const userTickets = newList[winner.username];
          const index = userTickets.indexOf(winner.ticket);
          if (index > -1) {
            userTickets.splice(index, 1);
            if (userTickets.length === 0) {
              delete newList[winner.username];
            }
          }
          return newList;
        });
      }
    },
    [accountList, playWinSound, stopSpinSound, currentPrize, digitCount]
  );

  const handleFileUpload = useCallback(newAccountList => {
    setAccountList(newAccountList);
    setWinners([]);
    alert('Account list uploaded successfully');
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    stopWinSound();
  };

  return (
    <>
      <ChristmasEffects isEnabled={isChristmasTheme} />
      <div className="fixed top-4 right-4 z-50">
        <select
          value={themeName}
          onChange={e => setThemeName(e.target.value)}
          className="p-2 rounded border bg-white"
        >
          <option value="blue">Blue Theme</option>
          <option value="dark">Dark Theme</option>
          <option value="christmas">Christmas Theme</option>
          <option value="green">Green Theme</option>
        </select>
      </div>
      <div
        className={`flex flex-col justify-start items-center min-h-screen p-4 md:p-8 font-[-apple-system,BlinkMacSystemFont,Helvetica_Neue,Arial,PingFang_SC,Microsoft_YaHei,sans-serif] relative ${theme.primary}`}
      >
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-10"
          style={{ backgroundImage: backgroundImageUrl }}
        ></div>

        <img
          src={LogoUrl}
          alt="Logo"
          className="mb-6 w-48 md:w-64 relative z-10"
        />
        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 relative z-10 w-full max-w-7xl">
          <Card
            themeName={themeName}
            className={`flex-1 shadow-2xl rounded-3xl border-4 ${theme.card.background} ${theme.card.border}`}
          >
            <CardContent className="p-4 md:p-6" themeName={themeName}>
              <h1
                className={`text-3xl md:text-4xl font-bold text-center mb-6 ${theme.text.primary}`}
              >
                Lucky Draw Machine
              </h1>
              <SlotMachine
                ref={slotMachineRef}
                onComplete={handleSpinComplete}
                digitCount={digitCount}
                theme={theme}
              />
              <Button
                onClick={handleSpin}
                className={`w-full mb-4 font-bold py-3 md:py-4 text-xl md:text-2xl rounded-full shadow-lg transform hover:scale-105 transition-all ${theme.button.primary}`}
                disabled={spinning}
                themeName={themeName}
              >
                {spinning ? 'Drawing...' : 'Start Draw'}
              </Button>
              <FileUpload
                onFileUpload={handleFileUpload}
                onPrizeChange={setCurrentPrize}
                onDigitCountChange={setDigitCount}
                theme={theme}
                themeName={themeName}
              />
              <WinnersList
                winners={winners}
                theme={theme}
                themeName={themeName}
              />
            </CardContent>
          </Card>
          <Card
            themeName={themeName}
            className={`lg:w-[500px] shadow-xl rounded-3xl border-4 ${theme.card.background} ${theme.card.border}`}
          >
            <CardContent themeName={themeName} className="p-4 md:p-6">
              <AccountList
                accounts={accountList}
                theme={theme}
                themeName={themeName}
              />
            </CardContent>
          </Card>
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          theme={theme}
          themeName={themeName}
        >
          <h2
            className={`text-3xl font-bold mb-6 text-center ${theme.text.primary}`}
          >
            Congratulations!
          </h2>
          <div className={`p-4 rounded-lg mb-4 ${theme.secondary}`}>
            <p className={`text-xl mb-2 ${theme.text.secondary}`}>
              <span className="font-semibold">Winner:</span>
            </p>
            <p className={`text-3xl font-bold mb-4 ${theme.text.primary}`}>
              {currentWinner ? maskUsername(currentWinner.username) : ''}
            </p>
            <p className={`text-xl mb-2 ${theme.text.secondary}`}>
              <span className="font-semibold">Ticket Number:</span>
            </p>
            <p className={`text-3xl font-bold mb-4 ${theme.text.primary}`}>
              {currentWinner?.ticket}
            </p>
            <p className={`text-xl mb-2 ${theme.text.secondary}`}>
              <span className="font-semibold">Prize:</span>
            </p>
            <p className={`text-3xl font-bold ${theme.text.primary}`}>
              {currentWinner?.prize}
            </p>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default LuckyDraw;
