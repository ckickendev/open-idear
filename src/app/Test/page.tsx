'use client'

import UploadImage from '@/component/common/UploadImage';
import { useState } from 'react';


const Test = () => {
    const [resource, setResource] = useState(undefined);

    return (
        <>
            <UploadImage />
        </>    

    )
}

export default Test;


