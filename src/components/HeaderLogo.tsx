type HeaderLogoProps = {
  onClick?: () => void;
  className?: string;
};

export const HeaderLogo = ({ onClick = () => {}, className = "" }: HeaderLogoProps) => (  
  <div onClick={onClick} className="flex flex-row items-center gap-1 p-1 text-[var(--foreground)] hover:bg-[var(--sidebar-hover-background)] rounded-sm cursor-pointer">
    <span className="material-symbols-outlined" style={{ fontSize: "1.3rem" }}> 
      book
    </span>
    <div className={`text-[1.4rem] font-medium ${className}`}> NOTED </div>
  </div>  
);