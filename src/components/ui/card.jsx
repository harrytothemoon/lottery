/* eslint-disable jsx-a11y/heading-has-content */
// components/ui/card.jsx
import * as React from "react";
import { cn } from "../../lib/utils";
import { useTheme } from "../../themes";

const Card = React.forwardRef(
  ({ className, themeName = "blue", ...props }, ref) => {
    const theme = useTheme(themeName);
    return (
      <div ref={ref} className={cn(theme.card.base, className)} {...props} />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(
  ({ className, themeName = "blue", ...props }, ref) => {
    const theme = useTheme(themeName);
    return (
      <div ref={ref} className={cn(theme.card.header, className)} {...props} />
    );
  }
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(
  ({ className, themeName = "blue", ...props }, ref) => {
    const theme = useTheme(themeName);
    return (
      <h3 ref={ref} className={cn(theme.card.title, className)} {...props} />
    );
  }
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(
  ({ className, themeName = "blue", ...props }, ref) => {
    const theme = useTheme(themeName);
    return (
      <p
        ref={ref}
        className={cn(theme.card.description, className)}
        {...props}
      />
    );
  }
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(
  ({ className, themeName = "blue", ...props }, ref) => {
    const theme = useTheme(themeName);
    return (
      <div ref={ref} className={cn(theme.card.content, className)} {...props} />
    );
  }
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(
  ({ className, themeName = "blue", ...props }, ref) => {
    const theme = useTheme(themeName);
    return (
      <div ref={ref} className={cn(theme.card.footer, className)} {...props} />
    );
  }
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
