import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, REACT_APP_ROOT_BACKEND } from "./authentication";
import axios from "axios";
import { useRef, useState } from "react";



type ModalAuthen = {
    setAuthenState: any,
    setIsLoading: any,
    setIsAuthenFromDisplay: any
};

const ConfirmSignUp = ({ setAuthenState, setIsLoading, setIsAuthenFromDisplay }: ModalAuthen) => {
    const inputRef1 = useRef(null);
    const inputRef2 = useRef(null);
    const inputRef3 = useRef(null);
    const inputRef4 = useRef(null);
    const inputRef5 = useRef(null);
    const inputRef6 = useRef(null);
    const submit = useRef(null);
    const [errorSv, setErrorSv] = useState("");

    const onSubmit = async (event: any) => {
        event.preventDefault();
        setIsLoading(true);

        const token = inputRef1.current.value + inputRef2.current.value + inputRef3.current.value
            + inputRef4.current.value + inputRef5.current.value + inputRef6.current.value;
        if (!new RegExp(`^[0-9]{${6}}$`).test(token)) {
            setErrorSv("Your token is not valid format, please enter again");
            setIsLoading(false);
            return;
        }

        try {
            const loginInfo = {
                token,
                user_authen: localStorage.getItem("user_signup"),
            };
            console.log(loginInfo);

            const res = await axios.post(
                `${REACT_APP_ROOT_BACKEND}/auth/confirmSignup`,
                loginInfo
            );
            setErrorSv(res.data.message);
            if (res.status === 200) {
                setIsLoading(false);
                localStorage.removeItem("user_signup");
                setIsLoading(true);
                setTimeout(() => {

                    setAuthenState(1);
                    setIsLoading(false);
                }, 5000);
            }
        }
        catch (err: any) {
            setIsLoading(false);
            setErrorSv(err?.response?.data?.error || err?.message);
        }
    };

    const handleInput = (e: any, index: number) => {
        setErrorSv("");
        const { target } = e
        if (target.value) {
            if (index < 6) {
                switch (index) {
                    case 1:
                        inputRef2.current.focus();
                        break
                    case 2:
                        inputRef3.current.focus();
                        break;
                    case 3:
                        inputRef4.current.focus();
                        break;
                    case 4:
                        inputRef5.current.focus();
                        break;
                    case 5:
                        inputRef6.current.focus();
                        break;
                }
            } else {
                submit.current.focus();
            }
        }
    }

    const handlePaste = (e: any) => {
        e.preventDefault();
        setErrorSv("");
        const text = e.clipboardData.getData('text')
        if (!new RegExp(`^[0-9]{${6}}$`).test(text)) {
            setErrorSv("Cannot paste, invalid data")
            return
        }
        const digits = text.split('')
        inputRef1.current.value = digits[0];
        inputRef2.current.value = digits[1];
        inputRef3.current.value = digits[2];
        inputRef4.current.value = digits[3];
        inputRef5.current.value = digits[4];
        inputRef6.current.value = digits[5];

        submit.current.focus()
    }

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
                Confirm your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 max-w">
                Check your email and enter code here
            </p>
            <p className="mt-2 text-center text-sm text-gray-600 max-w">
                Or you can skip
                <span onClick={() => setAuthenState(2)} className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                    &nbsp; right now
                </span>
            </p>
        </div>
        {/* text-center px-4 sm:px-8 py-10 rounded-xl */}
        <div className="max-w-md mx-auto text-center py-10 rounded-xl">
            <form id="otp-form">
                <div className="flex items-center justify-center gap-2">
                    <input
                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-white border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        pattern="\d*" maxLength={1}
                        onInput={(e) => handleInput(e, 1)}
                        onPaste={handlePaste}
                        ref={inputRef1} />
                    <input
                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-white border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength={1}
                        onInput={(e) => handleInput(e, 2)}
                        ref={inputRef2} />
                    <input
                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-white border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength={1}
                        onInput={(e) => handleInput(e, 3)}
                        ref={inputRef3} />
                    <input
                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-white border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength={1}
                        onInput={(e) => handleInput(e, 4)}
                        ref={inputRef4} />
                    <input
                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-white border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength={1}
                        onInput={(e) => handleInput(e, 5)}
                        ref={inputRef5} />
                    <input
                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-white border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength={1}
                        onInput={(e) => handleInput(e, 6)}
                        ref={inputRef6} />
                </div>
                {errorSv && <p className="text-red-500">{errorSv}</p>}

                <div className="max-w-[260px] mx-auto mt-4">
                    <button type="submit"
                        onClick={onSubmit}
                        ref={submit}
                        className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:bg-red focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150">Verify
                        Account</button>
                </div>
            </form>
            <div className="text-sm text-slate-500 mt-4">Didn't receive code? <a className="font-medium text-indigo-500 hover:text-indigo-600" href="#0">Resend</a></div>
        </div>

    </>
}

export default ConfirmSignUp;