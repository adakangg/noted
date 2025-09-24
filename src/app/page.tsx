"use client"  
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation"; 
import { useIsMobile } from "./hooks/useIsMobile";
import { useCurrentUser } from "./hooks/useUser";
import { HeaderLogo } from "@/components/HeaderLogo";
import { IconButton } from "@/components/IconButton"; 
import { FeatureCard } from "@/components/FeatureCard"; 
import { useEffect, useState } from "react";

const LandingPage = () => {   
  const router = useRouter();
  const isMobile = useIsMobile(); 
  const { data: user } = useCurrentUser();   
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false); 
  const authenticateUser = () => user ? router.push("/notes") : router.push("/auth/login");  

  useEffect(() => { setMounted(true)}, []);
  if (!mounted) return null;

  return (  
    <div className="flex flex-col min-h-full px-10 md:px-20 pt-25 md:pt-10 pb-10 justify-center">        

      {/* Navigation Bar */}
      <div className="fixed z-10 top-0 left-0 flex flex-row items-center justify-between w-full h-13 p-3 border-b-1 border-[var(--modal-border)] bg-[var(--background)]">
        <HeaderLogo /> 
        <div className="flex flex-row items-center gap-2 h-full"> 
          <IconButton 
            icon={theme !== "light" ? "dark_mode" : "light_mode"} 
            onClick={() => setTheme(theme === "light" ? "dark" : "light")} 
            className="muted-button-bg h-full px-1.5" 
          /> 
          <IconButton  
            icon="login"  
            text={isMobile ? null : "Sign In"}
            onClick={authenticateUser}
            className={`primary-button-bg h-full ${isMobile && "px-1.5"}`}  
          />   
        </div>
      </div>

      {/* Hero Section */} 
      <div className="grid lg:grid-cols-2 gap-x-10 gap-y-15">    
        <div className="flex flex-col items-start gap-6 my-auto">    
          <h1 className="text-[3.7rem] font-medium mb-3 leading-[4rem]"> 
            The Ultimate Lofi <br></br>  
            <span className="relative highlighted mr-3 cursor-default">NoteTaking</span> App.  
          </h1>      
          <p className="text-[var(--muted-foreground)] sm:pr-5">
            Enter a calm workspace that blends writing, focus, and flow — 
            write in Markdown or rich text, stay on track with Pomodoro, and keep the vibe with lofi beats
          </p>  
          <div className="flex flex-row items-center gap-3"> 
            <IconButton 
              text="Use Open Editor" 
              onClick={() => router.push("/open_editor") }
              className="primary-button-bg"
            /> 
            <IconButton 
              text="Login Here" 
              onClick={authenticateUser} 
              className="muted-button-bg"
            />  
          </div>  
        </div>

        {/* Features List */}
        <div className="flex flex-col gap-2 w-full">
          <p className="p-1 text-sm text-[var(--muted-foreground)]">FEATURES . . .</p>
          <div className="grid min-[450px]:grid-cols-2 gap-8">  
            <FeatureCard icon="📝" title="Markdown | WYSIWYG" text="Switch seamlessly between editing in markdown or rich text" />
            <FeatureCard icon="💾" title="Auto-Save" text="Changes saved automatically, so you can write worry-free" /> 
            <FeatureCard icon="🗂️" title="Export Notes" text="Easily export your notes or download them as PDFs"  />  
            <FeatureCard icon="🔖" title="Organize With Tags" text="Quickly sort and access your notes with unlimited tags" />    
            <FeatureCard icon="🎧" title="Radio | Flight Mode" text="Set the mood with lofi vibes or ATC ambiance while you work" />
            <FeatureCard icon="🍅" title="Pomodoro Timer" text="Track your sessions and stay focused with a built-in timer"  /> 
          </div>  
        </div> 
      </div> 
    </div>   
  );
};

export default LandingPage;