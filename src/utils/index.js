import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';

/**
 * Format date for message timestamps
 */
export const formatMessageTime = (date) => {
    const d = new Date(date);

    if (isToday(d)) {
        return format(d, 'HH:mm');
    }

    if (isYesterday(d)) {
        return `Yesterday ${format(d, 'HH:mm')}`;
    }

    if (isThisWeek(d)) {
        return format(d, 'EEEE HH:mm');
    }

    return format(d, 'dd/MM/yyyy HH:mm');
};

/**
 * Format date for chat list preview
 */
export const formatChatTime = (date) => {
    const d = new Date(date);

    if (isToday(d)) {
        return format(d, 'HH:mm');
    }

    if (isYesterday(d)) {
        return 'Yesterday';
    }

    if (isThisWeek(d)) {
        return format(d, 'EEEE');
    }

    return format(d, 'dd/MM/yy');
};

/**
 * Format relative time
 */
export const formatRelativeTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format last seen time
 */
export const formatLastSeen = (date) => {
    const d = new Date(date);

    if (isToday(d)) {
        return `Last seen today at ${format(d, 'HH:mm')}`;
    }

    if (isYesterday(d)) {
        return `Last seen yesterday at ${format(d, 'HH:mm')}`;
    }

    return `Last seen ${format(d, 'dd/MM/yyyy')}`;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
    if (!name) return '?';

    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file is an image
 */
export const isImageFile = (mimetype) => {
    return mimetype?.startsWith('image/');
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toUpperCase() || 'FILE';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Generate random color for avatar background
 */
export const getAvatarColor = (name) => {
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
    ];

    if (!name) return colors[0];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

/**
 * Get chat room display name
 */
export const getChatRoomName = (room, currentUserId) => {
    if (room.type === 'group') {
        return room.name;
    }

    // For private chats, return the other user's name
    const otherParticipant = room.participants?.find(
        (p) => p.user._id !== currentUserId
    );

    return otherParticipant?.user?.username || 'Unknown';
};

/**
 * Get chat room avatar
 */
export const getChatRoomAvatar = (room, currentUserId) => {
    if (room.type === 'group') {
        return room.avatar;
    }

    const otherParticipant = room.participants?.find(
        (p) => p.user._id !== currentUserId
    );

    return otherParticipant?.user?.avatar;
};

/**
 * Get other user in private chat
 */
export const getOtherUser = (room, currentUserId) => {
    if (room.type !== 'private') return null;

    const otherParticipant = room.participants?.find(
        (p) => p.user._id !== currentUserId
    );

    return otherParticipant?.user;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
