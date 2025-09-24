"use client"    
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";  
import { useUserNotes, useUserTags } from "../hooks/useNotes"; 
import { useCurrentUser } from "../hooks/useUser";
import { useDeleteItems } from "../hooks/useDbHelpers";
import { useIsMobile } from "../hooks/useIsMobile";
import { CircularProgress, Snackbar } from "@mui/material";     
import { NoteCard } from "@/components/NoteCard"; 
import { TagForm } from "@/components/forms/TagForm";
import { TagChip } from "@/components/TagChip";
import { IconButton } from "@/components/IconButton"; 
import { Searchbar } from "@/components/NoteSearchbar";
import { Note, Tag } from "@/utils/supabase/supabase"; 
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";

/* Page where logged-in users can view their notes + edit their tags */

const UserNotesPage = () => {   
  const router = useRouter();  
  const isMobile = useIsMobile();   
  const deleteItems = useDeleteItems();  
  const { data: user, isFetching: isFetchingUser, isError: userError } = useCurrentUser();    
  const { data: notes, isFetching: isFetchingNotes, error: notesError } = useUserNotes(user?.id); 
  const { data: tags, isFetching: isFetchingTags, error: tagsError } = useUserTags(user?.id);
  const isLoading = isFetchingUser || isFetchingNotes || isFetchingTags;
  const isError = userError || notesError || tagsError;   
  const searchTermRef = useRef<HTMLInputElement>(null);   
  const [tagFilters, settagFilters] = useState<Tag[]>([]);  
  const [matchingNotes, setMatchingNotes] = useState<Note[]>([]);     
  const [tagFormOpen, setTagFormOpen] = useState(false);    
  const [errSnackbarOpen, setErrSnackbarOpen] = useState(false);  

  useEffect(() => { 
    if (notes) setMatchingNotes(notes);
  }, [notes]);      

  const openNewNote = () => router.push(`/notes/${crypto.randomUUID()}`);

  const deleteNote = async (note: Note) => { 
    try {
      if (user && notes) {
        await deleteItems.mutateAsync({  
          items: note,
          table: "notes",
          removeQueries: { keys: [["note", note.id, user.id]] },
          setQueryData: [{ 
            key: ["notes", user.id], 
            newData: notes?.filter(originalNote => originalNote.id !== note.id)
          }]
        });
      }
    } catch { 
      setErrSnackbarOpen(true);
    }
  };

  // returns notes matching searched title & selected tag filters
  const getMatchingNotes = () => {
    const searchTitle = searchTermRef.current?.value; 
    if (searchTitle && notes) {     
      const filteredNotes = notes.filter(note => (
        note.title.toLowerCase().includes(searchTitle.toLowerCase()) && 
        tagFilters?.every(selectedTag => note.tags?.some(tag => tag.id === selectedTag.id))
      ));  
      setMatchingNotes(filteredNotes);
    } else {
      setMatchingNotes(notes ?? []);
    }
  };
  
  // add/remove tag from selected tag filters
  const toggleTagFilter = (tag: Tag) => {
    if (tagFilters?.some(selectedTag => selectedTag.id === tag.id)) { 
      settagFilters(prev => prev?.filter(prevTag => prevTag.id !== tag.id));
    } else { 
      settagFilters(prev => [...prev, tag]);
    }  
  }; 
 
  return ( 
    isLoading ? (
      <div className="flex w-full h-full">
        <CircularProgress className="m-auto text-[var(--primary)]" color="inherit" />
      </div> 
    ) : (
      isError ? (
        <ErrorMessage />
      ) : ( 
        <div className="flex flex-col gap-4 px-5 sm:px-8 pb-5 sm:pt-5">   
          <h1 className="text-2xl font-medium"> Your Notes </h1>  

          {/* Searchbar + Action Buttons */}
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">   
            <Searchbar 
              inputref={searchTermRef} 
              onSearch={getMatchingNotes}
              tags={tags ?? []}
              tagFilters={tagFilters}
              toggleTagFilter={toggleTagFilter} 
            />
            <IconButton
              icon="bookmark" 
              iconProps={{ size: isMobile ? "var(--text-md)" : "1rem" }} 
              text={isMobile ? null : "Edit Tags"}
              onClick={() => setTagFormOpen(true)}
              className={`muted-button-bg ${isMobile && "p-2"}`}
            /> 
            <IconButton
              icon="add" 
              iconProps={{ size: isMobile ? "var(--text-md)" : "1rem" }} 
              text={isMobile ? null : "New Note"}
              onClick={openNewNote} 
              className={`primary-button-bg ${isMobile && "p-2"}`}
            />  
          </div>   
            
          {/* Selected Tag Filters */}
          { tagFilters && tagFilters.length > 0 && (
            <div className="flex flex-row flex-wrap gap-2 px-1"> 
              <p className="text-xs text-[var(--muted-foreground)]"> Include Tags: </p>
              { tagFilters.map(tag => (
                <TagChip 
                  key={tag.id} 
                  tag={tag} 
                  onBtnClick={() => toggleTagFilter(tag)} 
                />
              ) )} 
            </div>
          )}     

          {/* All/Matching User Notes */}
          { matchingNotes && matchingNotes.length > 0 ? ( 
            <div className="grid gap-4 min-[450px]:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8 mt-6">
              { matchingNotes.map(note => <NoteCard key={note.id} note={note} onDelete={deleteNote} /> )}    
            </div> 
          ) : (
            <EmptyState 
              icon="folder_open"
              title="No Notes Found"
              subtitle="Click here to add a new note"
              onSubtitleClick={openNewNote} 
            />  
          )} 

          <TagForm isOpen={tagFormOpen} closeForm={() => setTagFormOpen(false)} /> 

          <Snackbar
            open={errSnackbarOpen}
            autoHideDuration={3000}
            onClose={() => setErrSnackbarOpen(false)}
            message="Error occurred"
            action={ <IconButton icon="close" onClick={() => setErrSnackbarOpen(false)} className="-mr-1"/> }
          /> 
        </div>
      ) 
    ) 
  );
};  

export default UserNotesPage;