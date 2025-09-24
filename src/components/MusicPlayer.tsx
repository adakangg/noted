import { useEffect, useRef, useState } from "react";   
import { IconButton } from "./IconButton";
import { CircularProgress, Tooltip } from "@mui/material"; 

/*  Sidebar component that embeds/controls SoundCloud player widget */ 

const WAVEFORM_BARS = [
    { minHeight: 1.4, maxHeight: 10.2, duration: 1.6 },
    { minHeight: 1.5, maxHeight: 7.4, duration: 1.3 },
    { minHeight: 2.6, maxHeight: 4.4, duration: 1.4 }
];

const WaveForm = ({ musicStopped }: { musicStopped: boolean }) => ( 
    <div className="flex flex-row items-end gap-0.25 ml-auto"> 
        { WAVEFORM_BARS.map(bar => (
            <div 
                key={bar.minHeight} 
                className="waveform-bar w-1 bg-[var(--secondary)]" 
                style={{  
                    "--min-height": `${bar.minHeight}px`,
                    "--max-height": `${bar.maxHeight}px`,
                    "--duration": `${bar.duration}s`, 
                    opacity: musicStopped ? 0 : 100,
                    animationPlayState: musicStopped ? "paused" : "running" 
                } as React.CSSProperties} 
            />  
        ))} 
    </div>   
);

// extend 'Window' type to include SoundCloud widget API
declare global {
    interface Window {
        SC: { 
            Widget: { 
                (iframeElement: string | HTMLIFrameElement): SoundCloudWidget;  
                // defines event types fired by widget + used to bind/unbind event listeners
                Events: { 
                    READY: "ready";
                    PLAY: "play";  
                    FINISH: "finish"; 
                }
            } 
        };
    }
}; 

type SoundCloudSong = { 
    id: number;
    title: string; 
    duration: number;  
    permalink_url: string;
    user: { username: string };
    artwork_url: string;
};
  
type SoundCloudWidget = {
    play(): void;
    pause(): void;
    prev(): void;
    next(): void;
    toggle(): void;
    seekTo(ms: number): void;   
    setVolume(vol: number): void;
    getSounds(callback: (songs: SoundCloudSong[]) => void): void;
    getCurrentSound(callback: (song: SoundCloudSong) => void): void;
    bind(event: string, listener: (...args: any[]) => void): void; // eslint-disable-line @typescript-eslint/no-explicit-any
};
 
export const MusicPlayerWidget = () => {  
    const scWidgetRef = useRef<SoundCloudWidget | null>(null);  
    const atcAudioRef = useRef<HTMLAudioElement>(null); 
    const [currentSong, setCurrentSong] = useState<SoundCloudSong | null>(null);   
    const [musicStopped, setMusicStopped] = useState(true);
    const [atcModeOn, setAtcModeOn] = useState(false);   

    // load SoundCloud widget script + initialize music player
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://w.soundcloud.com/player/api.js"; 
        script.onload = () => { 
            const iframeElement = document.querySelector("iframe");  
            if (window &&  iframeElement) { 
                scWidgetRef.current = window.SC.Widget(iframeElement);   
                scWidgetRef.current.bind(window.SC.Widget.Events.READY, () => { 
                    scWidgetRef.current?.getSounds(songs => {      
                        if (songs.length) setCurrentSong(songs[0]);
                        scWidgetRef.current?.pause();
                    }); 
                });
                scWidgetRef.current.bind(window.SC.Widget.Events.PLAY, () => { 
                    scWidgetRef.current?.getCurrentSound(sound => {    
                        if (sound.id !== currentSong?.id) setCurrentSong(sound);  
                    }); 
                }); 
                scWidgetRef.current.setVolume(70);
                if (atcAudioRef.current) atcAudioRef.current.volume = 0.3;
            }
        };    
        document.body.appendChild(script); 
        return () => { 
            document.body.removeChild(script)
        };
    }, [currentSong]);  

    const playPrevSong = () => { 
        scWidgetRef.current?.prev();
        if (musicStopped) scWidgetRef.current?.pause();
    };

    const playNextSong = () => {
        scWidgetRef.current?.next();
        if (musicStopped) scWidgetRef.current?.pause();
    };

    const toggleMusic = () => {
        if (scWidgetRef.current) {    
            scWidgetRef.current.toggle();
            if (musicStopped) {   
                if (atcModeOn) atcAudioRef.current?.play();   
            } else {  
                if (atcModeOn) atcAudioRef.current?.pause();   
            }
            setMusicStopped(prev => !prev);
        }
    };  

    const toggleATC = () => {
        if (!musicStopped) { 
            if (atcModeOn) {
                atcAudioRef.current?.pause();
            } else {
                atcAudioRef.current?.play(); 
            } 
        }
        setAtcModeOn(prev => !prev);
    };

    return ( 
        <> 
            { scWidgetRef.current && currentSong ? (     
                <div className="flex flex-col w-full gap-1 text-[var(--muted-foreground)] py-0.25">     
                    <div className="flex flex-row justify-between w-full gap-2">  
                         <Tooltip 
                            title="View on SoundCloud" 
                            placement="top"
                            componentsProps={{ tooltip: { sx: { fontSize: "0.6rem" }}}}
                        >
                            <a href={currentSong.permalink_url} target="_blank" className="shrink-0">
                                <img src={currentSong.artwork_url} alt="song artwork" className="w-11.75 h-11.75"/>  
                            </a> 
                        </Tooltip>  
                        <div className="flex flex-col w-full overflow-hidden">
                            <Tooltip 
                                title={`${currentSong.title} - ${currentSong.user?.username ?? ""}`}  
                                placement="top"
                                componentsProps={{ tooltip: { sx: { fontSize: "0.6rem" }}}}
                            >
                                <div className="w-full cursor-default">
                                    <div className="truncate text-xs"> {currentSong.title} </div>
                                    <div className="truncate text-[0.6rem]"> {currentSong.user?.username ?? ""} </div>
                                </div>  
                            </Tooltip>    
                            <div className="flex flex-row w-full gap-2 p-[0.7px] mt-1">     
                                <IconButton 
                                    icon="skip_previous" 
                                    iconProps={{ fill: "1" }} 
                                    onClick={playPrevSong} 
                                    tooltip="Play Previous"
                                />
                                <IconButton 
                                    icon={musicStopped ? "play_arrow" : "pause"} 
                                    iconProps={{ fill: "1" }}
                                    onClick={toggleMusic}
                                    tooltip={musicStopped ? "Play" : "Pause"}
                                />
                                <IconButton 
                                    icon="skip_next" 
                                    iconProps={{ fill: "1" }}
                                    onClick={playNextSong} 
                                    tooltip="Play Next" 
                                />  
                                <IconButton 
                                    icon={atcModeOn ? "flight" : "airplanemode_inactive"} 
                                    iconProps={{ size: "0.65rem" }} 
                                    onClick={toggleATC}
                                    className="rotate-90 p-0.5"
                                    tooltip={`Turn ${atcModeOn ? "Off" : "On"} ATC`}
                                />  
                                <WaveForm musicStopped={musicStopped} /> 
                            </div>  
                        </div>
                    </div>     
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <CircularProgress className="my-2 text-[var(--primary)]" color="inherit" />
                </div>
            )}     
            <audio ref={atcAudioRef} src="/atc_audio.mp3" loop />    
            <iframe 
                width="100%" 
                height="0" 
                allow="autoplay" 
                src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A1710939930&color=%23742454&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"
            />
        </>  
    );
};