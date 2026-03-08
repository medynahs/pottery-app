import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "./utils/cn";
import { useColorScheme } from "./utils/use-color-scheme";

interface ThemeProviderProps extends ViewProps {
  theme?: "light" | "dark" | "system";
}

const ThemeProvider = React.forwardRef<
  React.ElementRef<typeof View>,
  ThemeProviderProps
>(({ theme = "light", className, ...props }, ref) => {  // Changed default from "system" to "light"
  const colorScheme = useColorScheme();
  const isDark = theme === "system" ? colorScheme === "dark" : theme === "dark";

  return (
    <View
      ref={ref}
      className={cn(
        "flex-1 bg-background",
        isDark && "dark",
        className
      )}
      {...props}
    />
  );
});

ThemeProvider.displayName = "ThemeProvider";

export { ThemeProvider };
