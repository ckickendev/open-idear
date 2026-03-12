"use client"

import { useEffect, useState } from "react";
import LoadingComponent from "@/components/common/Loading";
import Dialog from "@/components/common/Dialog";
import { authApi } from '@/features/auth/api/auth.api';
import { redirect } from "next/navigation";

const ConfirmSignUpByLink = () => {
    const [isConfirm, setIsConfirm] = useState(false);
    const [title, setTittle] = useState("");
    const [content, setContent] = useState("");
    const [confirmTitle, setConfirmTitle] = useState("");

    useEffect(() => {
        async function handleConfirm() {
            const queryParameters = new URLSearchParams(window.location.search);
            const access_token = queryParameters.get("access_token");
            const email = queryParameters.get("email");
            
            const loginInfo = {
                token: access_token,
                user_authen: email,
            };
            console.log("loginInfo", loginInfo);

            try {
                if (access_token && email) {
                    const res = await authApi.confirmRegister(loginInfo);
                    if (res.success) {
                        setTittle(res.message || "Confirmed successfully!");
                        setContent(
                            "You can login right now, you will redirect to login in some minutes..."
                        );
                        setIsConfirm(true);
                        setConfirmTitle("Go to home now");
                        setTimeout(() => {
                            redirect("/");
                        }, 3000);
                    } else {
                        throw new Error(res.message);
                    }
                }
            } catch (err: any) {
                setContent("Please check again");
                setConfirmTitle("I agree");
                setIsConfirm(true);
                setTittle(err?.response?.data?.error || err.message);
            }
        }
        handleConfirm();
    });

    const confirmToHomePage = () => {
        redirect('/')
    };

    return (
        <>
            <LoadingComponent isLoading={!isConfirm} />
            {isConfirm && (
                <Dialog
                    onClose={() => {
                        setIsConfirm(false);
                    }}
                    isOpen={isConfirm}
                    title={title}
                    message={content}
                    confirmTitle={confirmTitle}
                    confirmAction={confirmToHomePage}
                />
            )}
        </>
    );
};

export default ConfirmSignUpByLink;