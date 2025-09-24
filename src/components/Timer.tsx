import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";   
import { TimerForm } from "./forms/TimerForm";
 
const format2Digits = (n: number) => String(n).padStart(2, "0");
 
const secondsToHMS = (totalSeconds: number) => ({ 
    hrs: format2Digits(Math.floor(totalSeconds / 3600)).toString(), 
    mins: format2Digits(Math.floor((totalSeconds % 3600) / 60)).toString(), 
    secs: format2Digits(totalSeconds % 60).toString() 
}); 

export type TimeValues = {
    hrs: string;
    mins: string;
    secs: string;
}; 

type TimerState = {
    totalSeconds: number;
    secondsLeft: number;
    fmtedTime: TimeValues;
    isActive: boolean;
};

type TimerFormState = { 
    timer: TimeValues | null; 
    isOpen: boolean 
};

export const TimerWidget = () => {   
    const intervalRef = useRef<number | null>(null);
    const [timer, setTimer] = useState<TimerState>({ 
        totalSeconds: 5, 
        secondsLeft: 5, 
        fmtedTime: secondsToHMS(5), 
        isActive: false 
    }); 
    const [timerForm, setTimerForm] = useState<TimerFormState>({ timer: null, isOpen: false });  
    
    // manage timer initialization & cleanup
    useEffect(() => {  
        if (timer.isActive) {
            if (timer.secondsLeft > 0) { 
                intervalRef.current = window.setInterval(() => { 
                    setTimer(prev => ({
                        ...prev,
                        secondsLeft: prev.secondsLeft-1,
                        fmtedTime: secondsToHMS(prev.secondsLeft-1),
                        isActive: true
                    }))
                }, 1000);
            } else if (timer.secondsLeft === 0) {  
                refreshTimer();
                window.alert("Times up!"); 
            }
        } 
        return () => { 
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;  
          }
        } 
    }, [timer]); 
     
    const setNewTimer = (newTime: TimeValues) => {  
        const seconds = Number((+newTime.hrs * 3600) + (+newTime.mins * 60) + newTime.secs);
        setTimer({ 
            totalSeconds: seconds, 
            secondsLeft: seconds, 
            fmtedTime: secondsToHMS(seconds), 
            isActive: false 
        }); 
        setTimerForm({ timer: null, isOpen: false });
    }; 

    const refreshTimer = () => {
        setTimer(prev => ({ 
            ...prev, 
            isActive: false, 
            secondsLeft: prev.totalSeconds, 
            fmtedTime: secondsToHMS(prev.totalSeconds) 
        }));
    }; 

    const toggleTimer = () => setTimer(prev => ({ ...prev, isActive: !prev.isActive }));

    const openTimerForm = () => {
        setTimer(prev => ({ ...prev, isActive: false }));
        setTimerForm({ timer: timer.fmtedTime, isOpen: true });
    };

    return ( 
        <div className="flex flex-col items-center gap-2 w-full text-2xl">  
            { !timerForm.isOpen ? ( 
                <>  
                    {`${timer.fmtedTime.hrs} : ${timer.fmtedTime.mins} : ${timer.fmtedTime.secs}`}   
                    <div className="flex flex-row gap-3"> 
                        <IconButton icon="refresh" onClick={refreshTimer} tooltip="Reset"/> 
                        <IconButton 
                            icon={timer.isActive ? "pause" : "play_arrow"}
                            iconProps={{ fill: "1" }}
                            onClick={toggleTimer}  
                            tooltip={timer.isActive ? "Pause" : "Resume"}
                        />
                        <IconButton icon="edit" onClick={openTimerForm} tooltip="Set Timer"/>  
                    </div>
                </>
            ) : (
                <TimerForm 
                    timer={timer.fmtedTime} 
                    onSubmit={task => setNewTimer(task)} 
                    onCancel={() => setTimerForm({ timer: null, isOpen: false })}
                />
            )} 
        </div>
    );
};  