import React, { useState, useEffect, useRef } from 'react';

// VirtualKeyboard component
const VirtualKeyboard = ({ onInputChange }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    // Function to handle input changes
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        onInputChange(event.target.value);
    };

    // Function to toggle keyboard visibility
    const toggleKeyboard = () => {
        setIsVisible(!isVisible);
        if (!isVisible) {
            // Focus the input field when the keyboard is shown
            inputRef.current.focus();
        } else {
            // Unfocus the input field when the keyboard is hidden
            inputRef.current.blur();
        }
    };

    // Effect to adjust the page layout when the keyboard is shown/hidden
    useEffect(() => {
        const adjustLayout = () => {
            if (isVisible) {
                // Shift the page up by setting a margin or padding
                document.body.style.marginBottom = '300px'; // Adjust based on keyboard height
            } else {
                // Reset the margin or padding
                document.body.style.marginBottom = '0';
            }
        };

        adjustLayout();

        // Cleanup function to reset layout on unmount
        return () => {
            document.body.style.marginBottom = '0';
        };
    }, [isVisible]);

    // Event listeners for keyboard events
    useEffect(() => {
        const keyboardDidShow = () => {
            document.body.style.marginBottom = '300px'; // Adjust based on keyboard height
        };

        const keyboardDidHide = () => {
            document.body.style.marginBottom = '0';
        };

        window.addEventListener('keyboardDidShow', keyboardDidShow);
        window.addEventListener('keyboardDidHide', keyboardDidHide);

        // Cleanup event listeners on unmount
        return () => {
            window.removeEventListener('keyboardDidShow', keyboardDidShow);
            window.removeEventListener('keyboardDidHide', keyboardDidHide);
        };
    }, []);

    return (
        <div>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                ref={inputRef}
                placeholder="Type here..."
                onFocus={toggleKeyboard}
                onBlur={toggleKeyboard}
            />
            {isVisible && (
                <div className="keyboard">
                    {/* Render keyboard buttons here */}
                    <button onClick={() => setInputValue(inputValue + 'A')}>A</button>
                    <button onClick={() => setInputValue(inputValue + 'B')}>B</button>
                    <button onClick={() => setInputValue(inputValue + 'C')}>C</button>
                    {/* Add more buttons as needed */}
                </div>
            )}
        </div>
    );
};

export default VirtualKeyboard;
