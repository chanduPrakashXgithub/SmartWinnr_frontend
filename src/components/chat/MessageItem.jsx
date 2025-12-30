import { useState } from 'react';
import { IoCheckmark, IoCheckmarkDone, IoTrash, IoPencil, IoDocument, IoDownload } from 'react-icons/io5';
import Avatar from '../common/Avatar';
import { formatMessageTime, formatFileSize, isImageFile, getFileExtension } from '../../utils';

/**
 * Individual message component
 */
const MessageItem = ({ message, isOwnMessage, isGrouped, showAvatar, onEdit, onDelete }) => {
    const [showActions, setShowActions] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleEditClick = () => {
        if (onEdit && message.messageType === 'text') {
            onEdit(message);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (onDelete) {
            onDelete(message._id);
        }
        setShowDeleteConfirm(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    // Handle image click for full view
    const handleImageClick = (url) => {
        window.open(url, '_blank');
    };

    // Render message content based on type
    const renderContent = () => {
        if (message.isDeleted) {
            return (
                <p className="italic text-gray-500">
                    This message has been deleted
                </p>
            );
        }

        switch (message.messageType) {
            case 'image':
                return (
                    <div className="space-y-2">
                        <div
                            className="relative rounded-lg overflow-hidden cursor-pointer max-w-xs"
                            onClick={() => handleImageClick(message.media?.url)}
                        >
                            {!imageLoaded && (
                                <div className="w-48 h-48 bg-gray-700 animate-pulse rounded-lg" />
                            )}
                            <img
                                src={message.media?.url}
                                alt="Shared image"
                                className={`max-w-full rounded-lg ${imageLoaded ? '' : 'hidden'}`}
                                onLoad={() => setImageLoaded(true)}
                            />
                        </div>
                        {message.content && (
                            <p className="text-sm break-words whitespace-pre-wrap">
                                {message.content}
                            </p>
                        )}
                    </div>
                );

            case 'file':
                return (
                    <div className="flex items-center gap-3 p-3 bg-dark-200 rounded-lg max-w-xs">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IoDocument size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">
                                {message.media?.filename || 'File'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {getFileExtension(message.media?.filename)} • {formatFileSize(message.media?.size)}
                            </p>
                        </div>
                        <a
                            href={message.media?.url}
                            download
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <IoDownload size={18} className="text-gray-400" />
                        </a>
                    </div>
                );

            default:
                return (
                    <p className="break-words whitespace-pre-wrap">
                        {message.content}
                    </p>
                );
        }
    };

    // Render read status for own messages
    const renderStatus = () => {
        if (!isOwnMessage) return null;

        // For now, just show sent status
        // In a real app, you'd check readBy array
        return (
            <IoCheckmarkDone
                size={16}
                className={message.readBy?.length > 0 ? 'text-primary-400' : 'text-gray-500'}
            />
        );
    };

    return (
        <div
            className={`flex gap-2 message-animate ${isGrouped ? 'mt-1' : 'mt-4'} ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                }`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Avatar */}
            <div className="w-8 flex-shrink-0">
                {showAvatar && (
                    <Avatar
                        src={message.sender?.avatar}
                        name={message.sender?.username}
                        size="sm"
                    />
                )}
            </div>

            {/* Message bubble */}
            <div
                className={`relative max-w-[70%] ${isOwnMessage
                    ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
                    : 'bg-dark-100 text-white rounded-2xl rounded-tl-sm'
                    } ${message.messageType === 'text' ? 'px-4 py-2' : 'p-2'}`}
            >
                {/* Sender name for group chats */}
                {!isOwnMessage && !isGrouped && (
                    <p className="text-xs font-medium text-primary-400 mb-1">
                        {message.sender?.username}
                    </p>
                )}

                {/* Content */}
                {renderContent()}

                {/* Time and status */}
                <div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'text-primary-200 justify-end' : 'text-gray-500'
                    }`}>
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {message.isEdited && (
                        <span className="ml-1">(edited)</span>
                    )}
                    {renderStatus()}
                </div>

                {/* Actions (hover) */}
                {showActions && !message.isDeleted && (
                    <div
                        className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
                            } flex items-center gap-1 px-2`}
                    >
                        {isOwnMessage && (
                            <>
                                {message.messageType === 'text' && (
                                    <button
                                        onClick={handleEditClick}
                                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Edit message"
                                    >
                                        <IoPencil size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={handleDeleteClick}
                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Delete message"
                                >
                                    <IoTrash size={14} />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className={`absolute top-full mt-2 ${isOwnMessage ? 'right-0' : 'left-0'} bg-dark-200 rounded-lg p-3 shadow-xl border border-gray-700 z-10 min-w-[200px]`}>
                        <p className="text-sm text-white mb-3">Delete this message?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 px-3 py-1.5 text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageItem;
