import { useState } from "react";
import { DataAuthen, loginSchema } from "./authentication";
import { SignUp } from "./SignUp";
import Login from "./Login";
import LoadingComponent from "../common/Loading";
import ConfirmSignUp from "./ConfirmSignUp";
import { ForgotPassword } from "./ForgotPassword";

export const AuthenPage = ({ setIsAuthenFromDisplay }: DataAuthen) => {
    const [authenState, setAuthenState] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const renderCore = () => {
        switch (authenState) {
            case 1: {
                return <Login setAuthenState={setAuthenState} setIsLoading={setIsLoading} setIsAuthenFromDisplay={setIsAuthenFromDisplay} />;
            }
            case 2: {
                return <SignUp setAuthenState={setAuthenState} setIsLoading={setIsLoading} setIsAuthenFromDisplay={setIsAuthenFromDisplay} />;
            }
            case 3: {
                return <ConfirmSignUp setAuthenState={setAuthenState} setIsLoading={setIsLoading} setIsAuthenFromDisplay={setIsAuthenFromDisplay} />
            }
            case 4: {
                return <ForgotPassword setAuthenState={setAuthenState} setIsLoading={setIsLoading} setIsAuthenFromDisplay={setIsAuthenFromDisplay} />
            }
            default: {
                return <></>
            }
        }
    };

    return (
        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex justify-center items-center bg-gray-50/50">
            <div className='relative p-4 w-full max-w-md max-h-full bg-gray-100 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8'>
                <LoadingComponent isLoading={isLoading} />
                {renderCore()}
            </div>
        </div>
    )
}
