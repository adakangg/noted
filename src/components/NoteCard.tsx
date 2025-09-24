import Link from "next/link";   
import { TagChip } from "./TagChip"; 
import { IconButton } from "./IconButton"; 
import { Note } from "@/utils/supabase/supabase";
 
const formatDate = (date: string) => new Date(date).toLocaleDateString();

type NoteCardProps = {
    note: Note;
    onDelete: (note: Note) => void;
};

export const NoteCard = ({ note, onDelete }: NoteCardProps) => { 
    const deleteNote = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onDelete(note);
    };
    
    return (  
        <Link href={{ pathname: `/notes/${note.id}` }}>   
            <div className="flex flex-col h-full gap-2 px-4 pt-2 pb-2.5 card-bg rounded-md cursor-pointer overflow-hidden">
                <div className="flex flex-row justify-between gap-2 w-full"> 
                    <p className="text-[1rem] font-medium"> {note.title} </p>
                    <IconButton 
                        icon="close"  
                        iconProps={{ size: "var(--text-md)" }} 
                        tooltip="Delete Note"  
                        onClick={deleteNote}  
                        className="-mr-1 mt-1.25"
                    /> 
                </div>      
                
                { note.tags && (
                    <div className="flex flex-row flex-wrap gap-2">
                        { note.tags.map(tag => <TagChip key={tag.id} tag={tag} /> )}   
                    </div> 
                )}

                <div className="flex flex-row items-start gap-1 text-xs text-[var(--muted-foreground)] pt-6 mt-auto"> 
                    <span className="material-symbols-outlined pt-0.25" style={{ fontSize: "0.9rem" }}>
                        history
                    </span> 
                    {`Last Edited: ${formatDate(note.last_edited)}`} 
                </div>    
            </div>
        </Link>  
    );
};