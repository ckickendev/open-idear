import { useState } from "react";
import { DataAuthen, loginSchema } from "./authentication";
import { SignUp } from "./SignUp";
import Login from "./Login";
import LoadingComponent from "../common/Loading";

export const AuthenPage = ({ setIsAuthenFromDisplay }: DataAuthen) => {
    const [authenState, setAuthenState] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const renderCore = () => {
        switch (authenState) {
            case 1: {
                return <Login setAuthenState={setAuthenState} isLoading={isLoading} setIsLoading={setIsLoading} setIsAuthenFromDisplay={setIsAuthenFromDisplay} />;
            }
            case 2: {
                return <SignUp setAuthenState={setAuthenState} isLoading={isLoading} setIsLoading={setIsLoading} setIsAuthenFromDisplay={setIsAuthenFromDisplay} />;
            }
            // case 3: {
            //     return <ResetPassword changeAuthen={changeAuthen} />;
            // }
            // case 4: {
            //     return <ConfirmSignup changeAuthen={changeAuthen} />;
            // }
            default: {
                return <LoadingComponent isLoading={true} />;
            }
        }
    };

    return (

        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex justify-center items-center bg-gray-50/50">
            <div className="relative p-4 w-full max-w-md max-h-full bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                {isLoading && <div className="absolute right-1/2 bottom-1/2 transform translate-x-1/2 translate-y-1/2">
                    <div className="p-4 bg-gradient-to-tr animate-spin from-green-500 to-blue-500 via-purple-500 rounded-full">
                        <div className="bg-white rounded-full">
                            <div className="w-24 h-24 rounded-full"></div>
                        </div>
                    </div>
                </div>}
                {renderCore()}
            </div>
        </div>
    )
}
