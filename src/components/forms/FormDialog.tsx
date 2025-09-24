import Dialog from "@mui/material/Dialog";   
import { IconButton } from "../IconButton";   
import { useEffect } from "react";
import { useIsMobile } from "@/app/hooks/useIsMobile";

/* General layout wrappers for form dialog/elements */

type FormInputWrapperProps = { 
    label: string;
    inputId: string; 
    children: React.ReactNode;
    onAddBtnClick?: () => void; 
};

export const FormInputWrapper = ({ label, inputId, children, onAddBtnClick }: FormInputWrapperProps) => (
    <div className="flex flex-col w-full gap-0.5">
        <label htmlFor={inputId} className="text-[0.8rem] text-[var(--muted-foreground)] w-full"> {label} </label>
        <div className="custom-input border-1 border-[var(--muted-button-border)] group focus-within:outline-[var(--primary)]">    
            {children}
            { onAddBtnClick && (
                <IconButton 
                    icon="add" 
                    onClick={() => onAddBtnClick()} 
                    className="-mr-1"
                />
            )}
        </div> 
    </div>
);

type FormButtonsProps = {
    error?: string | null;
    onCancel?: () => void; 
    className?: string;
};

export const FormButtons = ({ className = "", error, onCancel }: FormButtonsProps) => (
    <div className="flex flex-col items-end gap-1 w-full">
        { error && <p className="text-red-400 text-xs"> {error} </p> }
        <div className="flex flex-row justify-end gap-2 w-full">
            { onCancel && (
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className={`custom-button muted-button-bg !outline-0 ${className}`}
                > 
                    Cancel 
                </button>
            )} 
            <button 
                type="submit" 
                className={`custom-button primary-button-bg ${!onCancel && "w-full"} ${className}`}
            > 
                Submit  
            </button>
        </div> 
    </div>   
);

type FormDialogProps = {
    isOpen?: boolean;
    onOpen?: (() => void) | null;
    title: string;
    children?: React.ReactNode;
    error?: string | null;
    onSubmit: () => void |  Promise<void>;
    closeForm?: () => void;
};

export const FormDialog  = ({ isOpen = false, onOpen = null, title, children, error, onSubmit, closeForm }: FormDialogProps) => {  
    const isMobile = useIsMobile();

    useEffect(() => { 
        if (isOpen && onOpen) onOpen();
    }, [isOpen, onOpen]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { 
        e.preventDefault();  
        onSubmit();  
    };

    return (
        <Dialog
            open={isOpen} 
            onClose={closeForm}
            aria-labelledby="form-dialog-title"    
            PaperProps={{ sx: { background: "var(--modal-background)", width: isMobile ? "100%" : "20rem" }}}   
        >
            <form  
                onSubmit={e => handleSubmit(e)}
                className="flex flex-col gap-5 bg-[var(--modal-background)] text-[var(--foreground)] p-4"
            >   
                <h1 id="form-dialog-title" className="text-xl font-medium leading-none"> {title} </h1>     
                { children && <div className="flex flex-col gap-2 w-full"> {children} </div> }
                <FormButtons error={error} onCancel={closeForm} /> 
            </form>
        </Dialog> 
    );
};