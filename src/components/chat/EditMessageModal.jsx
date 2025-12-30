import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Edit Message Modal component
 */
const EditMessageModal = ({ isOpen, onClose, message, onSave }) => {
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (message) {
            setContent(message.content || '');
        }
    }, [message]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Message cannot be empty');
            return;
        }

        if (content.trim() === message?.content) {
            onClose();
            return;
        }

        setSaving(true);
        setError('');

        try {
            await onSave(message._id, content.trim());
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to edit message');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setContent('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit Message" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Message
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="Enter your message..."
                        rows={4}
                        className="w-full bg-dark-100 border border-gray-600 rounded-lg text-white placeholder-gray-500 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 hover:border-gray-500 resize-none"
                        autoFocus
                    />
                    {error && (
                        <p className="text-sm text-red-500 mt-1">{error}</p>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                        loading={saving}
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditMessageModal;
