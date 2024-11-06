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
};

export const useTheme = (themeName) => {
  return themes[themeName] || themes.blue;
};
