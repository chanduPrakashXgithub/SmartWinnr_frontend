import { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import Spinner from '../common/Spinner';

/**
 * Message List component - displays chat messages
 */
const MessageList = ({ onEditMessage, onDeleteMessage }) => {
    const { messages, loading, typingUsers, currentRoom } = useChat();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Group messages by date
    const groupMessagesByDate = (msgs) => {
        const groups = {};

        msgs.forEach((message) => {
            const date = new Date(message.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });

        return groups;
    };

    // Check if messages should be grouped (same sender, within 5 minutes)
    const shouldGroupWithPrevious = (message, prevMessage) => {
        if (!prevMessage) return false;
        if (message.sender._id !== prevMessage.sender._id) return false;

        const timeDiff = new Date(message.createdAt) - new Date(prevMessage.createdAt);
        return timeDiff < 5 * 60 * 1000; // 5 minutes
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!currentRoom) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a chat to start messaging
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">No messages yet</p>
                <p className="text-sm">Send a message to start the conversation</p>
            </div>
        );
    }

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 bg-dark-100 rounded-full text-xs text-gray-400">
                            {date}
                        </span>
                    </div>

                    {/* Messages for this date */}
                    {dateMessages.map((message, index) => {
                        const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                        const isGrouped = shouldGroupWithPrevious(message, prevMessage);
                        const isOwnMessage = message.sender._id === user?._id;

                        return (
                            <MessageItem
                                key={message._id}
                                message={message}
                                isOwnMessage={isOwnMessage}
                                isGrouped={isGrouped}
                                showAvatar={!isGrouped && !isOwnMessage}
                                onEdit={onEditMessage}
                                onDelete={onDeleteMessage}
                            />
                        );
                    })}
                </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
                <TypingIndicator users={typingUsers} />
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
