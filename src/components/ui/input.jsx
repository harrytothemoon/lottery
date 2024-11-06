// components/ui/input.jsx
import * as React from "react";
import { cn } from "../../lib/utils";
import { useTheme } from "../../themes";

const Input = React.forwardRef(
  ({ className, type, themeName = "blue", ...props }, ref) => {
    const theme = useTheme(themeName);

    return (
      <input
        type={type}
        className={cn(theme.input.base, className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
