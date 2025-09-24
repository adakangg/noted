type EmptyStateProps = {
  icon: string;
  title: string;
  subtitle: string;
  onSubtitleClick: () => void;
};

export const EmptyState = ({ icon, title, subtitle, onSubtitleClick }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-1 mx-auto mt-12">
    <span  
      className="material-symbols-outlined text-[var(--muted-foreground)] bg-[var(--modal-border)] p-2.5 rounded-lg"
      style={{ fontVariationSettings: "'FILL' 1", fontSize: "var(--text-4xl)" }}
    >
      {icon}
    </span> 
    <p className="text-lg font-semibold mt-3"> {title} </p>
    <p 
      onClick={onSubtitleClick} 
      className="text-xs text-[var(--muted-foreground)] hover:underline cursor-pointer"
    >
      {subtitle}
    </p>
  </div>
);