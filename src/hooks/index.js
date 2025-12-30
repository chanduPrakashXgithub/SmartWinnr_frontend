import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing form state
 */
export const useForm = (initialValues = {}, validationRules = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setValues((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        // Validate field on blur
        if (validationRules[name]) {
            const error = validationRules[name](values[name], values);
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    }, [values, validationRules]);

    const validate = useCallback(() => {
        const newErrors = {};
        Object.keys(validationRules).forEach((field) => {
            const error = validationRules[field](values[field], values);
            if (error) {
                newErrors[field] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, validationRules]);

    const handleSubmit = useCallback((onSubmit) => async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Touch all fields
        const allTouched = {};
        Object.keys(values).forEach((key) => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        if (validate()) {
            try {
                await onSubmit(values);
            } catch (error) {
                console.error('Form submission error:', error);
            }
        }

        setIsSubmitting(false);
    }, [values, validate]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    const setValue = useCallback((name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        validate,
        reset,
        setValue,
        setValues,
    };
};

/**
 * Custom hook for debouncing values
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Custom hook for scroll position tracking
 */
export const useScrollPosition = (ref) => {
    const [scrollPosition, setScrollPosition] = useState({
        scrollTop: 0,
        scrollHeight: 0,
        clientHeight: 0,
        isAtBottom: true,
    });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = element;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

            setScrollPosition({
                scrollTop,
                scrollHeight,
                clientHeight,
                isAtBottom,
            });
        };

        element.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => element.removeEventListener('scroll', handleScroll);
    }, [ref]);

    const scrollToBottom = useCallback((smooth = true) => {
        if (ref.current) {
            ref.current.scrollTo({
                top: ref.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto',
            });
        }
    }, [ref]);

    return { ...scrollPosition, scrollToBottom };
};

/**
 * Custom hook for local storage
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }, [key, storedValue]);

    const removeValue = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
};

/**
 * Custom hook for click outside detection
 */
export const useClickOutside = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref, callback]);
};

/**
 * Custom hook for window size
 */
export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

/**
 * Custom hook for typing indicator
 */
export const useTypingIndicator = (startTyping, stopTyping, delay = 1000) => {
    const typingTimeout = useRef(null);
    const isTyping = useRef(false);

    const handleTyping = useCallback(() => {
        if (!isTyping.current) {
            isTyping.current = true;
            startTyping();
        }

        // Clear existing timeout
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        // Set new timeout
        typingTimeout.current = setTimeout(() => {
            isTyping.current = false;
            stopTyping();
        }, delay);
    }, [startTyping, stopTyping, delay]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }
        };
    }, []);

    return handleTyping;
};
