import { supabaseClient } from "@/utils/supabase/client";
import { Note, NoteTag, Table, Tag } from "@/utils/supabase/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";    
import { MutationFnArgs, onMutationSuccess } from "./mutationHandlers";
/* eslint-disable @typescript-eslint/no-unused-vars */

/* Defines generic hooks to add/delete items to/from database & refresh/reset queries */ 

export const insertItems = async (items: (Note | Tag | NoteTag)[], table: Table) => {    
    const { data } = await supabaseClient
        .from(table)
        .insert(items)
        .throwOnError(); 
 
   return data;
};
 
const upsertItems = async (items: (Note | Tag | NoteTag)[], table: Table) => {  
    const { data } = await supabaseClient
        .from(table)
        .upsert(items) 
        .throwOnError(); 

   return data;
};  

type UpsertArgs = { 
    upsert?: boolean;
    insert?: boolean;
    table: Table; 
};
 
export const useUpsertItems = ({ upsert = false, insert = false, table }: UpsertArgs) => {   
    const queryClient = useQueryClient(); 
    return useMutation({
        mutationFn: async ({ items }: MutationFnArgs) => {  
            try {
                const itemsArray = Array.isArray(items) ? items : [items];
                if (upsert) await upsertItems(itemsArray, table);
                if (insert) await insertItems(itemsArray, table);  
            } catch (err) { 
                throw err
            }
        }, 
        onSuccess: (_data, variables, _context) => onMutationSuccess(queryClient, variables) 
    });
};

const deleteItems = async (itemIds: string[], table: Table) => {    
    await supabaseClient
        .from(table)
        .delete()
        .in("id", itemIds) 
        .throwOnError();
};

export const useDeleteItems = () => {  
    const queryClient = useQueryClient();  
    return useMutation({
        mutationFn: async ({ items, table }: MutationFnArgs) => {
            try {  
                if (table) {
                    const itemsArray = Array.isArray(items) ? items : [items]; 
                    const itemIds = itemsArray
                        .filter((item): item is Note | Tag => "id" in item) 
                        .map(item => item.id);
                    await deleteItems(itemIds, table);
                }
            } catch(err) {
                throw err
            }
        },
        onSuccess: (_data, variables, _context) => onMutationSuccess(queryClient, variables)
    });
};