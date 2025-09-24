import { useState } from "react";   
import { FormButtons } from "./FormDialog";
import { TimeValues } from "../Timer";

/* Form component used to input/set time for Timer widget */ 

const isValidTime = (time: TimeValues) => { 
    if (time.hrs) {
        const hrs = parseInt(time.hrs);
        if (hrs && hrs < 0 || hrs > 23) return false;
    } 
    if (time.mins) {
        const mins = parseInt(time.mins);
        if (mins && mins < 0 || mins > 59) return false;
    } 
    if (time.secs) {
        const secs = parseInt(time.secs);
        if (secs && secs < 0 || secs > 59) return false;
    } 
    return true;
};
  
type TimeInputProps = {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TimeInput = ({ name, value, onChange }: TimeInputProps) => (
    <input 
        type="number" 
        name={name} 
        value={value} 
        onChange={onChange}  
        className="text-center text-2xl outline-1 outline-[var(--light-modal-border)] rounded-xs no-spinner"
    />
);
 
type TimerFormProps = {
    timer: TimeValues;   
    onCancel: () => void; 
    onSubmit: (time: TimeValues) => void;
};

export const TimerForm  = ({ timer, onCancel, onSubmit }: TimerFormProps) => { 
    const [formData, setFormData] = useState(timer ?? { hrs: "00", mins: "00", secs: "00" }); 
    const [formErr, setFormErr] = useState(""); 

    // ensures input values have max of 2 digits
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target; 
        if (/^\d{0,2}$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value })); 
        }
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();   
        if (isValidTime(formData)) { 
            onSubmit(formData);
        } else {
            setFormErr("Invalid Time");  
        } 
    };

    return ( 
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 pt-0.5">     
            <div className="flex flex-row gap-1 px-2">  
                <TimeInput name="hrs" value={formData.hrs} onChange={handleChange} />
                : 
                <TimeInput name="mins" value={formData.mins} onChange={handleChange} />
                :  
                <TimeInput name="secs" value={formData.secs} onChange={handleChange} />
            </div>
            <FormButtons error={formErr} onCancel={onCancel} /> 
        </form>  
    );
}; 