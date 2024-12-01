const fs = require("fs");

// 生成測試資料的輔助函數
function generateLottoNumbers() {
  const numbers = Array.from({ length: 47 }, (_, i) => i + 1);
  const selected = [];

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    selected.push(numbers[randomIndex]);
    numbers.splice(randomIndex, 1);
  }

  return selected.sort((a, b) => a - b).join(".");
}

// 生成CSV內容
let csvContent = "Username,Ticket\n";

// 特殊測試案例
const specialCases = [
  // 連續數字
  "user001,1.2.3.4.5.6",
  "user001,7.8.9.10.11.12",
  // 高號碼組合
  "user002,42.43.44.45.46.47",
  "user002,37.38.39.40.41.42",
  // 低號碼組合
  "user003,1.3.5.7.9.11",
  "user003,2.4.6.8.10.12",
  // 分散號碼
  "user004,1.10.20.30.40.47",
  "user004,5.15.25.35.40.45",
  // 常見組合
  "user005,1.16.24.31.41.46",
  "user005,7.13.21.33.39.45",
];

// 添加特殊案例
csvContent += specialCases.join("\n") + "\n";

// 生成大量隨機測試資料
for (let i = 6; i <= 1000000; i++) {
  // 每個用戶產生1-3組號碼
  const numTickets = Math.floor(Math.random() * 3) + 1;
  for (let j = 0; j < numTickets; j++) {
    const username = `user${i.toString().padStart(3, "0")}`;
    csvContent += `${username},${generateLottoNumbers()}\n`;
  }
}

// 將內容寫入CSV檔案
fs.writeFileSync("lotto_test.csv", csvContent, "utf8");
console.log("CSV file has been generated successfully: lotto_test.csv");
