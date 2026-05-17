
const LoadingComponent = ({ isLoading, isFullScreen }: any) => {
    if (!isLoading) return null;

    const containerClasses = isFullScreen
        ? 'fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center'
        : 'absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-inherit';

    return (
        <div className={containerClasses}>
            <div className="relative flex flex-col items-center justify-center">
                {/* Modern double spinner */}
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-[var(--color-admin-primary)] rounded-full animate-spin shadow-lg"></div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-[var(--color-admin-primary)] rounded-full animate-pulse blur-[2px]"></div>
                </div>
                {/* Text */}
                <p className="mt-6 text-sm font-extrabold text-[var(--color-admin-primary)] animate-pulse tracking-widest uppercase shadow-sm">
                    Đang tải...
                </p>
            </div>
        </div>
    );
};

export default LoadingComponent;
