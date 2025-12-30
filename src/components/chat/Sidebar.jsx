import { useEffect, useState } from 'react';
import { IoSearch, IoAdd, IoEllipsisVertical } from 'react-icons/io5';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import { formatChatTime, getChatRoomName, getChatRoomAvatar, getOtherUser, truncateText } from '../../utils';

/**
 * Sidebar component - displays chat list
 */
const Sidebar = ({ onNewChat, onMobileClose }) => {
    const { chatRooms, currentRoom, selectRoom, fetchChatRooms, loading } = useChat();
    const { user } = useAuth();
    const { isUserOnline } = useSocket();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRooms, setFilteredRooms] = useState([]);

    // Fetch chat rooms on mount
    useEffect(() => {
        fetchChatRooms();
    }, [fetchChatRooms]);

    // Filter rooms based on search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredRooms(chatRooms);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = chatRooms.filter((room) => {
            const name = getChatRoomName(room, user?._id).toLowerCase();
            return name.includes(query);
        });

        setFilteredRooms(filtered);
    }, [searchQuery, chatRooms, user]);

    // Handle room selection
    const handleSelectRoom = (room) => {
        selectRoom(room);
        if (onMobileClose) {
            onMobileClose();
        }
    };

    // Get status for private chat
    const getRoomStatus = (room) => {
        if (room.type !== 'private') return null;

        const otherUser = getOtherUser(room, user?._id);
        if (!otherUser) return 'offline';

        return isUserOnline(otherUser._id) ? 'online' : 'offline';
    };

    // Get last message preview
    const getLastMessagePreview = (room) => {
        if (!room.lastMessage) return 'No messages yet';

        const sender = room.lastMessage.sender?.username;
        const content = room.lastMessage.content;

        if (room.lastMessage.messageType === 'image') {
            return sender ? `${sender}: 📷 Photo` : '📷 Photo';
        }

        if (room.lastMessage.messageType === 'file') {
            return sender ? `${sender}: 📎 File` : '📎 File';
        }

        if (room.type === 'group' && sender) {
            return `${sender}: ${truncateText(content, 30)}`;
        }

        return truncateText(content, 40);
    };

    return (
        <div className="h-full flex flex-col bg-dark-100">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-white">Chats</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onNewChat}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="New Chat"
                        >
                            <IoAdd size={24} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                            <IoEllipsisVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-dark-200 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="spinner" />
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        {searchQuery ? 'No chats found' : 'No chats yet. Start a new conversation!'}
                    </div>
                ) : (
                    <ul>
                        {filteredRooms.map((room) => (
                            <li key={room._id}>
                                <button
                                    onClick={() => handleSelectRoom(room)}
                                    className={`w-full flex items-center gap-3 p-4 hover:bg-dark-200 transition-colors ${currentRoom?._id === room._id ? 'bg-dark-200' : ''
                                        }`}
                                >
                                    <Avatar
                                        src={getChatRoomAvatar(room, user?._id)}
                                        name={getChatRoomName(room, user?._id)}
                                        size="lg"
                                        status={getRoomStatus(room)}
                                    />

                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-white truncate">
                                                {getChatRoomName(room, user?._id)}
                                            </h3>
                                            {room.lastMessage && (
                                                <span className="text-xs text-gray-400">
                                                    {formatChatTime(room.lastMessage.createdAt || room.updatedAt)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-sm text-gray-400 truncate">
                                                {getLastMessagePreview(room)}
                                            </p>

                                            {room.unreadCount > 0 && (
                                                <span className="min-w-[20px] h-5 px-1.5 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                                    {room.unreadCount > 99 ? '99+' : room.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
