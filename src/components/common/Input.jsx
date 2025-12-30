import { forwardRef } from 'react';

/**
 * Reusable Input component
 */
const Input = forwardRef(({
    label,
    type = 'text',
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    ...props
}, ref) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    className={`
            w-full bg-dark-100 border rounded-lg text-white placeholder-gray-500
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-colors duration-200
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            ${error ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'}
          `}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                        {rightIcon}
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-400'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
