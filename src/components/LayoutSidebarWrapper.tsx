"use client" 
import { createContext, useContext, useState } from "react";    
import { usePathname, useRouter } from "next/navigation"; 
import { useTheme } from "next-themes" 
import { useCurrentUser, useLogoutUser } from "@/app/hooks/useUser"; 
import { useIsMobile } from "@/app/hooks/useIsMobile";  
import { Drawer } from "@mui/material"; 
import { MusicPlayerWidget } from "./MusicPlayer"; 
import { TimerWidget } from "./Timer";    
import { HeaderLogo } from "./HeaderLogo"; 
import { useQueryClient } from "@tanstack/react-query";

/* Wrapper layout component to conditionally render sidebar (hidden on login/landing pages) */

type SidebarContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};    

const SidebarContext = createContext<SidebarContextType | null>(null); 

type SidebarItemProps = { 
  icon: string; 
  label: string;  
  children?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
};

const SidebarItem = ({ icon, label, children, onClick, isSelected = false }: SidebarItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const context = useContext(SidebarContext);
  if (!context) return <></>;
  const { sidebarOpen, setSidebarOpen } = context; 

  return (
    <div className="flex flex-col shrink-0 w-full overflow-hidden text-[var(--foreground)]"> 

      {/* Title */}
      <div 
        onClick={() => sidebarOpen ? (onClick ? onClick() : setExpanded(prev => !prev)) : setSidebarOpen(true)}
        className={`flex flex-row items-center gap-1 w-full px-1 py-2 cursor-pointer rounded-sm hover:bg-[var(--sidebar-hover-background)] 
          ${isSelected && "bg-[var(--sidebar-hover-background)]"}
        `}
      > 
        <span className="material-symbols-outlined px-0.5" style={{ fontSize: "var(--text-lg)" }}> {icon} </span>  
        <div className={`flex flex-row justify-between w-full ${ !sidebarOpen && "!hidden" }`}>
          <p className="text-[0.9rem] leading-none"> {label} </p> 
          { children && (
            <span className="material-symbols-outlined" style={{ fontSize: "var(--text-sm)" }}> 
              { expanded ? "keyboard_arrow_up" : "keyboard_arrow_down" }
            </span>
          )}
        </div>
      </div>   

      {/* Inner Widget */}
      { children && (
        <div 
          className={`w-full mt-1 p-2 bg-[var(--modal-background)] border-1 border-[var(--widget-border)] rounded-sm 
            ${(!sidebarOpen || !expanded) && "!hidden"}
          `}
        > 
          {children} 
        </div> 
      )}  
    </div> 
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();    
  const { theme, setTheme } = useTheme();  
  const { data: user } = useCurrentUser();   
  const logoutUser = useLogoutUser(); 
  const queryClient = useQueryClient(); 
  const onLogoutClick = () => { 
    logoutUser();
    queryClient.clear();
  };
  
  const context = useContext(SidebarContext);
  if (!context) return <></>;
  const { sidebarOpen, setSidebarOpen } = context;   

  return (    
    <div 
      className={`flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar bg-[var(--sidebar-background)] p-2.25 border-r-1 border-r-[var(--modal-border)] 
        ${sidebarOpen ? "w-[13rem]" : "w-[3rem]"}
      `}
    >       
      <HeaderLogo 
        onClick={() => setSidebarOpen(prev => !prev)} 
        className={`overflow-hidden ${!sidebarOpen && "!invisible"}`} 
      />

      {/* Main Body + Widgets */}
      <p className="text-[0.7rem] text-[var(--muted-foreground)] -mb-3"> MENU </p>
      { user && (
        <SidebarItem 
          icon="dashboard" 
          label="Dashboard" 
          isSelected={pathname === "/notes"} 
          onClick={() => router.push("/notes")}
        />  
      )} 
      <SidebarItem icon="headphones" label="Radio">
        <MusicPlayerWidget />  
      </SidebarItem>  
      <SidebarItem icon="timer" label="Timer">
        <TimerWidget />  
      </SidebarItem>   
      <SidebarItem 
        icon={theme === "light" ? "light_mode" : "dark_mode"} 
        label={`${theme === "light" ? "Light" : "Dark"} Mode`}
        onClick={() =>  setTheme(theme === "light" ? "dark" : "light")} 
      />
        
      {/* Footer - User Account */}
      <div className="flex flex-col w-full gap-1 mt-auto">
        <SidebarItem 
          icon={user ? "logout" : "login"}
          label={user ? "Sign Out" : "Sign In"}
          onClick={user ? onLogoutClick : () => router.push("/auth/login")}
        />    
        { user && (    
          <div className="flex flex-row w-full gap-2 px-0.5 pt-2.5 cursor-default border-t-1 border-[var(--modal-border)] leading-none">
            <div className="primary-button-bg h-fit rounded-sm text-sm font-medium px-1.75 py-0.5">
              { user.email?.charAt(0)?.toLocaleUpperCase() ?? 'U' }
            </div>   
            <div className={`flex flex-col gap-0.5 flex-1 w-full overflow-hidden ${!sidebarOpen && "!hidden"}`}>
              <p className="text-[0.7rem] font-medium"> {user.email} </p> 
              <p className="text-[0.65rem] text-[var(--muted-foreground)] leading-3"> Current User </p>
            </div> 
          </div>  
        )} 
      </div>    
    </div>   
  );
}; 

export const LayoutWithSidebar = ({ children } : { children: React.ReactNode }) => { 
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);  

  return (  
    <div className="flex flex-col sm:flex-row h-screen">     
      { pathname !== "/" && pathname !== "/auth/login" && (  
        <SidebarContext.Provider value={{sidebarOpen, setSidebarOpen}}>  
          { isMobile ? (
            <>
              <div 
                onClick={() => setSidebarOpen(prev => !prev)}
                style={{ fontSize: "1.2rem" }}
                className="material-symbols-outlined w-fit hover:outline-1 rounded-sm cursor-pointer p-0.5 m-3 mb-1" 
              > 
                menu 
              </div>  
              <Drawer 
                open={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                PaperProps={{ sx: { maxHeight: "100% !important" }}}    
              >
                <Sidebar />
              </Drawer>
            </>
          ) : (
            <Sidebar />
          )}
        </SidebarContext.Provider> 
      )} 
      <div className="flex-1 h-[calc(100vh-3rem)] sm:h-full ">   
        {children}  
      </div>
    </div> 
  );
};    