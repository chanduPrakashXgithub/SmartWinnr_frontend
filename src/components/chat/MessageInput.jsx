import { useState, useRef, useEffect } from 'react';
import { IoSend, IoImage, IoAttach, IoHappy, IoClose } from 'react-icons/io5';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import { messageService } from '../../services/api';
import { useTypingIndicator } from '../../hooks';

/**
 * Message Input component
 */
const MessageInput = () => {
    const { currentRoom, addMessage } = useChat();
    const { sendMessage, startTyping, stopTyping } = useSocket();
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [sending, setSending] = useState(false);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Typing indicator handler
    const handleTyping = useTypingIndicator(
        () => startTyping(currentRoom?._id),
        () => stopTyping(currentRoom?._id),
        1500
    );

    // Focus input when room changes
    useEffect(() => {
        inputRef.current?.focus();
    }, [currentRoom]);

    // Handle message input change
    const handleInputChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target?.result);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    // Clear selected file
    const clearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle send message
    const handleSend = async () => {
        if ((!message.trim() && !selectedFile) || !currentRoom || sending) return;

        setSending(true);
        stopTyping(currentRoom._id);

        try {
            if (selectedFile) {
                // Send media message via REST API
                const response = await messageService.sendMediaMessage({
                    chatRoomId: currentRoom._id,
                    file: selectedFile,
                    content: message.trim(),
                });
                addMessage(response.data.message);
                clearFile();
            } else {
                // Send text message via socket
                sendMessage({
                    chatRoomId: currentRoom._id,
                    content: message.trim(),
                });
            }

            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!currentRoom) return null;

    return (
        <div className="border-t border-gray-700 bg-dark-100 p-4">
            {/* File preview */}
            {selectedFile && (
                <div className="mb-3 p-3 bg-dark-200 rounded-lg flex items-center gap-3">
                    {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                            <IoAttach size={24} className="text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                    <button
                        onClick={clearFile}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <IoClose size={20} />
                    </button>
                </div>
            )}

            {/* Input row */}
            <div className="flex items-end gap-2">
                {/* Attachment buttons */}
                <div className="flex items-center gap-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Attach file"
                    >
                        <IoAttach size={22} />
                    </button>
                    <button
                        onClick={() => {
                            fileInputRef.current.accept = 'image/*';
                            fileInputRef.current?.click();
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Send image"
                    >
                        <IoImage size={22} />
                    </button>
                </div>

                {/* Text input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={message}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full bg-dark-200 border border-gray-700 rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32"
                        style={{
                            minHeight: '48px',
                            height: message ? 'auto' : '48px',
                        }}
                    />
                    <button
                        className="absolute right-2 bottom-2 p-2 text-gray-400 hover:text-white transition-colors"
                        title="Emoji"
                    >
                        <IoHappy size={22} />
                    </button>
                </div>

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={(!message.trim() && !selectedFile) || sending}
                    className={`p-3 rounded-full transition-colors ${message.trim() || selectedFile
                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {sending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <IoSend size={20} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
