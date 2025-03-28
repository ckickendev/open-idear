import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, REACT_APP_ROOT_BACKEND } from "./authentication";
import axios from "axios";
import { useState } from "react";



type ModalAuthen = {
    setAuthenState: any,
    setIsLoading: any,
    setIsAuthenFromDisplay: any
};

const ConfirmSignUp = ({ setAuthenState, setIsLoading, setIsAuthenFromDisplay }: ModalAuthen) => {
    const [errorSv, setErrorSv] = useState("");


    // const onSubmit = async (data: TokenConfirm, event: any) => {
    //     event.preventDefault();
    //     setIsLoading(true);
    //     console.log(data);
    //     event.preventDefault();
    //     try {
    //         const res = await axios.post(`${REACT_APP_ROOT_BACKEND}/auth/login`, data);
    //         if (res.data) {
    //             localStorage.setItem("access_token", res.data.data.access_token);
    //             setIsLoading(false);
    //         }
    //         return;
    //     }
    //     catch (err: any) {
    //         setIsLoading(false);
    //         setErrorSv(err?.response?.data?.error || err?.message);
    //     }
    // };

    return <>
        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center cursor-pointer dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal" onClick={() => setIsAuthenFromDisplay(false)}>
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span className="sr-only">Close modal</span>
        </button>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex items-center justify-center">
                <img className="w-[152px] h-[100px]" src="/logo.png" alt="open-trash" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 max-w">
                Or
                <span onClick={() => setAuthenState(2)} className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                    &nbsp; create an account
                </span>
            </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                <div className="mt-6">

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-100 text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="h-full">
                            <a href="#"
                                className="h-full w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <img className="h-5 w-5" src="https://www.svgrepo.com/show/512120/facebook-176.svg"
                                    alt="" />
                            </a>
                        </div>
                        <div className="h-full">
                            <a href="#"
                                className="h-full w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <img className="h-5 w-5" src="https://www.svgrepo.com/show/513008/twitter-154.svg"
                                    alt="" />
                            </a>
                        </div>
                        <div className="h-full">
                            <a href="#"
                                className="h-full w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <img className="h-6 w-6" src="https://www.svgrepo.com/show/506498/google.svg"
                                    alt="" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default ConfirmSignUp;