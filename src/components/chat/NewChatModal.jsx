import { useState, useEffect, useCallback } from 'react';
import { IoSearch, IoClose, IoPeople, IoPersonAdd } from 'react-icons/io5';
import { userService } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import { useDebounce } from '../../hooks';

/**
 * New Chat Modal - for creating private chats or groups
 */
const NewChatModal = ({ isOpen, onClose }) => {
    const { createPrivateChat, createGroupChat, selectRoom } = useChat();
    const { isUserOnline } = useSocket();

    const [mode, setMode] = useState('private'); // 'private' or 'group'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [creating, setCreating] = useState(false);

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (!debouncedSearch.trim() || debouncedSearch.length < 2) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await userService.searchUsers(debouncedSearch);
                setSearchResults(response.data.users);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };

        searchUsers();
    }, [debouncedSearch]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setMode('private');
            setSearchQuery('');
            setSearchResults([]);
            setSelectedUsers([]);
            setGroupName('');
            setGroupDescription('');
        }
    }, [isOpen]);

    // Handle user selection for private chat
    const handleUserClick = async (user) => {
        if (mode === 'private') {
            setCreating(true);
            try {
                const room = await createPrivateChat(user._id);
                if (room) {
                    selectRoom(room);
                    onClose();
                }
            } finally {
                setCreating(false);
            }
        } else {
            // Toggle user selection for group
            setSelectedUsers((prev) => {
                const isSelected = prev.find((u) => u._id === user._id);
                if (isSelected) {
                    return prev.filter((u) => u._id !== user._id);
                }
                return [...prev, user];
            });
        }
    };

    // Create group chat
    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;

        setCreating(true);
        try {
            const room = await createGroupChat({
                name: groupName.trim(),
                description: groupDescription.trim(),
                participants: selectedUsers.map((u) => u._id),
            });

            if (room) {
                selectRoom(room);
                onClose();
            }
        } finally {
            setCreating(false);
        }
    };

    // Check if user is selected
    const isUserSelected = (userId) => {
        return selectedUsers.some((u) => u._id === userId);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Chat" size="md">
            {/* Mode tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setMode('private')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${mode === 'private'
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-200 text-gray-400 hover:text-white'
                        }`}
                >
                    <IoPersonAdd size={20} />
                    <span>Private Chat</span>
                </button>
                <button
                    onClick={() => setMode('group')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${mode === 'group'
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-200 text-gray-400 hover:text-white'
                        }`}
                >
                    <IoPeople size={20} />
                    <span>New Group</span>
                </button>
            </div>

            {/* Group details (only for group mode) */}
            {mode === 'group' && (
                <div className="space-y-3 mb-4">
                    <Input
                        label="Group Name"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    <Input
                        label="Description (optional)"
                        placeholder="What's this group about?"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                    />

                    {/* Selected users */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 bg-dark-200 rounded-lg">
                            {selectedUsers.map((user) => (
                                <span
                                    key={user._id}
                                    className="flex items-center gap-1 px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm"
                                >
                                    {user.username}
                                    <button
                                        onClick={() => handleUserClick(user)}
                                        className="hover:text-white"
                                    >
                                        <IoClose size={16} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Search input */}
            <div className="relative mb-4">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark-200 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                />
            </div>

            {/* Search results */}
            <div className="max-h-64 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Spinner />
                    </div>
                ) : searchResults.length > 0 ? (
                    <ul className="space-y-1">
                        {searchResults.map((user) => (
                            <li key={user._id}>
                                <button
                                    onClick={() => handleUserClick(user)}
                                    disabled={creating}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${isUserSelected(user._id)
                                            ? 'bg-primary-600/20'
                                            : 'hover:bg-dark-200'
                                        }`}
                                >
                                    <Avatar
                                        src={user.avatar}
                                        name={user.username}
                                        size="md"
                                        status={isUserOnline(user._id) ? 'online' : 'offline'}
                                    />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-white">{user.username}</p>
                                        <p className="text-sm text-gray-400">{user.email}</p>
                                    </div>
                                    {mode === 'group' && isUserSelected(user._id) && (
                                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                                            <IoClose size={14} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : searchQuery.length >= 2 ? (
                    <p className="text-center text-gray-400 py-8">No users found</p>
                ) : (
                    <p className="text-center text-gray-400 py-8">
                        Type at least 2 characters to search
                    </p>
                )}
            </div>

            {/* Create group button */}
            {mode === 'group' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <Button
                        onClick={handleCreateGroup}
                        disabled={!groupName.trim() || selectedUsers.length === 0 || creating}
                        loading={creating}
                        fullWidth
                    >
                        Create Group ({selectedUsers.length} members)
                    </Button>
                </div>
            )}
        </Modal>
    );
};

export default NewChatModal;
