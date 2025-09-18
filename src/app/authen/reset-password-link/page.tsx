"use client"

import { useEffect, useState } from "react";
import LoadingComponent from "@/component/common/Loading";
import Dialog from "@/component/common/Dialog";
import axios from "axios";
import { redirect } from "next/navigation";
import { REACT_APP_ROOT_BACKEND, resetPassSchema } from "@/component/authen/authentication";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

type ResetPassForm = {
    password: string;
    repassword: string;
};


const ConfirmResetPassword = () => {
    const [isModalConfirmDisp, setIsModalConfirmDisp] = useState(false);
    const [formResetDisp, setFormResetDisp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorSv, setErrorSv] = useState("");
    const [title, setTittle] = useState("");
    const [content, setContent] = useState("");
    const [confirmTitle, setConfirmTitle] = useState("");
    const [emailSent, setEmailSent] = useState<String | null>("");
    const [user, setUser] = useState("");
    const [isConfirmSucces, setIsConfirmSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPassForm>({
        resolver: zodResolver(resetPassSchema),
    });

    useEffect(() => {
        async function handleConfirm() {
            setIsLoading(true);
            const queryParameters = new URLSearchParams(window.location.search);
            const access_token = queryParameters.get("token_access");
            const email = queryParameters.get("email");
            setEmailSent(email);

            const loginInfo = {
                access_token,
                email,
            };

            try {
                if (access_token && email) {
                    const res = await axios.post(
                        `${REACT_APP_ROOT_BACKEND}/auth/confirm-token-access`,
                        loginInfo
                    );
                    if (res.data) {
                        setUser(res.data.user)

                        setIsLoading(false);
                        setFormResetDisp(true);
                    }
                }
            } catch (err: any) {
                setContent("Please check again");
                setConfirmTitle("I agree");
                setIsModalConfirmDisp(true);
                setIsLoading(false);
                setTittle(err?.response?.data?.error || err.message);
            }
        }
        handleConfirm();
    }, []);

    const onSubmit = async (data: ResetPassForm, event: any) => {
        setIsLoading(true);
        event.preventDefault();
        try {
            const res = await axios.post(`${REACT_APP_ROOT_BACKEND}/auth/confirm-new-password`, { password: data.password, emailSent });
            if (res.data.message) {
                setIsConfirmSuccess(true);
                setIsLoading(false);
                return;
            }
        }
        catch (err: any) {
            setErrorSv(err?.response?.data?.error || err?.message);
            setIsLoading(false);
        }
    };

    const confirmToHomePage = () => {
        redirect('/')
    };

    return (
        <>
            <LoadingComponent isLoading={isLoading} />
            {formResetDisp && (
                <>
                    <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex justify-center items-center bg-gray-50/70">
                        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                            <div className="flex flex-end">
                                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center cursor-pointer dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal" onClick={() => setFormResetDisp(false)}>
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>

                            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                                <div className="text-center">
                                    <div className="flex items-center justify-center">
                                        <Image src="/logo.png" alt="open-idear" width={152} height={100} />
                                    </div>
                                </div>
                            </div>


                            {isConfirmSucces ?
                                <>
                                    <div
                                        className="flex bg-white dark:bg-gray-900 items-center px-6 py-4 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500 stroke-current" fill="none"
                                            viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <div className="ml-3">
                                            <div className="font-bold text-left text-gray-500 dark:text-gray-500">Your password has been reset</div>
                                        </div>
                                    </div>
                                    <button onClick={confirmToHomePage}
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Login now
                                    </button>
                                </> :
                                <>
                                    <p className="text-gray-500 text-xl mt-1">
                                        Welcome back
                                    </p>
                                    <p className="text-gray-500 text-xl mt-1">
                                        {user}
                                    </p>
                                    <h4 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                                        Enter your new password
                                    </h4>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6" action="#" method="POST">
                                        <div className="bg-white rounded-lg max-w-md mx-auto py-2">
                                            <div className="relative bg-inherit">
                                                <input
                                                    type="password"
                                                    id="password"
                                                    className="peer bg-transparent h-12 w-full rounded-lg text-gray-900 placeholder-transparent ring-2 ring-gray-300 px-4 focus:ring-sky-500 focus:outline-none focus:border-sky-600 transition-all"
                                                    placeholder="Enter your password"
                                                    required
                                                    {...register("password")} />
                                                {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                                                <label
                                                    htmlFor="password"
                                                    className="absolute cursor-text left-4 -top-3 text-sm text-gray-600 bg-white px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:text-sky-600 peer-focus:text-sm transition-all"
                                                >
                                                    Enter your new password
                                                </label>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg max-w-md mx-auto py-2">
                                            <div className="relative bg-inherit">
                                                <input
                                                    type="password"
                                                    id="repassword"
                                                    className="peer bg-transparent h-12 w-full rounded-lg text-gray-900 placeholder-transparent ring-2 ring-gray-300 px-4 focus:ring-sky-500 focus:outline-none focus:border-sky-600 transition-all"
                                                    placeholder="Confirm your new password"
                                                    required
                                                    {...register("repassword")} />
                                                {errors.repassword && <p className="text-red-500">{errors.repassword.message}</p>}
                                                <label
                                                    htmlFor="repassword"
                                                    className="absolute cursor-text left-4 -top-3 text-sm text-gray-600 bg-white px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:text-sky-600 peer-focus:text-sm transition-all"
                                                >
                                                    Confirm your new password
                                                </label>
                                            </div>
                                        </div>


                                        {errorSv && <p className="text-red-500">{errorSv}</p>}
                                        <div>
                                            <button type="submit"
                                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                Confirm
                                            </button>
                                        </div>
                                    </form>
                                </>}
                        </div>
                    </div>
                </>
            )}
            {
                isModalConfirmDisp && (
                    <Dialog
                        onClose={() => {
                            setIsModalConfirmDisp(false);
                        }}
                        isOpen={isModalConfirmDisp}
                        title={title}
                        message={content}
                        confirmTitle={confirmTitle}
                        confirmAction={confirmToHomePage}
                    />
                )
            }
        </>
    );
};

export default ConfirmResetPassword;