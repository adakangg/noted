"use client" 
import { useState } from "react"; 
import { IconButton } from "@/components/IconButton";
import { Snackbar } from "@mui/material";  
import { DualEditor } from "@/components/DualEditor/DualEditor"; 

/* Free/Open Version of Dual Text Editor (accessible without account signup/login) */

const OpenEditorPage = () => {
    const [errSnackbarOpen, setErrSnackbarOpen] = useState(false); 
    
    return (
        <div className="h-full flex flex-col pt-1">   
            <DualEditor onError={() => setErrSnackbarOpen(true)} /> 
            <Snackbar 
                open={errSnackbarOpen}
                autoHideDuration={3000}
                onClose={() => setErrSnackbarOpen(false)}
                message="Error occurred"
                action={ <IconButton icon="close" onClick={() => setErrSnackbarOpen(false)} /> }
            /> 
        </div>
    );
};

export default OpenEditorPage;