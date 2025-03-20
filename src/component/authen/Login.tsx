import { useState } from "react";
import axios from "axios";
import CONFIG from "./config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataAuthen, loginSchema } from "./authentication";
import { SignUp } from "./SignUp";
import LoadingComponent from "../common/Loading";

type LoginFormInputs = {
    username: string;
    password: string;
};

export const LoginPage = ({ setIsAuthenFromDisplay }: DataAuthen) => {
    const ROOT_BACKEND = CONFIG.REACT_APP_ROOT_BACKEND;
    const [mode, setMode] = useState(1);
    const [errorSv, setErrorSv] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormInputs, event: any) => {
        event.preventDefault();
        setIsLoading(true);

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
            setIsLoading(false);
            setErrorSv(err?.response?.data?.error || err?.message);
        }
    };

    return (

        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex justify-center items-center bg-gray-50/50">
            {mode == 1 ?
                <div className="relative p-4 w-full max-w-md max-h-full bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

                    <LoadingComponent isLoading={isLoading} />

                    <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center cursor-pointer dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal" onClick={() => setIsAuthenFromDisplay(false)}>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 max-w">
                            Or
                            <span onClick={() => setMode(2)} className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                                &nbsp; create an account
                            </span>
                        </p>
                    </div>

                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" action="#" method="POST">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email address
                                    </label>
                                    <div className="mt-1">
                                        <input id="email" type="email" autoComplete="email" required
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                            placeholder="Enter your email address"
                                            {...register("username")} />
                                        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1">
                                        <input id="password" type="password" autoComplete="current-password" required
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                            placeholder="Enter your password"
                                            {...register("password")} />
                                        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input id="remember_me" name="remember_me" type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                        <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                            Forgot your password?
                                        </a>
                                    </div>
                                </div>
                                {errorSv && <p className="text-red-500">{errorSv}</p>}
                                <div>
                                    <button type="submit"
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Sign in
                                    </button>
                                </div>
                            </form>
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
                </div> : <SignUp setMode={setMode} setIsAuthenFromDisplay={setIsAuthenFromDisplay} />
            }
        </div>
    )
}
