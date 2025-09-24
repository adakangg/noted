import { IconButton } from "./IconButton"; 

export const ErrorMessage = () => ( 
    <div className="flex w-full h-full">  
        <div className="flex flex-col items-center m-auto text-center gap-5 sm:max-w-1/2"> 
            <div className="material-symbols-outlined " style={{ fontSize: "3rem" }}> 
                error
            </div>  
            <p className="text-5xl font-medium"> Something went wrong </p>
            <p className="text-md text-[var(--muted-foreground)] mb-1">
                It seems an unexpected error has occurred
            </p>   
            <IconButton  
                icon="refresh" 
                text="Refresh Page"
                onClick={() => window.location.reload()}
                className="muted-button-bg"
            />     
        </div>    
    </div>
);  