import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Socket.IO server URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create Socket Context
const SocketContext = createContext(null);

// Socket Provider Component
export const SocketProvider = ({ children }) => {
    const { token, isAuthenticated, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    // Initialize socket connection
    useEffect(() => {
        if (!isAuthenticated || !token) {
            // Disconnect if not authenticated
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Create socket connection
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        // Connection events
        newSocket.on('connect', () => {
            console.log('🔌 Socket connected:', newSocket.id);
            setIsConnected(true);
            reconnectAttempts.current = 0;
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            reconnectAttempts.current += 1;

            if (reconnectAttempts.current >= maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                newSocket.disconnect();
            }
        });

        // Online users events
        newSocket.on('users:online', (users) => {
            setOnlineUsers(users);
        });

        newSocket.on('user:online', ({ userId }) => {
            setOnlineUsers((prev) => {
                if (!prev.includes(userId)) {
                    return [...prev, userId];
                }
                return prev;
            });
        });

        newSocket.on('user:offline', ({ userId }) => {
            setOnlineUsers((prev) => prev.filter((id) => id !== userId));
        });

        // Error handling
        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);

        // Cleanup on unmount or auth change
        return () => {
            newSocket.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [isAuthenticated, token]);

    // Join a chat room
    const joinRoom = useCallback((roomId) => {
        if (socket && isConnected) {
            socket.emit('room:join', roomId);
        }
    }, [socket, isConnected]);

    // Leave a chat room
    const leaveRoom = useCallback((roomId) => {
        if (socket && isConnected) {
            socket.emit('room:leave', roomId);
        }
    }, [socket, isConnected]);

    // Send a message
    const sendMessage = useCallback((data) => {
        if (socket && isConnected) {
            socket.emit('message:send', data);
        }
    }, [socket, isConnected]);

    // Edit a message
    const editMessage = useCallback((data) => {
        if (socket && isConnected) {
            socket.emit('message:edit', data);
        }
    }, [socket, isConnected]);

    // Delete a message
    const deleteMessage = useCallback((data) => {
        if (socket && isConnected) {
            socket.emit('message:delete', data);
        }
    }, [socket, isConnected]);

    // Start typing indicator
    const startTyping = useCallback((chatRoomId) => {
        if (socket && isConnected) {
            socket.emit('typing:start', { chatRoomId });
        }
    }, [socket, isConnected]);

    // Stop typing indicator
    const stopTyping = useCallback((chatRoomId) => {
        if (socket && isConnected) {
            socket.emit('typing:stop', { chatRoomId });
        }
    }, [socket, isConnected]);

    // Mark messages as read
    const markAsRead = useCallback((chatRoomId) => {
        if (socket && isConnected) {
            socket.emit('messages:read', { chatRoomId });
        }
    }, [socket, isConnected]);

    // Check if a user is online
    const isUserOnline = useCallback((userId) => {
        return onlineUsers.includes(userId);
    }, [onlineUsers]);

    // Context value
    const value = {
        socket,
        isConnected,
        onlineUsers,
        joinRoom,
        leaveRoom,
        sendMessage,
        editMessage,
        deleteMessage,
        startTyping,
        stopTyping,
        markAsRead,
        isUserOnline,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

// Custom hook to use socket context
export const useSocket = () => {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }

    return context;
};

export default SocketContext;
