import { useState, useEffect } from 'react';
import { IoMenu, IoChatbubbles } from 'react-icons/io5';
import { useChat } from '../context/ChatContext';
import { useWindowSize } from '../hooks';
import { messageService } from '../services/api';
import {
    Sidebar,
    ChatHeader,
    MessageList,
    MessageInput,
    NewChatModal,
    EditProfileModal,
    EditMessageModal,
} from '../components/chat';

/**
 * Main Chat page component
 */
const Chat = () => {
    const { currentRoom, setCurrentRoom, updateMessage, removeMessage } = useChat();
    const { width } = useWindowSize();
    const [showSidebar, setShowSidebar] = useState(true);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showChatInfo, setShowChatInfo] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showEditMessageModal, setShowEditMessageModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const isMobile = width < 768;

    // Handle mobile view - hide sidebar when chat is selected
    useEffect(() => {
        if (isMobile && currentRoom) {
            setShowSidebar(false);
        }
    }, [currentRoom, isMobile]);

    // Reset view on resize
    useEffect(() => {
        if (!isMobile) {
            setShowSidebar(true);
        }
    }, [isMobile]);

    // Handle back button on mobile
    const handleMobileBack = () => {
        setShowSidebar(true);
        setCurrentRoom(null);
    };

    // Handle edit message
    const handleEditMessage = (message) => {
        setSelectedMessage(message);
        setShowEditMessageModal(true);
    };

    // Save edited message
    const handleSaveEditMessage = async (messageId, content) => {
        const response = await messageService.editMessage(messageId, content);
        updateMessage(response.data.message);
    };

    // Handle delete message
    const handleDeleteMessage = async (messageId) => {
        try {
            await messageService.deleteMessage(messageId);
            removeMessage(messageId);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    return (
        <div className="h-screen flex bg-dark-200">
            {/* Sidebar */}
            <div
                className={`${isMobile
                    ? showSidebar
                        ? 'absolute inset-0 z-20'
                        : 'hidden'
                    : 'w-80 flex-shrink-0'
                    } border-r border-gray-700`}
            >
                <Sidebar
                    onNewChat={() => setShowNewChatModal(true)}
                    onMobileClose={() => isMobile && setShowSidebar(false)}
                />
            </div>

            {/* Main chat area */}
            <div className={`flex-1 flex flex-col ${isMobile && showSidebar ? 'hidden' : ''}`}>
                {currentRoom ? (
                    <>
                        {/* Chat header */}
                        <ChatHeader
                            onBack={handleMobileBack}
                            onInfoClick={() => setShowChatInfo(true)}
                            onEditProfile={() => setShowEditProfileModal(true)}
                        />

                        {/* Messages */}
                        <MessageList
                            onEditMessage={handleEditMessage}
                            onDeleteMessage={handleDeleteMessage}
                        />

                        {/* Input */}
                        <MessageInput />
                    </>
                ) : (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        {/* Mobile menu button */}
                        {isMobile && (
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors md:hidden"
                            >
                                <IoMenu size={24} />
                            </button>
                        )}

                        <div className="text-center max-w-md px-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-dark-100 rounded-full mb-6">
                                <IoChatbubbles size={40} className="text-primary-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">
                                Welcome to ChatApp
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Select a conversation from the sidebar or start a new chat to begin messaging.
                            </p>
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                            >
                                Start a New Chat
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat info panel (optional) */}
            {showChatInfo && currentRoom && (
                <div className="w-80 border-l border-gray-700 bg-dark-100 flex-shrink-0 hidden lg:block">
                    {/* Add chat info content here */}
                </div>
            )}

            {/* New chat modal */}
            <NewChatModal
                isOpen={showNewChatModal}
                onClose={() => setShowNewChatModal(false)}
            />

            {/* Edit profile modal */}
            <EditProfileModal
                isOpen={showEditProfileModal}
                onClose={() => setShowEditProfileModal(false)}
            />

            {/* Edit message modal */}
            <EditMessageModal
                isOpen={showEditMessageModal}
                onClose={() => {
                    setShowEditMessageModal(false);
                    setSelectedMessage(null);
                }}
                message={selectedMessage}
                onSave={handleSaveEditMessage}
            />
        </div>
    );
};

export default Chat;
