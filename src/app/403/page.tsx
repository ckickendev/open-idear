'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">

            {/* Illustration */}
            <div className="mb-10">
                <Image
                    src="/403-illustration.png" // bạn thay bằng image của bạn
                    alt="403 Forbidden"
                    width={500}
                    height={300}
                    className="mx-auto"
                />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                We are Sorry...
            </h1>

            {/* Description */}
            <p className="text-gray-500 max-w-md mb-8">
                The page you're trying to access has restricted access.
                Please refer to your system administrator.
            </p>

            {/* Button */}
            <button
                onClick={() => router.back()}
                className="px-8 py-3 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-md transition duration-200"
            >
                Go Back
            </button>
        </div>
    );
}