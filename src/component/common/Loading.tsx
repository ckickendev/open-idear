
const LoadingComponent = ({ isLoading }: any) => {
    const renderLoading = () => {
        if (isLoading) {
            return <div className="absolute right-0 bottom-0 w-full h-full z-1 bg-gray-300/30" >
                <div className="absolute right-1/2 bottom-1/2 transform translate-x-1/2 translate-y-1/2">
                    <div className="p-4 bg-gradient-to-tr animate-spin from-green-500 to-blue-500 via-purple-500 rounded-full">
                        <div className="bg-gray-800/30 rounded-full">
                            <div className="w-24 h-24 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div >
        }
    }

    return <>
        {{renderLoading}}
    </>

}

export default LoadingComponent;
