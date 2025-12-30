import { useState, useRef } from 'react';
import { IoCamera, IoPerson, IoMail } from 'react-icons/io5';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

/**
 * Edit Profile Modal component
 */
const EditProfileModal = ({ isOpen, onClose }) => {
    const { user, updateProfile, updateAvatar, loading } = useAuth();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || '',
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors((prev) => ({ ...prev, avatar: 'Please select an image file' }));
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, avatar: 'Image size should be less than 5MB' }));
                return;
            }

            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setErrors((prev) => ({ ...prev, avatar: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (formData.username.length > 30) {
            newErrors.username = 'Username must be less than 30 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (formData.bio && formData.bio.length > 150) {
            newErrors.bio = 'Bio must be less than 150 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaving(true);

        try {
            // Update avatar if changed
            if (avatarFile) {
                const avatarResult = await updateAvatar(avatarFile);
                if (!avatarResult.success) {
                    setErrors((prev) => ({ ...prev, avatar: avatarResult.error }));
                    setSaving(false);
                    return;
                }
            }

            // Update profile data
            const profileResult = await updateProfile({
                username: formData.username,
                email: formData.email,
                bio: formData.bio,
            });

            if (profileResult.success) {
                onClose();
            } else {
                setErrors((prev) => ({ ...prev, general: profileResult.error }));
            }
        } catch (err) {
            setErrors((prev) => ({ ...prev, general: 'Failed to update profile' }));
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setFormData({
            username: user?.username || '',
            email: user?.email || '',
            bio: user?.bio || '',
        });
        setAvatarPreview(null);
        setAvatarFile(null);
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit Profile" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                    <div
                        className="relative cursor-pointer group"
                        onClick={handleAvatarClick}
                    >
                        <Avatar
                            src={avatarPreview || user?.avatar}
                            name={user?.username}
                            size="xl"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <IoCamera size={24} className="text-white" />
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                    <p className="text-sm text-gray-400 mt-2">Click to change avatar</p>
                    {errors.avatar && (
                        <p className="text-sm text-red-500 mt-1">{errors.avatar}</p>
                    )}
                </div>

                {/* Username */}
                <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    leftIcon={<IoPerson size={18} />}
                    error={errors.username}
                />

                {/* Email */}
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    leftIcon={<IoMail size={18} />}
                    error={errors.email}
                />

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Write something about yourself..."
                        rows={3}
                        className="w-full bg-dark-100 border border-gray-600 rounded-lg text-white placeholder-gray-500 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 hover:border-gray-500 resize-none"
                    />
                    <div className="flex justify-between mt-1">
                        {errors.bio ? (
                            <p className="text-sm text-red-500">{errors.bio}</p>
                        ) : (
                            <span />
                        )}
                        <p className="text-sm text-gray-400">
                            {formData.bio.length}/150
                        </p>
                    </div>
                </div>

                {/* General Error */}
                {errors.general && (
                    <p className="text-sm text-red-500 text-center">{errors.general}</p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
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
                        loading={saving || loading}
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProfileModal;
