import { useDeleteNoteTags, useInsertNoteTags, useUserTags } from "@/app/hooks/useNotes";
import { useCurrentUser } from "@/app/hooks/useUser";   
import { useCallback, useRef, useState } from "react"; 
import { FormDialog, FormInputWrapper } from "./FormDialog";
import { TagChip } from "../TagChip";
import { TagMenuItem } from "../NoteSearchbar";
import { Menu } from "@mui/material";   
import { Note, Tag } from "@/utils/supabase/supabase";

/* Form component used to edit note title + selected tags */
 
type NoteFormProps = {
    isOpen: boolean;
    note: Note; 
    closeForm: () => void;
    onSubmit: (note: Note, showSuccess?: boolean) => void;
};

export const NoteForm = ({ isOpen, note, onSubmit, closeForm }: NoteFormProps) => {  
    const { data: user } = useCurrentUser();  
    const { data: tags } = useUserTags(user?.id);    
    const noteNameRef = useRef<HTMLInputElement>(null);       
    const [selectedTags, setSelectedTags] = useState<Tag[]>(note.tags ?? []); 
    const [formErr, setFormErr] = useState("");   
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null); 
    const insertNoteTags = useInsertNoteTags();
    const deleteNoteTags = useDeleteNoteTags();   
    
    const addTag = (tag: Tag) => setSelectedTags(prev => [...prev, tag]);    

    const removeTag = (tagId: string) => {   
        setSelectedTags(prev => prev.filter(selectedTag => selectedTag.id !== tagId));
    }; 

    // save changes for tags that were added/deleted
    const saveTagChanges = async () => { 
        if (note && note.tags) {
            const originalTags = note.tags;
            const addedTags = selectedTags.filter(tag => (
                !originalTags.some(originalTag => originalTag.id === tag.id)
            )); 
            if (addedTags.length) {
                const newNoteTags = addedTags.map(newTag => ({ tag_id: newTag.id, note_id: note.id }));  
                await insertNoteTags.mutateAsync({ items: newNoteTags });
            }

            const deletedTags = [...note.tags].filter(tag => (
                !selectedTags.some(currentTag => currentTag.id === tag.id)
            ));   
            if (deletedTags.length) {  
                await deleteNoteTags.mutateAsync({ 
                    noteId: note.id, 
                    tagIds: deletedTags.map(tag => tag.id)
                });
            }     
        }
    }; 

    const handleSubmit = async () => {   
        if (noteNameRef.current?.value.length === 0) { 
            setFormErr("* Title is required");
            return;
        }    
        try {
            await saveTagChanges();
            const updatedNote = {  
                ...note,
                title: noteNameRef.current?.value.trim() ?? "New Note", 
                tags: selectedTags 
            }; 
            onSubmit(updatedNote, true);
            closeForm();
        } catch {
            setFormErr("Error occurred");
        }
    };

    const resetValues = useCallback(() => {
        setFormErr("");     
        setSelectedTags(note.tags ?? []); 
    }, [note]);

    return ( 
        <FormDialog
            isOpen={isOpen}
            title="Edit Note"
            onSubmit={handleSubmit}
            onOpen={resetValues}
            closeForm={closeForm}
            error={formErr}
        >      
            <FormInputWrapper label="Title" inputId="note-title">
                <input 
                    id="note-title" 
                    ref={noteNameRef} 
                    defaultValue={note?.title}  
                    placeholder="title" 
                    className="text-sm"
                />
            </FormInputWrapper> 
                 
            {/* Selected Tags List */}
            <p className="text-[0.8rem] text-[var(--muted-foreground)] w-full mt-3 -mb-1.5"> Tags </p> 
            <div 
                onClick={e => setAnchorEl(e.currentTarget)}  
                className={`custom-input border-1 border-[var(--muted-button-border)] !px-1.5 ${ anchorEl && "outline-[var(--primary)]" }`}
            > 
                { selectedTags.length > 0 ? (
                    <div className="flex flex-row flex-wrap gap-2">
                        { selectedTags.map(tag => (
                            <TagChip 
                                key={tag.id} 
                                tag={tag}  
                                onBtnClick={e => {
                                    if (e) e.stopPropagation();
                                    removeTag(tag.id);
                                }}
                            /> 
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-[var(--muted-foreground)]"> Select Tags </p>
                )} 
                <span 
                    className="material-symbols-outlined text-[var(--muted-foreground)] cursor-default ml-auto" 
                    style={{ fontSize: "var(--text-sm)" }}
                >
                    expand_all
                </span>  
            </div>   

            {/* Tag Selection Menu */}
            <Menu 
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}     
                PaperProps={{
                    sx: { 
                        width: anchorEl?.offsetWidth, 
                        background: "var(--modal-background)", 
                        outline: "1px solid var(--muted-button-border)" 
                    }
                }}
            >
                <div className="flex flex-col p-1">
                    { tags && tags.map(tag => {
                        const isSelected = selectedTags?.some(selectedTag => tag.id === selectedTag.id);
                        return (
                            <TagMenuItem  
                                key={tag.id}
                                tag={tag}
                                isSelected={isSelected}
                                onClick={() => isSelected ? removeTag(tag.id) : addTag(tag)}
                            /> 
                        )
                    })}   
                </div>
            </Menu>  
        </FormDialog> 
    );
};