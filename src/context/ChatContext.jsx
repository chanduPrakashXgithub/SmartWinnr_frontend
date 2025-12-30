import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { chatRoomService, messageService } from '../services/api';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

// Create Chat Context
const ChatContext = createContext(null);

// Chat Provider Component
export const ChatProvider = ({ children }) => {
    const { socket, isConnected, joinRoom, leaveRoom } = useSocket();
    const { user } = useAuth();

    const [chatRooms, setChatRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user's chat rooms
    const fetchChatRooms = useCallback(async () => {
        setLoading(true);
        try {
            const response = await chatRoomService.getChatRooms();
            setChatRooms(response.data.chatRooms);
        } catch (err) {
            console.error('Error fetching chat rooms:', err);
            setError('Failed to fetch chat rooms');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages for a room
    const fetchMessages = useCallback(async (roomId, page = 1) => {
        try {
            const response = await messageService.getMessages(roomId, { page, limit: 50 });
            return response.data.messages;
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to fetch messages');
            return [];
        }
    }, []);

    // Select a chat room
    const selectRoom = useCallback(async (room) => {
        // Leave previous room
        if (currentRoom) {
            leaveRoom(currentRoom._id);
        }

        setCurrentRoom(room);
        setMessages([]);
        setLoading(true);

        try {
            // Fetch messages for the room
            const roomMessages = await fetchMessages(room._id);
            setMessages(roomMessages);

            // Join the new room
            joinRoom(room._id);

            // Mark as read
            await chatRoomService.markAsRead(room._id);

            // Update unread count in chat rooms list
            setChatRooms((prev) =>
                prev.map((r) =>
                    r._id === room._id ? { ...r, unreadCount: 0 } : r
                )
            );
        } catch (err) {
            console.error('Error selecting room:', err);
            setError('Failed to load chat');
        } finally {
            setLoading(false);
        }
    }, [currentRoom, leaveRoom, joinRoom, fetchMessages]);

    // Create private chat
    const createPrivateChat = useCallback(async (userId) => {
        try {
            const response = await chatRoomService.createPrivateChat(userId);
            const newRoom = response.data.chatRoom;

            // Add to rooms if not exists
            setChatRooms((prev) => {
                const exists = prev.find((r) => r._id === newRoom._id);
                if (exists) return prev;
                return [newRoom, ...prev];
            });

            return newRoom;
        } catch (err) {
            console.error('Error creating private chat:', err);
            setError('Failed to create chat');
            return null;
        }
    }, []);

    // Create group chat
    const createGroupChat = useCallback(async (groupData) => {
        try {
            const response = await chatRoomService.createGroupChat(groupData);
            const newRoom = response.data.chatRoom;

            setChatRooms((prev) => [newRoom, ...prev]);
            return newRoom;
        } catch (err) {
            console.error('Error creating group:', err);
            setError('Failed to create group');
            return null;
        }
    }, []);

    // Add message to state
    const addMessage = useCallback((message) => {
        setMessages((prev) => [...prev, message]);

        // Update last message in chat rooms
        setChatRooms((prev) =>
            prev.map((room) => {
                if (room._id === message.chatRoom) {
                    return {
                        ...room,
                        lastMessage: message,
                        updatedAt: message.createdAt,
                    };
                }
                return room;
            })
        );
    }, []);

    // Update message in state
    const updateMessage = useCallback((updatedMessage) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg._id === updatedMessage._id ? updatedMessage : msg
            )
        );
    }, []);

    // Remove message from state
    const removeMessage = useCallback((messageId) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg._id === messageId
                    ? { ...msg, isDeleted: true, content: 'This message has been deleted' }
                    : msg
            )
        );
    }, []);

    // Socket event handlers
    useEffect(() => {
        if (!socket || !isConnected) return;

        // New message received
        const handleNewMessage = (message) => {
            if (currentRoom && message.chatRoom === currentRoom._id) {
                addMessage(message);
            } else {
                // Update unread count for other rooms
                setChatRooms((prev) =>
                    prev.map((room) => {
                        if (room._id === message.chatRoom) {
                            return {
                                ...room,
                                lastMessage: message,
                                unreadCount: (room.unreadCount || 0) + 1,
                                updatedAt: message.createdAt,
                            };
                        }
                        return room;
                    })
                );
            }
        };

        // Message edited
        const handleEditedMessage = (message) => {
            updateMessage(message);
        };

        // Message deleted
        const handleDeletedMessage = ({ messageId, chatRoomId }) => {
            if (currentRoom && chatRoomId === currentRoom._id) {
                removeMessage(messageId);
            }
        };

        // Typing indicators
        const handleTypingStart = ({ userId, username, chatRoomId }) => {
            if (userId !== user?._id) {
                setTypingUsers((prev) => ({
                    ...prev,
                    [chatRoomId]: { ...prev[chatRoomId], [userId]: username },
                }));
            }
        };

        const handleTypingStop = ({ userId, chatRoomId }) => {
            setTypingUsers((prev) => {
                const roomTyping = { ...prev[chatRoomId] };
                delete roomTyping[userId];
                return { ...prev, [chatRoomId]: roomTyping };
            });
        };

        // Message notification
        const handleNotification = ({ chatRoomId, message }) => {
            // Update chat rooms with new message notification
            setChatRooms((prev) =>
                prev.map((room) => {
                    if (room._id === chatRoomId && currentRoom?._id !== chatRoomId) {
                        return {
                            ...room,
                            lastMessage: message,
                            unreadCount: (room.unreadCount || 0) + 1,
                        };
                    }
                    return room;
                })
            );
        };

        // Subscribe to events
        socket.on('message:new', handleNewMessage);
        socket.on('message:edited', handleEditedMessage);
        socket.on('message:deleted', handleDeletedMessage);
        socket.on('typing:start', handleTypingStart);
        socket.on('typing:stop', handleTypingStop);
        socket.on('notification:message', handleNotification);

        // Cleanup
        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('message:edited', handleEditedMessage);
            socket.off('message:deleted', handleDeletedMessage);
            socket.off('typing:start', handleTypingStart);
            socket.off('typing:stop', handleTypingStop);
            socket.off('notification:message', handleNotification);
        };
    }, [socket, isConnected, currentRoom, user, addMessage, updateMessage, removeMessage]);

    // Get typing users for current room
    const getTypingUsers = useCallback(() => {
        if (!currentRoom) return [];
        const roomTyping = typingUsers[currentRoom._id] || {};
        return Object.values(roomTyping);
    }, [currentRoom, typingUsers]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Context value
    const value = {
        chatRooms,
        currentRoom,
        messages,
        loading,
        error,
        typingUsers: getTypingUsers(),
        fetchChatRooms,
        fetchMessages,
        selectRoom,
        createPrivateChat,
        createGroupChat,
        addMessage,
        updateMessage,
        removeMessage,
        clearError,
        setCurrentRoom,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

// Custom hook to use chat context
export const useChat = () => {
    const context = useContext(ChatContext);

    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }

    return context;
};

export default ChatContext;
