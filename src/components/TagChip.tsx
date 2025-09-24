import { Tag } from "@/utils/supabase/supabase";
import { IconButton } from "./IconButton";
 
type TagChipProps = {
    tag: Tag;  
    onTagClick?: () => void; 
    onBtnClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export const TagChip = ({ tag, onTagClick = () => {}, onBtnClick }: TagChipProps) => (
    <div 
        onClick={onTagClick} 
        style={{ backgroundColor: tag.background_color, color: tag.text_color }}
        className="flex flex-row break-all gap-1.5 h-fit max-w-20 leading-none px-2 py-1 text-[0.8rem] font-medium rounded-sm cursor-default"
    > 
        {tag.name} 
        { onBtnClick && (
            <IconButton 
                icon="close" 
                iconProps={{ size: "0.8rem" }}
                onClick={onBtnClick} 
                className="-mr-1" 
            /> 
        )} 
    </div>
);