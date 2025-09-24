import { useMediaQuery } from "@mui/material";

// indicates whether viewport width is within Tailwind's "sm" breakpoint (640px)
export const useIsMobile = () => useMediaQuery("(max-width:640px)");