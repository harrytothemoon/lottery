// themes/index.js
export const themes = {
  blue: {
    primary: 'bg-[#0a52a0]',
    secondary: 'bg-[#094682]',
    accent: 'text-[#ecdc91]',
    border: 'border-[#ecdc91]',
    text: {
      primary: 'text-[#ecdc91]',
      secondary: 'text-[#fff4c1]',
      accent: 'text-[#ffb600]',
    },
    button: {
      primary: 'bg-gradient-to-b from-[#ecdc91] via-[#fff4c1] to-[#ffb600] text-[#0a52a0]',
      secondary: 'bg-[#ecdc91] text-[#0a52a0]',
    },
    table: {
      header: 'bg-[#0d3d6e]',
      rowEven: 'bg-[#0a4a91]',
      rowOdd: 'bg-[#0a52a0]',
    },
    card: {
      background: 'bg-[#0a52a0]',
      border: 'border-[#ecdc91]',
    },
    input: {
      background: 'bg-[#0a52a0]',
      text: 'text-[#ecdc91]',
      border: 'border-[#ecdc91]',
    }
  },
  dark: {
    primary: 'bg-[#1f2028]',
    secondary: 'bg-[#272933]',
    accent: 'text-[#fedfa1]',
    border: 'border-[#fedfa1]',
    text: {
      primary: 'text-[#fedfa1]',
      secondary: 'text-[#ffffff]',
      accent: 'text-[#a3b3cc]',
    },
    button: {
      primary: 'bg-[#fedfa1] text-[#272933]',
      secondary: 'bg-[#fedfa1] text-[#272933]',
    },
    table: {
      header: 'bg-[#272933]',
      rowEven: 'bg-[#1f2028]',
      rowOdd: 'bg-[#272933]',
    },
    card: {
      background: 'bg-[#1f2028]',
      border: 'border-[#fedfa1]',
    },
    input: {
      background: 'bg-[#272933]',
      text: 'text-[#ffffff]',
      border: 'border-[#fedfa1]',
    }
  }
};


export const useTheme = (themeName) => {
  return themes[themeName] || themes.blue;
};
