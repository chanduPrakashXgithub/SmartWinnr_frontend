import { useState, useRef, useEffect } from 'react';
import { IoArrowBack, IoCall, IoVideocam, IoEllipsisVertical, IoInformationCircle, IoPersonCircle, IoLogOut, IoSettings } from 'react-icons/io5';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import { getChatRoomName, getChatRoomAvatar, getOtherUser, formatLastSeen } from '../../utils';

/**
 * Chat Header component
 */
const ChatHeader = ({ onBack, onInfoClick, onEditProfile }) => {
    const { currentRoom, typingUsers } = useChat();
    const { user, logout } = useAuth();
    const { isUserOnline } = useSocket();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleVoiceCall = () => {
        alert('Voice call feature will be available in a future update!');
    };

    const handleVideoCall = () => {
        alert('Video call feature will be available in a future update!');
    };

    const handleEditProfile = () => {
        setShowMenu(false);
        if (onEditProfile) {
            onEditProfile();
        }
    };

    const handleSettings = () => {
        setShowMenu(false);
        alert('Settings feature will be available in a future update!');
    };

    const handleLogout = () => {
        setShowMenu(false);
        logout();
    };

    if (!currentRoom) return null;

    const roomName = getChatRoomName(currentRoom, user?._id);
    const roomAvatar = getChatRoomAvatar(currentRoom, user?._id);

    // Get status info for private chats
    const getStatusText = () => {
        if (typingUsers.length > 0) {
            return (
                <span className="text-primary-400">
                    {typingUsers.length === 1
                        ? `${typingUsers[0]} is typing...`
                        : `${typingUsers.length} people are typing...`
                    }
                </span>
            );
        }

        if (currentRoom.type === 'group') {
            const participantCount = currentRoom.participants?.length || 0;
            return `${participantCount} participants`;
        }

        const otherUser = getOtherUser(currentRoom, user?._id);
        if (otherUser) {
            if (isUserOnline(otherUser._id)) {
                return <span className="text-green-400">Online</span>;
            }
            return formatLastSeen(otherUser.lastSeen);
        }

        return '';
    };

    // Get status for avatar
    const getAvatarStatus = () => {
        if (currentRoom.type !== 'private') return null;

        const otherUser = getOtherUser(currentRoom, user?._id);
        if (!otherUser) return 'offline';

        return isUserOnline(otherUser._id) ? 'online' : 'offline';
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-dark-100 border-b border-gray-700">
            <div className="flex items-center gap-3">
                {/* Back button (mobile) */}
                <button
                    onClick={onBack}
                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <IoArrowBack size={24} />
                </button>

                {/* Avatar */}
                <Avatar
                    src={roomAvatar}
                    name={roomName}
                    size="md"
                    status={getAvatarStatus()}
                />

                {/* Room info */}
                <div>
                    <h2 className="font-semibold text-white">{roomName}</h2>
                    <p className="text-sm text-gray-400">{getStatusText()}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={handleVoiceCall}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Voice call"
                >
                    <IoCall size={20} />
                </button>
                <button
                    onClick={handleVideoCall}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Video call"
                >
                    <IoVideocam size={22} />
                </button>
                <button
                    onClick={onInfoClick}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Chat info"
                >
                    <IoInformationCircle size={22} />
                </button>

                {/* More Options Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="More options"
                    >
                        <IoEllipsisVertical size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-dark-200 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                            <button
                                onClick={handleEditProfile}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <IoPersonCircle size={18} />
                                Edit Profile
                            </button>
                            <button
                                onClick={handleSettings}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <IoSettings size={18} />
                                Settings
                            </button>
                            <div className="border-t border-gray-700 my-1" />
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                            >
                                <IoLogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
