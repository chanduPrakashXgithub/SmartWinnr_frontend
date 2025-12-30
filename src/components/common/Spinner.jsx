/**
 * Loading Spinner component
 */
const Spinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-3 border-gray-600 border-t-primary-500 rounded-full animate-spin`}
                style={{ borderWidth: '3px' }}
            />
        </div>
    );
};

/**
 * Full page loading state
 */
export const LoadingScreen = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 bg-dark-200 flex flex-col items-center justify-center z-50">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-400">{message}</p>
        </div>
    );
};

export default Spinner;
