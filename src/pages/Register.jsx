import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMail, IoLockClosed, IoPerson, IoChatbubbles } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { isValidEmail } from '../utils';

/**
 * Register page component
 */
const Register = () => {
    const navigate = useNavigate();
    const { register, error: authError, clearError } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form validation rules
    const validationRules = {
        username: (value) => {
            if (!value) return 'Username is required';
            if (value.length < 3) return 'Username must be at least 3 characters';
            if (value.length > 30) return 'Username cannot exceed 30 characters';
            if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                return 'Username can only contain letters, numbers, and underscores';
            }
            return null;
        },
        email: (value) => {
            if (!value) return 'Email is required';
            if (!isValidEmail(value)) return 'Please enter a valid email';
            return null;
        },
        password: (value) => {
            if (!value) return 'Password is required';
            if (value.length < 6) return 'Password must be at least 6 characters';
            return null;
        },
        confirmPassword: (value, allValues) => {
            if (!value) return 'Please confirm your password';
            if (value !== allValues.password) return 'Passwords do not match';
            return null;
        },
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useForm(
        { username: '', email: '', password: '', confirmPassword: '' },
        validationRules
    );

    // Handle form submission
    const onSubmit = async (formValues) => {
        setLoading(true);
        clearError();

        const { confirmPassword, ...registerData } = formValues;
        const result = await register(registerData);

        if (result.success) {
            navigate('/chat');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-dark-200 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
                        <IoChatbubbles size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-gray-400 mt-2">Join ChatApp and start messaging</p>
                </div>

                {/* Register form */}
                <div className="bg-dark-100 rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Auth error message */}
                        {authError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {authError}
                            </div>
                        )}

                        {/* Username input */}
                        <Input
                            label="Username"
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={values.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.username && errors.username}
                            leftIcon={<IoPerson size={20} />}
                        />

                        {/* Email input */}
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.email && errors.email}
                            leftIcon={<IoMail size={20} />}
                        />

                        {/* Password input */}
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.password && errors.password}
                            leftIcon={<IoLockClosed size={20} />}
                        />

                        {/* Confirm password input */}
                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.confirmPassword && errors.confirmPassword}
                            leftIcon={<IoLockClosed size={20} />}
                        />

                        {/* Submit button */}
                        <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                            disabled={loading}
                        >
                            Create Account
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-dark-100 text-gray-400">
                                Already have an account?
                            </span>
                        </div>
                    </div>

                    {/* Login link */}
                    <Link to="/login">
                        <Button variant="outline" fullWidth>
                            Sign In
                        </Button>
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Register;
