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
        className="flex flex-row gap-1.5 max-w-20 leading-none px-2 py-0.75 text-[0.67rem] font-medium rounded-sm cursor-default"
    > 
        {tag.name} 
        { onBtnClick && (
            <IconButton 
                icon="close" 
                iconProps={{ size: "var(--text-xs)" }}
                onClick={onBtnClick} 
                className="-mr-1" 
            /> 
        )} 
    </div>
);