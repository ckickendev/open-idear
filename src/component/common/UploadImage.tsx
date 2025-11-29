import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useState } from 'react';

// remove this component, just document
const UploadImage = () => {
    const [resource, setResource] = useState<string | undefined>(undefined);

    return (
        <div className='flex justify-center items-center w-full h-full'>
            <CldUploadWidget
                signatureEndpoint="/api/image_upload"
                onSuccess={(result, { widget }) => {
                    console.log(result);
                    if (typeof result?.info !== 'string') {
                        setResource(result?.info?.url);  // { public_id, secure_url, etc }
                    }
                    widget.close();
                }}

            >
                {({ open }) => {
                    function handleOnClick() {
                        setResource(undefined);
                        open();
                    }
                    return (
                        <>
                            <div className="rounded-md border border-indigo-500 bg-gray-50 p-4 shadow-md w-36">
                                <label htmlFor="upload" className="flex flex-col items-center gap-2 cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 fill-white stroke-indigo-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-gray-600 font-medium">Upload file</span>
                                </label>
                                <button onClick={handleOnClick} id="upload" className="hidden" />
                            </div>
                            
                            {resource && <Image src={resource} alt="Uploaded image" width={100} height={100} />}
                        </>

                    );
                }}
            </CldUploadWidget>
        </div>

    )
}

export default UploadImage;


