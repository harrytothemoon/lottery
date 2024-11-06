// themes/index.js
export const themes = {
  blue: {
    primary: "bg-[#0a52a0]",
    secondary: "bg-[#094682]",
    accent: "text-[#ecdc91]",
    border: "border-[#ecdc91]",
    text: {
      primary: "text-[#ecdc91]",
      secondary: "text-[#fff4c1]",
      accent: "text-[#ffb600]",
    },
    button: {
      variants: {
        default: "bg-[#ecdc91] text-[#0a52a0] hover:bg-[#ecdc91]/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[#ecdc91] bg-[#0a52a0] text-[#ecdc91] hover:bg-[#094682]",
        secondary: "bg-[#094682] text-[#ecdc91] hover:bg-[#094682]/80",
        ghost: "hover:bg-[#094682] hover:text-[#ecdc91]",
        link: "text-[#ecdc91] underline-offset-4 hover:underline",
        // 保留原有的自定义样式
        primary:
          "bg-gradient-to-b from-[#ecdc91] via-[#fff4c1] to-[#ffb600] text-[#0a52a0]",
      },
    },
    card: {
      base: "rounded-lg border border-[#ecdc91] bg-[#0a52a0] text-[#ecdc91] shadow-sm",
      header: "flex flex-col space-y-1.5 p-6",
      title:
        "text-2xl font-semibold leading-none tracking-tight text-[#ecdc91]",
      description: "text-sm text-[#fff4c1]",
      content: "p-6 pt-0",
      footer: "flex items-center p-6 pt-0",
      background: "bg-[#0a52a0]",
      border: "border-[#ecdc91]",
    },
    table: {
      header: "bg-[#0d3d6e]",
      rowEven: "bg-[#0a4a91]",
      rowOdd: "bg-[#0a52a0]",
    },
    input: {
      background: "bg-[#0a52a0]",
      text: "text-[#ecdc91]",
      border: "border-[#ecdc91]",
      base: `flex h-10 w-full rounded-md border 
        border-[#ecdc91] 
        bg-[#0a52a0] 
        px-3 py-2 
        text-sm 
        text-[#ecdc91] 
        ring-offset-[#0a52a0]
        file:border-0 
        file:bg-transparent 
        file:text-sm 
        file:font-medium 
        placeholder:text-[#fff4c1] 
        focus-visible:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-[#ecdc91] 
        focus-visible:ring-offset-2 
        disabled:cursor-not-allowed 
        disabled:opacity-50`,
    },
  },
  dark: {
    primary: "bg-[#1f2028]",
    secondary: "bg-[#272933]",
    accent: "text-[#fedfa1]",
    border: "border-[#fedfa1]",
    text: {
      primary: "text-[#fedfa1]",
      secondary: "text-[#ffffff]",
      accent: "text-[#a3b3cc]",
    },
    button: {
      variants: {
        default: "bg-[#fedfa1] text-[#272933] hover:bg-[#fedfa1]/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[#fedfa1] bg-[#1f2028] text-[#fedfa1] hover:bg-[#272933]",
        secondary: "bg-[#272933] text-[#fedfa1] hover:bg-[#272933]/80",
        ghost: "hover:bg-[#272933] hover:text-[#fedfa1]",
        link: "text-[#fedfa1] underline-offset-4 hover:underline",
        // 保留原有的自定义样式
        primary: "bg-[#fedfa1] text-[#272933]",
      },
    },
    card: {
      base: "rounded-lg border border-[#fedfa1] bg-[#1f2028] text-[#fff] shadow-sm",
      header: "flex flex-col space-y-1.5 p-6",
      title:
        "text-2xl font-semibold leading-none tracking-tight text-[#fedfa1]",
      description: "text-sm text-[#a3b3cc]",
      content: "p-6 pt-0",
      footer: "flex items-center p-6 pt-0",
      background: "bg-[#1f2028]",
      border: "border-[#fedfa1]",
    },
    table: {
      header: "bg-[#272933]",
      rowEven: "bg-[#1f2028]",
      rowOdd: "bg-[#272933]",
    },
    input: {
      background: "bg-[#272933]",
      text: "text-[#ffffff]",
      border: "border-[#fedfa1]",
      base: `flex h-10 w-full rounded-md border 
        border-[#fedfa1] 
        bg-[#272933] 
        px-3 py-2 
        text-sm 
        text-[#fff] 
        ring-offset-[#272933]
        file:border-0 
        file:bg-transparent 
        file:text-sm 
        file:font-medium 
        placeholder:text-[#a3b3cc] 
        focus-visible:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-[#fedfa1] 
        focus-visible:ring-offset-2 
        disabled:cursor-not-allowed 
        disabled:opacity-50`,
    },
  },
  christmas: {
    // 使用更柔和的紅綠配色
    primary: "bg-gradient-to-b from-[#2F5233] via-[#235347] to-[#1C3F4C]", // 漸變森林綠
    secondary: "bg-[#B12E40]", // 優雅紅色
    accent: "text-[#E8C547]", // 溫暖金色
    border: "border-[#E8C547]", // 溫暖金色邊框
    text: {
      primary: "text-[#E8C547]", // 溫暖金色
      secondary: "text-[#F4EBD9]", // 米白色
      accent: "text-[#E8C547]", // 改為金色，原本是紅色
    },
    button: {
      variants: {
        default:
          "bg-gradient-to-r from-[#B12E40] to-[#943A3A] text-[#F4EBD9] hover:opacity-90 shadow-md shadow-red-900/20 transition-all duration-300",
        destructive: "bg-[#943A3A] text-[#F4EBD9] hover:bg-[#7A2E2E]",
        outline:
          "border-2 border-[#E8C547] bg-[#2F5233] text-[#E8C547] hover:bg-[#235347] transition-all duration-300",
        secondary:
          "bg-[#235347] text-[#E8C547] hover:bg-[#1C3F4C] transition-all duration-300",
        ghost:
          "hover:bg-[#B12E40]/10 hover:text-[#B12E40] transition-all duration-300",
        link: "text-[#E8C547] underline-offset-4 hover:underline hover:text-[#B12E40] transition-all duration-300",
        primary:
          "bg-gradient-to-r from-[#E8C547] via-[#F4EBD9] to-[#E8C547] text-[#2F5233] font-semibold shadow-md shadow-yellow-900/20 hover:shadow-lg hover:shadow-yellow-900/30 transition-all duration-300 bg-[length:200%_100%] animate-shimmer",
      },
    },
    card: {
      base: "rounded-lg border-2 border-[#E8C547] bg-gradient-to-b from-[#2F5233] via-[#235347] to-[#1C3F4C] text-[#F4EBD9] shadow-xl shadow-green-900/10",
      header:
        "flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-transparent via-[#E8C547]/5 to-transparent",
      title:
        "text-2xl font-bold leading-none tracking-tight text-[#E8C547] [text-shadow:_0_1px_3px_rgb(0_0_0_/_40%)]",
      description: "text-sm text-[#F4EBD9]/90",
      content: "p-6 pt-0",
      footer: "flex items-center p-6 pt-0 border-t border-[#E8C547]/20",
      background: "bg-gradient-to-b from-[#2F5233] via-[#235347] to-[#1C3F4C]",
      border: "border-[#E8C547]",
    },
    table: {
      header: "bg-[#1C3F4C]",
      rowEven: "bg-[#2F5233]",
      rowOdd: "bg-[#235347]",
    },
    input: {
      background: "bg-[#2F5233]",
      text: "text-[#F4EBD9]",
      border: "border-[#E8C547]",
      base: `flex h-10 w-full rounded-md border-2
        border-[#E8C547] 
        bg-[#2F5233] 
        px-3 py-2 
        text-sm 
        text-[#F4EBD9] 
        ring-offset-[#2F5233]
        file:border-0 
        file:bg-transparent 
        file:text-sm 
        file:font-medium 
        placeholder:text-[#F4EBD9]/50
        focus-visible:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-[#E8C547] 
        focus-visible:ring-offset-2 
        disabled:cursor-not-allowed 
        disabled:opacity-50
        shadow-md shadow-green-900/10
        transition-all duration-300
        hover:shadow-lg hover:border-[#E8C547]`,
    },
  },
};

export const useTheme = (themeName) => {
  return themes[themeName] || themes.blue;
};
