import { ThemeProvider } from "@/providers/theme-providers";

interface IProviders {
  children: React.ReactNode;
}

export function Providers({ children }: IProviders) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
