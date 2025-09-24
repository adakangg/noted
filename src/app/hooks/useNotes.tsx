import { supabaseClient } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";  
import { insertItems, useUpsertItems } from "./useDbHelpers"
import { Note, Tag } from "@/utils/supabase/supabase";
import { setQueryData } from "./mutationHandlers";

/* Defines specific hooks to fetch/update/cache note/tag data using React Query */ 
 
export const useUpsertTags = () => useUpsertItems({ table: "tags", upsert: true }); 
export const useUpsertNote = () => useUpsertItems({ table: "notes", upsert: true });  
export const useInsertNoteTags = () => useUpsertItems({ table: "note_tags", insert: true }); 

const NOTES_SELECT_QUERY = `id, 
    title, 
    content, 
    last_edited, 
    user_id, 
    note_tags (
        tags (id, name, background_color, text_color, user_id)
    )
`;

type RawNote = Note & { note_tags: { tags: Tag }[] };
  
const formatNote = (noteData: RawNote): Note => {
    const { note_tags, ...rest } = noteData;   
    return { 
        ...rest,
        tags: note_tags.map(note_tag => note_tag.tags) 
    };
};

const getUserNotes = async (userId: string): Promise<Note[]> => {
    const { data } = await supabaseClient
        .from("notes") 
        .select(NOTES_SELECT_QUERY)
        .eq("user_id", userId) 
        .throwOnError();   

    return data.map(noteData => formatNote(noteData));         
};
 
export const useUserNotes = (userId: string | undefined) => (
    useQuery({
        queryKey: ["notes", userId],
        queryFn: async () => getUserNotes(userId!),
        enabled: !!userId
  })
);

const getNote = async (noteId: string) => {  
    const { data, error } = await supabaseClient
        .from("notes") 
        .select(NOTES_SELECT_QUERY)
        .eq("id", noteId) 
        .maybeSingle();  

    if (error) throw error; 
    return data ? formatNote(data) : data;  
};
 
export const useNote = (noteId: string | undefined, userId: string | undefined) => {  
    const queryClient = useQueryClient();
        return useQuery({
            queryKey: ["note", noteId, userId],
            queryFn: async () => { 
                let note = await getNote(noteId!); 
                if (!note) { // create + add new default note
                    const defaultNote = {
                        id: noteId!, 
                        user_id: userId!, 
                        title: "New Note", 
                        last_edited: new Date().toISOString(), 
                        content: null
                    }; 
                    note = { ...defaultNote, tags: [] };
                    await insertItems([defaultNote], "notes");
                    setQueryData(queryClient, [{ 
                        key: ["notes", userId!], 
                        replaceData: { targetId: noteId!, newData: note } 
                    }]);
                } 
                if (note) return note; 
                throw new Error();
            },  
            initialData: () => {
                const userNotes = queryClient.getQueryData<Note[]>(["notes", userId]);
                return userNotes?.find(note => note.id === noteId); 
            },
        enabled: !!noteId && !!userId
    });
};
 
const getUserTags = async (userId: string): Promise<Tag[]> => {
    const { data } = await supabaseClient
        .from("tags")
        .select("*")
        .eq("user_id", userId)  
        .throwOnError(); 

    return data;
};
   
export const useUserTags = (userId: string | undefined) => (
    useQuery({
        queryKey: ["tags", userId],
        queryFn: async () => getUserTags(userId!),
        enabled: !!userId
    })
); 

const deleteNoteTags = async (tagIds: string[], noteId: string) => {    
    await supabaseClient
        .from("note_tags")
        .delete()
        .in("tag_id", tagIds)
        .eq("note_id", noteId)
        .throwOnError();
};

export const useDeleteNoteTags = () => (
    useMutation({
        mutationFn: async ({ noteId, tagIds }: { noteId: string; tagIds: string[] }) => {
            try {   
                await deleteNoteTags(tagIds, noteId);
            } catch(err) {
                throw err;
            }
        }
    })
);