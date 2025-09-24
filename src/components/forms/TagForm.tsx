import { useDeleteItems } from "@/app/hooks/useDbHelpers";
import { useUpsertTags, useUserTags } from "@/app/hooks/useNotes"; 
import { useCurrentUser } from "@/app/hooks/useUser";
import { useCallback, useEffect, useRef, useState } from "react" 
import { FormDialog, FormInputWrapper } from "./FormDialog"; 
import { TagChip } from "../TagChip"; 
import { Tag } from "@/utils/supabase/supabase";
  
/* Form component used to create new tags + delete user's existing tags */

type TagColor = { 
    background_color: string; 
    text_color: string;
};

const TAG_COLORS = [
    { background_color: "#ffa6a1", text_color: "#510304"},
    { background_color: "#ffba82", text_color: "#381900"},
    { background_color: "#ffeca2", text_color: "#352303"}, 
    { background_color: "#99d6a8", text_color: "#01310f"}, 
    { background_color: "#b4f4fd", text_color: "#174e55"}, 
    { background_color: "#9fc6f8", text_color: "#092141"},      
    { background_color: "#c0b6f3", text_color: "#2d1e7c"},    
    { background_color: "#cbcfcf", text_color: "#000000"}  
];   

type TagFormProps = { 
    isOpen: boolean; 
    closeForm: () => void;
};
 
export const TagForm  = ({ isOpen, closeForm }: TagFormProps) => {  
    const { data: user } = useCurrentUser();     
    const { data: tags } = useUserTags(user?.id);   
    const upsertTags = useUpsertTags();  
    const deleteItems = useDeleteItems(); 
    const tagNameRef = useRef<HTMLInputElement>(null);        
    const [currentTags, setCurrentTags] = useState<Tag[]>([]);   
    const [deletedTags, setDeletedTags] = useState<Tag[]>([]);
    const [tagColor, setTagColor] = useState<TagColor>(TAG_COLORS[0]);   
    const [formErr, setFormErr] = useState("");   

    useEffect(() => { 
        if (tags) setCurrentTags(tags);
    }, [tags]); 

    const addNewTag = () => {       
        const tagName = tagNameRef.current?.value;   
        if (user && tagNameRef.current && tagName?.length) {
            const newTag = { 
                id: crypto.randomUUID(), 
                name: tagName, 
                background_color: tagColor.background_color, 
                text_color: tagColor.text_color, 
                user_id: user.id 
            };  
            setCurrentTags(prev => [...prev, newTag]); 
            tagNameRef.current.value = "";
        } else {
            setFormErr("Tag name required");
        }
    };
    
    const removeTag = (tag: Tag, index: number) => {   
        setCurrentTags(prev => prev.filter((_, i) => i !== index)); 
        setDeletedTags(prev => [...prev, tag]);
    }; 

    const handleSubmit = async () => {  
        try {
            if (user) {       
                await upsertTags.mutateAsync({  
                    items: currentTags,   
                    setQueryData: [{ key: ["tags", user.id], newData: currentTags }] 
                });   
                if (deletedTags.length) {
                    await deleteItems.mutateAsync({  
                        items: deletedTags,
                        table: "tags",
                        removeQueries: { keys: [["tags", user.id], ["notes", user.id], ["note"]] }
                    });
                }
                closeForm(); 
            }  
        } catch {    
            setFormErr("An error occurred"); 
        }  
    }; 

    const resetValues = useCallback(() => {  
        setFormErr(""); 
        setTagColor(TAG_COLORS[0]);
        setCurrentTags(tags ?? []);
        setDeletedTags([]);
    }, [tags]);

    return ( 
        <FormDialog
            isOpen={isOpen}
            onOpen={resetValues}
            title="Edit Tags" 
            error={formErr}
            onSubmit={handleSubmit}
            closeForm={closeForm}
        >  
            <FormInputWrapper label="Add New Tag" inputId="tag-name" onAddBtnClick={addNewTag}>
                <input 
                    id="tag-name"
                    ref={tagNameRef} 
                    onChange={() => { if (formErr) setFormErr("") }} 
                    placeholder="name" 
                    className="text-xs" 
                />  
            </FormInputWrapper>  
 
            {/* Tag Color Selection */}
            <div className="flex flex-row items-start flex-wrap gap-3 px-1 mt-2">
                { TAG_COLORS.map(tag => ( 
                    <div 
                        key={tag.background_color}
                        onClick={() => setTagColor(tag)} 
                        className="flex flex-col items-center w-3.5 h-3.5 rounded-lg cursor-pointer" 
                        style={{ backgroundColor: tag.background_color }} 
                        content=""
                    > 
                        { tag.background_color === tagColor.background_color && (
                            <span 
                                className="material-symbols-outlined" 
                                style={{ fontSize: "var(--text-sm)", color: tag.text_color }}
                            > 
                                check 
                            </span> 
                        )}
                    </div>
                ))} 
            </div>
 
            {/* Current User Tags List */}
            <p className="text-xs w-full mt-6"> Your Tags </p>
            { tags && (
                <div className="flex flex-row flex-wrap overflow-y-auto max-h-12 gap-x-2 gap-y-1">
                    { currentTags.map((tag, index) => (
                        <TagChip 
                            key={tag.id} 
                            tag={tag}  
                            onBtnClick={() => removeTag(tag,index)} 
                        />
                    ))}   
                </div> 
            )}    
        </FormDialog> 
    );
};