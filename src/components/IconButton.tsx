import { Tooltip } from "@mui/material";

type IconProps = {
    size?: string;
    fill?: string;
    className?: string;
};

type IconButtonProps = {
    icon?: string; 
    iconProps?: IconProps; 
    text?: string | null;
    tooltip?: string;
    className?: string;
    onClick?: void | ((e: any) => void | Promise<void | boolean>); // eslint-disable-line @typescript-eslint/no-explicit-any
};
  
export const IconButton = ({ 
    icon, 
    iconProps, 
    tooltip = "", 
    text, 
    className = "", 
    onClick = () => {} 
}: IconButtonProps) => (  
    <Tooltip title={tooltip} placement="bottom"> 
        <button  
            type="button" 
            onClick={onClick}  
            className={`flex flex-row items-center gap-1 whitespace-nowrap cursor-pointer w-fit h-fit
                ${ text ? "p-2.5 text-sm rounded-sm" : "rounded-xs hover:outline-1 hover:outline-[var(--muted-foreground)]" } ${className}
            `} 
        >  
            { icon && (
                <span  
                    className={`material-symbols-outlined w-fit ${iconProps?.className ?? ""}`}
                    style={{ 
                        fontVariationSettings: `'FILL' ${iconProps?.fill ?? "0"}`, 
                        fontSize: iconProps?.size ?? "1rem" 
                    }}
                >
                    {icon}
                </span> 
            )}
            { text && text }
        </button> 
    </Tooltip>
);