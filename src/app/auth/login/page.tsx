"use client" 
import { useRef, useState } from "react"
import { login, signup } from "./actions";  
import { FormButtons, FormInputWrapper } from "@/components/forms/FormDialog";

type TabProps = {  
    id: string;
    label: string; 
    selected: boolean;
    onClick: () => void;
};

const Tab = ({ id, label, selected, onClick }: TabProps ) => ( 
    <h2 
        id={id}
        onClick={onClick}
        className={`min-w-1/2 px-10 py-1 text-xs text-center whitespace-nowrap rounded-sm cursor-pointer
            ${ selected && "bg-[var(--primary))] text-[var(--primary-foreground)]" }
        `}
    > 
        {label}
    </h2> 
);

const isValidEmail = (str: string) => /.+@.+\..+/.test(str);
 
const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formErr, setFormErr] = useState("");
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const switchTab = (setLogin: boolean) => {
        if (formErr !== "") setFormErr("");
        setIsLogin(setLogin);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormErr("");
        try {
            const email = emailRef.current?.value;
            const password = passwordRef.current?.value;  
            if (!email || !password) {
                setFormErr("Email and password required");
                return;
            } 
            if (!isValidEmail(email)) {
                setFormErr("Invalid email");
                return;
            }      
            const authenticate = isLogin ? login : signup;
            await authenticate({ email: email, password: password });
        } catch {    
            setFormErr("Something went wrong. Please try again."); 
        } 
    }; 

    return (
        <div className="flex w-full h-full"> 
            <div className="flex flex-col items-center m-auto p-6 bg-[var(--modal-background)] rounded-sm">  
                <h1 className="text-2xl font-semibold mb-4"> Welcome </h1> 
                <form 
                    onSubmit={e => handleSubmit(e)} 
                    aria-labelledby={isLogin ? "login-title" : "signup-title"}
                    className="flex flex-col items-start gap-5"
                >   
                    <div className="flex flex-row p-0.75 bg-[var(--light-modal-background)] rounded-md">
                        <Tab 
                            id="signup-title" 
                            label="Sign Up" 
                            selected={!isLogin} 
                            onClick={() => switchTab(false)} 
                        />
                        <Tab 
                            id="login-title" 
                            label="Login" 
                            selected={isLogin} 
                            onClick={() => switchTab(true)} 
                        /> 
                    </div>  
                    <FormInputWrapper label="Email" inputId="email">
                        <input id="email" ref={emailRef} className="text-xs"/>
                    </FormInputWrapper>  
                    <FormInputWrapper label="Password" inputId="password">
                        <input id="password" ref={passwordRef} type="password" className="text-xs"/>
                    </FormInputWrapper>  
                    <FormButtons error={formErr} className="text-[0.8rem] py-2"/> 
                </form>
            </div> 
        </div> 
    );
}; 

export default LoginPage;