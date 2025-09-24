"use client" 
import { use, useEffect, useRef, useState } from "react";  
import { useNote, useUpsertNote } from "@/app/hooks/useNotes";
import { useCurrentUser } from "@/app/hooks/useUser";  
import { NoteForm } from "@/components/forms/NoteForm";
import { TagChip } from "@/components/TagChip"; 
import { IconButton } from "@/components/IconButton"; 
import { CircularProgress, Snackbar } from "@mui/material";
import { Json, Note } from "@/utils/supabase/supabase";  
import { ErrorMessage } from "@/components/ErrorMessage";  
import { DualEditor } from "@/components/DualEditor/DualEditor"; 
import { EditorHandle } from "@/components/DualEditor/DualEditorImpl";

/* Page where logged-in users can create/edit a note */

const formatDate = (dateStr: string) => { 
    const date = new Date(dateStr);  
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
};

// recursively compares 2 (Remirror) JSON objects' content (checks for equal keys/values - ignoring key order)
const isDeepEqual = (a: any, b: any):boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (a === b) return true;  
    if (!a || !b || typeof a !== "object" || typeof b !== "object") return false; 
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => isDeepEqual(a[key], b[key]));
};  
 
type SnackbarState = {
    open: boolean;
    message: string | null;
};

const NoteEditorPage = ({ params } : { params: Promise<{ id: string }> }) => {    
    const { id: noteId } = use(params);
    const { data: user, isFetching: isFetchingUser, isError: userError } = useCurrentUser();     
    const { data: note, isFetching: isFetchingNote, isError: noteError } = useNote(noteId, user?.id);      
    const isLoading = isFetchingUser || isFetchingNote;  
    const isError = userError || noteError;     
    const upsertNote = useUpsertNote();    
    const editorRef = useRef<EditorHandle>(null);  
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);   
    const [formOpen, setFormOpen] = useState(false);    
    const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: null });   

    // check editor content + save if changes made
    useEffect(() => {
        if (!selectedNote || formOpen) return;
        const autoSave = setInterval(() => {
            const unsavedChanges = !isDeepEqual(selectedNote?.content, editorRef.current?.getContent()); 
            if (unsavedChanges) saveNote(selectedNote);
        }, 10000); // 10 secs
        return () => clearInterval(autoSave);
    }, [selectedNote, formOpen]);

    useEffect(() => {   
        if (note) setSelectedNote(note);  
    }, [note]);  

    const saveNote = async (note: Note, showSuccess: boolean = false) => {    
        try {
            if (note && user) {       
                const { tags, ...rest } = note;
                const updatedNote = {  
                    ...rest,
                    last_edited: new Date().toISOString(),
                    content: editorRef.current ? (editorRef.current.getContent() as Json) : note.content
                };   
                const updatedNoteWithTags = { ...updatedNote, tags: tags };  
                await upsertNote.mutateAsync({  
                    items: updatedNote, 
                    setQueryData: [
                        { key: ["note", note.id, user?.id], newData: updatedNoteWithTags },
                        { 
                            key: ["notes", user.id], 
                            replaceData: { targetId: note.id, newData: updatedNoteWithTags } 
                        }
                    ]  
                });
                setSelectedNote(updatedNoteWithTags);
                if (showSuccess) setSnackbar({ open: true, message: "Note saved" }); 
            }  
        } catch { 
            setSnackbar({ open: true, message: "Error occurred" });
        }   
    };  
 
    return ( 
        isLoading ? (
            <div className="flex w-full h-full">
                <CircularProgress className="m-auto text-[var(--primary)]" color="inherit"/>
            </div> 
        ) : (  
            isError ? ( 
                <ErrorMessage /> 
            ) : ( 
                selectedNote && (
                    <div className="h-full flex flex-col">   
                        {/* Note Header + Action Buttons */}
                        <div className="sticky top-0 left-0 z-10 flex flex-col gap-1 px-5 pb-3 sm:pt-2 border-b-1 border-b-[var(--modal-border)]"> 
                            <div className="flex flex-row items-center gap-3">
                                <p className="text-xl font-medium"> {selectedNote.title} </p>  
                                <IconButton
                                    icon="edit_document" 
                                    iconProps={{ size: "var(--text-xs)"}} 
                                    text="EDIT" 
                                    onClick={() => setFormOpen(true)}
                                    className="muted-button-bg !text-xs ml-auto leading-none"
                                /> 
                                <IconButton
                                    icon="download_done" 
                                    iconProps={{ size: "var(--text-xs)"}} 
                                    text="SAVE"
                                    onClick={() => saveNote(selectedNote, true)}
                                    className="primary-button-bg !text-xs leading-none"
                                />   
                            </div>    
                            <div className="flex flex-col gap-2 text-xs text-[var(--muted-foreground)]"> 
                                Last Saved: {formatDate(selectedNote.last_edited)}
                                { selectedNote.tags && selectedNote.tags.length > 0 && (
                                    <div className="flex flex-row flex-wrap max-w-full gap-2">
                                        Tags: { selectedNote.tags.map(tag => <TagChip key={tag.id} tag={tag} /> )} 
                                    </div>
                                )} 
                            </div>  
                        </div>    

                        <DualEditor 
                            content={selectedNote.content} 
                            ref={editorRef} 
                            onError={() => setSnackbar({ open: true, message: "Error occurred"})}
                        /> 

                        <NoteForm 
                            isOpen={formOpen}
                            note={selectedNote} 
                            onSubmit={saveNote} 
                            closeForm={() => setFormOpen(false)} 
                        />  
                        <Snackbar 
                            open={snackbar.open}
                            autoHideDuration={3000}
                            onClose={() => setSnackbar({ open: false, message: null})}
                            message={snackbar.message}
                            action={ 
                                <IconButton 
                                    icon="close" 
                                    onClick={() => setSnackbar({ open: false, message: null})} 
                                /> 
                            }
                        />  
                    </div>  
                )
            ) 
        )
    );
};    

export default NoteEditorPage; 