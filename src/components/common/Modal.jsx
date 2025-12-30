import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { useClickOutside } from '../../hooks';

/**
 * Modal component
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
}) => {
    const modalRef = useRef(null);

    // Close on click outside
    useClickOutside(modalRef, () => {
        if (isOpen) onClose();
    });

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
    };

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70 transition-opacity" />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    ref={modalRef}
                    className={`relative bg-dark-100 rounded-xl shadow-xl w-full ${sizeClasses[size]} transform transition-all`}
                >
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            {title && (
                                <h3 className="text-lg font-semibold text-white">{title}</h3>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <IoClose size={24} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-4">{children}</div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
