"use client"

import { useEffect, useState } from "react";
import LoadingComponent from "@/component/common/Loading";
import Dialog from "@/component/common/Dialog";
import axios from "axios";
import { redirect } from "next/navigation";
import { REACT_APP_ROOT_BACKEND } from "@/component/authen/authentication";

const ConfirmResetPassword = () => {
    const [isModalConfirmDisp, setIsModalConfirmDisp] = useState(false);
    const [formResetDisp, setFormResetDisp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTittle] = useState("");
    const [content, setContent] = useState("");
    const [confirmTitle, setConfirmTitle] = useState("");

    useEffect(() => {
        async function handleConfirm() {
            setIsLoading(true);
            const queryParameters = new URLSearchParams(window.location.search);
            const access_token = queryParameters.get("token_access");
            const email = queryParameters.get("email");

            const loginInfo = {
                access_token,
                email,
            };
            console.log("loginInfo", loginInfo);

            try {
                if (access_token && email) {
                    const res = await axios.post(
                        `${REACT_APP_ROOT_BACKEND}/auth/confirm-token-access`,
                        loginInfo
                    );
                    if (res.data) {
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
    });

    const resetPasswordHandler = () => {
        // if (res.data) {
        //     setTittle(res.data.message);
        //     setContent(
        //         "You can login right now, you will redirect to login in some minutes..."
        //     );
        //     setIsConfirm(true);
        //     setConfirmTitle("Go to home now");
        //     setTimeout(() => {
        //         redirect("/");
        //     }, 3000);
        // }
    }

    const confirmToHomePage = () => {
        redirect('/')
    };

    return (
        <>
            <LoadingComponent isLoading={isLoading} />
            {isModalConfirmDisp && (
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
            )}
        </>
    );
};

export default ConfirmResetPassword;