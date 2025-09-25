import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { JetBrains_Mono, DM_Sans } from "next/font/google"; 
import { LayoutWithSidebar } from "@/components/LayoutSidebarWrapper";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import "./globals.css";    

const jetbrainsMono = JetBrains_Mono({ 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"], 
  variable: "--font-jetbrains-mono",
  subsets: ["latin"] 
}); 

const dmSans = DM_Sans({ 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], 
  variable: "--font-dm-sans",
  subsets: ["latin"] 
}); 

export const metadata: Metadata = {
  title: "noted | lofi & chill",
  description: "An all-in-one note-taking app that provides markdown or visual editing, Pomodoro sessions, and lofi beats."
};

export const RootLayout = ({ children }: Readonly<{children: React.ReactNode}>) => (
  <ReactQueryClientProvider> 
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0..1,0" rel="stylesheet" />
      </head>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>  
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LayoutWithSidebar>          
            {children} 
          </LayoutWithSidebar>  
        </ThemeProvider>
      </body>
    </html> 
  </ReactQueryClientProvider> 
); 

export default RootLayout;