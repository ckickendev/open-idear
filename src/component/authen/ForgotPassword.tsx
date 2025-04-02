import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, REACT_APP_ROOT_BACKEND, signUpSchema } from "./authentication";
import axios from "axios";
import { useState } from "react";

type ForgotPasswordInputs = {
    account: string,
};

type ModalAuthen = {
    setAuthenState: any,
    setIsLoading: any,
    setIsAuthenFromDisplay: any
};

export const ForgotPassword = ({ setAuthenState, setIsLoading, setIsAuthenFromDisplay }: ModalAuthen) => {
    const ROOT_BACKEND = REACT_APP_ROOT_BACKEND;
    const [errorSv, setErrorSv] = useState("");
    const [emailSent, setEmailSent] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordInputs>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordInputs, event: any) => {
        setIsLoading(true);
        event.preventDefault();
        try {
            const res = await axios.post(`${ROOT_BACKEND}/auth/resetpassword`, data);
            setEmailSent(res.data.email);
            setIsLoading(false);
            return;
        }
        catch (err: any) {
            setErrorSv(err?.response?.data?.error || err?.message);
            setIsLoading(false);
        }
    };

    return (
        <>
            <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center cursor-pointer dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal" onClick={() => setIsAuthenFromDisplay(0)}>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
            </button>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <div className="flex items-center justify-center">
                        <img className="w-[152px] h-[100px]" src="/logo.png" alt="open-trash" />
                    </div>
                    {/* <h1 className="text-2xl font-semibold text-blue-600 flex items-center justify-center">
                        <span className="text-3xl font-bold">Open</span>
                        Trash
                    </h1> */}
                    <p className="text-gray-500 text-sm mt-1">
                        Share your idea and knowledge
                    </p>
                </div>

                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Forgot your password
                </h2>
            </div>

            {!emailSent ? <>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" action="#" method="POST">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Your account:
                                </label>
                                <div className="mt-1">
                                    <input id="account" required
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your email or username"
                                        {...register("account")} />
                                    {errors.account && <p className="text-red-500">{errors.account.message}</p>}
                                </div>
                            </div>
                            {errorSv && <p className="text-red-500">{errorSv}</p>}
                            <div>
                                <button type="submit"
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Send email
                                </button>
                            </div>
                        </form>
                        <div className="mt-6">
                            <div className="mt-4 text-center">
                                <p className="text-gray-500 text-sm">
                                    Have your account?
                                    <span onClick={() => setAuthenState(1)} className="text-blue-500 font-medium hover:underline cursor-pointer">Login Now</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </> :
                <>
                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                            <div className="flex-shrink-0 flex items-center justify-center">
                                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-indigo-500 text-white">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>

                            </div>
                            <p className="text-gray-500 text-center my-4">{"We have send email to " + emailSent} </p>
                            <p className="text-gray-500 text-center my-4">{"Please check your email"} </p>
                            <div>
                                <button onClick={() => setAuthenState(1)}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Login Now
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    )
}