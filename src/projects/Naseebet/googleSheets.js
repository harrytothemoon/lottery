// Google Sheets API 集成模块 - Naseebet 专用
export const googleSheetsAPI = {
  // 从 Google Sheets URL 提取 Sheet ID
  extractSheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  },

  // 构建 CSV 导出 URL
  buildCSVUrl(sheetId, gid = 0) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  },

  // 获取 Google Sheets 数据
  async fetchSheetData(sheetUrl) {
    try {
      const sheetId = this.extractSheetId(sheetUrl);
      if (!sheetId) {
        throw new Error('无效的 Google Sheets URL');
      }

      const csvUrl = this.buildCSVUrl(sheetId);
      console.log('正在从 Google Sheets 获取数据:', csvUrl);

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const csvText = await response.text();
      return this.parseCSVData(csvText);
    } catch (error) {
      console.error('获取 Google Sheets 数据失败:', error);
      throw error;
    }
  },

  // 解析 CSV 数据
  parseCSVData(csvText) {
    const lines = csvText.split('\n');
    const accountList = {};

    // 跳过第一行标题行
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      const fields = this.parseCSVLine(line);
      if (fields.length >= 2) {
        const username = fields[0];
        const ticket = fields[1];

        if (username && ticket) {
          if (!accountList[username]) {
            accountList[username] = [];
          }
          accountList[username].push(ticket);
        }
      }
    }

    console.log('解析完成，用户数量:', Object.keys(accountList).length);
    console.log(
      '总票数:',
      Object.values(accountList).reduce(
        (sum, tickets) => sum + tickets.length,
        0
      )
    );

    return accountList;
  },

  // 解析 CSV 行（正确处理包含逗号的字段）
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // 处理双引号转义
          current += '"';
          i += 2;
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // 字段分隔符
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // 添加最后一个字段
    result.push(current.trim());

    return result;
  },

  // 测试 Google Sheets 连接
  async testConnection(sheetUrl) {
    try {
      const accountList = await this.fetchSheetData(sheetUrl);
      return {
        success: true,
        userCount: Object.keys(accountList).length,
        totalTickets: Object.values(accountList).reduce(
          (sum, tickets) => sum + tickets.length,
          0
        ),
        data: accountList,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// 默认的 Google Sheets 配置 - Naseebet 专用
export const GOOGLE_SHEETS_CONFIG = {
  // 你的 Google Sheets 链接 (目前使用 Progress 的链接，对应 Naseebet 数据)
  SHEET_URL:
    'https://docs.google.com/spreadsheets/d/1J4DAggXkmWJ74QFyAVFtB62GYQQvzvDtEyg97aLcm20/edit?usp=sharing',

  // 数据刷新间隔（分钟）
  REFRESH_INTERVAL: 5,

  // 是否启用自动刷新
  AUTO_REFRESH: true,
};
