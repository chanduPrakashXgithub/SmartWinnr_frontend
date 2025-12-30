import { getInitials, getAvatarColor } from '../../utils';

/**
 * Avatar component with fallback to initials
 */
const Avatar = ({
    src,
    name,
    size = 'md',
    status = null,
    className = ''
}) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
    };

    const statusSizeClasses = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
    };

    const statusColorClasses = {
        online: 'bg-green-500',
        offline: 'bg-gray-500',
        away: 'bg-yellow-500',
        busy: 'bg-red-500',
    };

    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);

    return (
        <div className={`relative inline-block ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={`${sizeClasses[size]} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold`}
                >
                    {initials}
                </div>
            )}

            {status && (
                <span
                    className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} ${statusColorClasses[status]} rounded-full ring-2 ring-dark-200`}
                />
            )}
        </div>
    );
};

export default Avatar;
