import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, REACT_APP_ROOT_BACKEND } from "./authentication";
import axios from "axios";
import { useState } from "react";
import authenticationStore from "@/store/AuthenticationStore";
import Image from "next/image";
import { useTranslation } from "@/app/hook/useTranslation";

type LoginFormInputs = {
    account: string;
    password: string;
};

type ModalAuthen = {
    setAuthenState: any,
    setIsLoading: any,
    setIsAuthenFromDisplay: any
};

const Login = ({ setAuthenState, setIsLoading, setIsAuthenFromDisplay }: ModalAuthen) => {
    const { t } = useTranslation();
    const setCurrentUser = authenticationStore((state) => state.setCurrentUser);
    const setCurrentUserId = authenticationStore((state) => state.setCurrentUserID);
    const [errorSv, setErrorSv] = useState("");

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
        console.log(data);
        event.preventDefault();
        try {
            const res = await axios.post(`${REACT_APP_ROOT_BACKEND}/auth/login`, data);
            if (res.data) {
                localStorage.setItem("access_token", res.data.data.access_token);
                setCurrentUser(res.data.data.user);
                setCurrentUserId(res.data.data.user._id);
                setIsLoading(false);
                setIsAuthenFromDisplay(false);
                setAuthenState(0);
            }
            return;
        }
        catch (err: any) {
            setIsLoading(false);
            setErrorSv(err?.response?.data?.error || err?.message);
        }
    };

    return <>
        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center cursor-pointer dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal" onClick={() => setIsAuthenFromDisplay(false)}>
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span className="sr-only">{t("component.authen.login.close")}</span>
        </button>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex items-center justify-center">
                <Image src="/logo.png" alt="open-idear" width={152} height={100} />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {t("component.authen.login.title")}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 max-w">
                <span onClick={() => setAuthenState(2)} className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                    &nbsp;{t("component.authen.login.create")}
                </span>
            </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" action="#" method="POST">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            {t("component.authen.login.useroremail")}
                        </label>
                        <div className="mt-1">
                            <input id="email" type="email" autoComplete="email" required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder={t("component.authen.login.useroremail_placeholder")}
                                {...register("account")} />
                            {errors.account && <p className="text-red-500">{errors.account.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            {t("component.authen.login.password")}
                        </label>
                        <div className="mt-1">
                            <input id="password" type="password" autoComplete="current-password" required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder={t("component.authen.login.password_placeholder")}
                                {...register("password")} />
                            {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember_me" name="remember_me" type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                                {t("component.authen.login.remember")}
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500" onClick={() => setAuthenState(4)}>
                                {t("component.authen.login.forgot")}
                            </a>
                        </div>
                    </div>
                    {errorSv && <p className="text-red-500">{errorSv}</p>}
                    <div>
                        <button type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {t("component.authen.login.signIn")}
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
                                {t("component.authen.login.continue")}
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

export default Login;