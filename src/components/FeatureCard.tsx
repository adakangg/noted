type FeatureCardProps = { 
  icon: string;  
  title: string; 
  text: string;
};

export const FeatureCard = ({ icon, title, text }: FeatureCardProps) => (  
    <div className="parent-shake-anim flex flex-row w-full h-full gap-3 px-5 py-3.5 rounded-lg card-bg cursor-default">  
        <span className="child-shake-anim text-[3rem]"> {icon} </span>
        <div className="flex flex-col gap-1.5">
            <p className="text-lg font-semibold mt-2"> {title} </p>  
            <p className="text-xs text-[var(--muted-foreground)]"> {text} </p> 
        </div>
    </div> 
);