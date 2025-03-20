import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "./authentication";
import CONFIG from "./config";
import axios from "axios";
import { useState } from "react";

type SignUpInputs = {
    email: string,
    username: string;
    password: string;
    repassword: string;
};

export const SignUp = ({ setMode, setIsAuthenFormDisplay }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const ROOT_BACKEND = CONFIG.REACT_APP_ROOT_BACKEND;
    const [errorSv, setErrorSv] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpInputs>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpInputs, event: any) => {
        event.preventDefault();
        console.log("event:", event);
        console.log("Validated Data:", data);
        event.preventDefault();
        console.log("event:", event);
        console.log("Validated Data:", data);
        try {
            const res = await axios.post(`${ROOT_BACKEND}/auth/login`, data);
            if (res.data) {
                localStorage.setItem("access_token", res.data.data.access_token);
            }
            return;
        }
        catch (err: any) {
            setErrorSv(err?.response?.data?.error || err?.message);
        }
    };

    return (
        <div className="relative p-4 w-full max-w-md max-h-full bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {isLoading ? <div className="absolute right-1/2 bottom-1/2 transform translate-x-1/2 translate-y-1/2">
                <div className="p-4 bg-gradient-to-tr animate-spin from-green-500 to-blue-500 via-purple-500 rounded-full">
                    <div className="bg-white rounded-full">
                        <div className="w-24 h-24 rounded-full"></div>
                    </div>
                </div>
            </div> :
                <>
                    <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center cursor-pointer dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal" onClick={() => setIsAuthenFormDisplay(false)}>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="text-center">
                            <h1 className="text-2xl font-semibold text-blue-600 flex items-center justify-center">
                                <span className="text-3xl font-bold">Open</span>
                                Trash
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Share your idea and knowledge
                            </p>
                        </div>

                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Register your account
                        </h2>
                    </div>

                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                            <form className="space-y-6" action="#" method="POST">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email address
                                    </label>
                                    <div className="mt-1">
                                        <input id="email" name="email" type="email" autoComplete="email" required
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                            placeholder="Enter your email address" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Username
                                    </label>
                                    <div className="mt-1">
                                        <input id="username" name="username" type="text" autoComplete="username" required
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                            placeholder="Enter your password" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1">
                                        <input id="password" name="password" type="password" autoComplete="current-password" required
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                            placeholder="Enter your password" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Confirm password
                                    </label>
                                    <div className="mt-1">
                                        <input id="re-password" name="re-password" type="password" autoComplete="re-password" required
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                            placeholder="Re-Enter your password" />
                                    </div>
                                </div>
                                {errorSv && <p className="text-red-500">{errorSv}</p>}
                                <div>
                                    <button type="submit"
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Sign Up
                                    </button>
                                </div>
                            </form>
                            <div className="mt-6">
                                <div className="mt-4 text-center">
                                    <p className="text-gray-500 text-sm">
                                        Have your account?
                                        <span onClick={() => setMode(1)} className="text-blue-500 font-medium hover:underline cursor-pointer">Login Now</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>}
        </div>
    )
}