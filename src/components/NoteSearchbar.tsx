import { Menu } from "@mui/material";
import { IconButton } from "./IconButton";
import { useState } from "react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { Tag } from "@/utils/supabase/supabase"; 

type TagMenuItemProps = { 
  tag: Tag;
  isSelected: boolean; 
  onClick: () => void; 
};

export const TagMenuItem = ({ onClick, isSelected, tag }: TagMenuItemProps) => (
  <div  
    onClick={onClick} 
    className="flex flex-row items-center gap-1.5 text-[0.8rem] text-[var(--foreground)] font-medium leading-none p-1.5 hover:bg-[var(--light-modal-border)] rounded-xs cursor-pointer"
  >
    { isSelected ? (
      <span className="material-symbols-outlined text-green-500 -mx-0.5" style={{ fontSize: "1rem" }}> 
        check 
      </span> 
    ) : (
      <div 
        className="w-2.25 h-2.25 rounded-xs" 
        content="" 
        style={{ backgroundColor: tag.background_color }} 
      />
    )}   
    {tag.name}
  </div> 
);

type TagFilterMenuProps = {
  tags: Tag[];
  tagFilters: Tag[];
  toggleTagFilter: (tag: Tag) => void;
};

// used to select tags to include when filtering notes
const TagFilterMenu = ({ tags, tagFilters, toggleTagFilter }: TagFilterMenuProps) => { 
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null); 
  const isMobile = useIsMobile();  

  return (
    <>
      <IconButton  
        icon={isMobile ? "filter_alt" : (anchorEl ? "keyboard_arrow_up" : "keyboard_arrow_down")} 
        iconProps={{ size: "var(--text-md)" }}
        text={isMobile ? null : "Filter Tags"}
        onClick={e => setAnchorEl(e.currentTarget)}  
        className={`h-full -mr-1 hover:text-[var(--primary)] ${ anchorEl && "text-[var(--primary)]"} ${isMobile && "p-1.5" }`}
      /> 
      <Menu 
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}  
        disableAutoFocus 
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }} 
        PaperProps={{ sx: { background: "var(--modal-background)" }}}   
      >  
        <div className="grid grid-cols-2 gap-1 px-1 -my-1">
          { tags && tags.map(tag => (
            <TagMenuItem  
              key={tag.id}
              tag={tag}
              onClick={() => toggleTagFilter(tag)}
              isSelected={tagFilters?.some(selectedTag => tag.id === selectedTag.id)}
            /> 
          ))}  
        </div>
      </Menu> 
    </>
  );
};

type SearchbarProps = TagFilterMenuProps & {
  inputref: React.Ref<HTMLInputElement>;
  onSearch: () => void;   
}; 

// used to search for notes by title/tags
export const Searchbar = ({ inputref, onSearch, tags, tagFilters, toggleTagFilter }: SearchbarProps) => {  
  const isMobile = useIsMobile(); 

  return (
    <div className={`custom-input muted-button-bg ${ isMobile ? "!py-0.75" : "!py-0" }`}>
      <div className="flex flex-row items-center gap-3 w-full">
        <span  
          className="material-symbols-outlined text-[var(--muted-foreground)]"
          style={{ fontSize: "var(--text-xl)" }}
        >
          search
        </span> 
        <input 
          ref={inputref}  
          placeholder="Search notes by title"  
          onKeyDown={e => { if (e.key === "Enter") onSearch() }}         
        />
      </div>   
      <TagFilterMenu
        tags={tags}
        tagFilters={tagFilters}
        toggleTagFilter={toggleTagFilter} 
      /> 
    </div>
  );
};