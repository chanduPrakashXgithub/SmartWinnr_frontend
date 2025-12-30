/**
 * Typing indicator component
 */
const TypingIndicator = ({ users }) => {
    if (!users || users.length === 0) return null;

    const getText = () => {
        if (users.length === 1) {
            return `${users[0]} is typing`;
        }
        if (users.length === 2) {
            return `${users[0]} and ${users[1]} are typing`;
        }
        return `${users.length} people are typing`;
    };

    return (
        <div className="flex items-center gap-2 text-gray-400 text-sm ml-10">
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
            </div>
            <span>{getText()}</span>
        </div>
    );
};

export default TypingIndicator;
