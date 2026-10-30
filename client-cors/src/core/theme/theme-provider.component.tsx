import { type ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";

interface ThemeProviderComponentProps {
  children: ReactNode;
}

export const ThemeProviderComponent = ({
  children,
}: ThemeProviderComponentProps) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);
