import { Note, NoteTag, Table, Tag } from "@/utils/supabase/supabase";
import { QueryClient } from "@tanstack/react-query";

/* Defines callbacks to update specified caches after successful query mutation */

export type Query = { key: string[] }; 
export type QueryKey = string[];

export type SetQueryData = { 
    newData?: Note | Tag | (Note | Tag)[]; 
    replaceData?: { targetId: string; newData: Note };
};

export type MutationFnArgs = {  
    items: Note | Tag | NoteTag | (Note | Tag | NoteTag)[];
    table?: Table;   
    invalidateQueries?: { keys: QueryKey[] };
    removeQueries?: { keys: QueryKey[] };
    setQueryData?: (Query & SetQueryData)[];     
};  

const invalidateQueries = (queryClient: QueryClient, keys: QueryKey[]) => { 
    keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));   
};

const removeQueries = (queryClient: QueryClient, keys: QueryKey[]) => {  
    keys.forEach(key => queryClient.removeQueries({ queryKey: key }));  
};

export const setQueryData = (queryClient: QueryClient, queryData: (Query & SetQueryData)[]) => {  
    queryData.forEach(query => { 
        if (query.newData) queryClient.setQueryData(query.key, query.newData);
        if (query.replaceData) queryClient.setQueryData(query.key, (prev: Note[]) => {
            // add data if not present, otherwise replaces it
            const exists = prev.some(prevNote => prevNote.id === query.replaceData?.targetId);
            return exists
                ? prev.map(prevNote => prevNote.id === query.replaceData?.targetId ? query.replaceData?.newData : prevNote)
                : [...prev, query.replaceData?.newData]; 
        });
    });
};
 
export const onMutationSuccess = (queryClient: QueryClient, variables: MutationFnArgs) => {
    if (variables.invalidateQueries?.keys) invalidateQueries(queryClient, variables.invalidateQueries.keys);
    if (variables.removeQueries?.keys) removeQueries(queryClient, variables.removeQueries.keys);
    if (variables.setQueryData) setQueryData(queryClient, variables.setQueryData);
};