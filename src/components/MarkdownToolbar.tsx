import { Tooltip } from "@mui/material";
import { useActive, useRemirrorContext } from "@remirror/react";  

/* Custom toolbar component for DualEditor that provides buttons/controls built on Remirror extensions */
 
const Divider = () => <div className="h-[1rem] mx-1 border-r-1 border-r-gray-600"/>;

type ToolbarButtonProps = { 
  type: string; 
  onClick?: () => void; 
};

const ToolbarButton = ({ type, onClick = () => {} }: ToolbarButtonProps) => {
  const active = useActive();   
  const { commands } = useRemirrorContext();  
  let tooltip = null; 
  let isActive = false;
  let action = onClick;

  switch (type) {
    case "header":  
      isActive = active.bold();
      action = () => commands.toggleBold(); 
      break;
    case "undo":    
      tooltip = "Undo (⌘Z)";
      action = () => commands.undo();
      break;
    case "redo":      
      tooltip = "Redo (⌘Y)";
      action = () => commands.redo();
      break;
    case "format_bold":  
      tooltip = "Bold (⌘B)";
      isActive = active.bold();
      action = () => commands.toggleBold(); 
      break;
    case "format_italic":  
      tooltip = "Italic (⌘I)";
      isActive = active.italic();
      action = () => commands.toggleItalic(); 
      break;
    case "strikethrough_s":  
      tooltip = "Strikethrough (⌘D)";
      isActive = active.strike();
      action = () => commands.toggleStrike(); 
      break;
    case "code":  
      tooltip = "Codeblock";
      isActive = active.codeBlock();
      action = () => commands.toggleCodeBlock(); 
      break;
    case "format_quote":  
      tooltip = "Blockquote (^>)";
      isActive = active.blockquote();
      action = () => commands.toggleBlockquote(); 
      break;
    case "download":   
      tooltip = "Download PDF";  
      break;
  };

  return (
    <Tooltip title={tooltip} placement="bottom"> 
      <button  
        onClick={action}  
        onMouseDown={e => e.preventDefault()}  
        className={`toolbar-btn hover:bg-[var(--secondary)] ${ isActive ? "bg-[var(--secondary)]" : "bg-[var(--light-modal-background)]" }`}
      >   
        <span className="material-symbols-outlined" style={{ fontSize: "var(--text-xl)" }}> {type} </span>  
      </button>
    </Tooltip>
  );
};

const HeaderButton = () => {
  const { heading } = useActive();   
  const { commands } = useRemirrorContext();     
 
  return (
    <div className={`toolbar-btn group ${ heading() && "bg-[var(--secondary)]" }`}> 
      <span className="material-symbols-outlined"> format_h1 </span>
      <div className="toolbar-menu"> 
        { [1, 2, 3, 4, 5, 6].map(num => (
          <div 
            key={num}
            onClick={() => commands.toggleHeading({ level: num })}
            className={`toolbar-menu-item ${ heading({ level: num }) && "bg-[var(--secondary)]" }`}
          >
            {`H${num} (⌘⇧${num})`}
          </div>           
        ))}  
      </div>
    </div>
  );
};
 
export const VisualToolbar = ({ onDownload = () => {} }: { onDownload: () => void }) => (
  <div className="flex flex-row flex-wrap items-center gap-1 bg-[var(--light-modal-background)] p-1 border-1 border-[var(--light-modal-border)] rounded-sm">   
    <ToolbarButton type="format_bold" />
    <ToolbarButton type="format_italic" />
    <ToolbarButton type="strikethrough_s" />  
    <HeaderButton /> 
    <Divider /> 
    <ToolbarButton type="code" />
    <ToolbarButton type="format_quote" />
    <Divider /> 
    <ToolbarButton type="undo" />
    <ToolbarButton type="redo" />
    <ToolbarButton type="download" onClick={onDownload} /> 
  </div>
);