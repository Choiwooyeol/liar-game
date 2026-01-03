import React, { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, push, onValue, set } from 'firebase/database';

const Chat = ({ roomId, playerName, myId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        const messagesRef = ref(database, `rooms/${roomId}/messages`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messageList = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
                setMessages(messageList);
            }
        });
        return () => unsubscribe();
    }, [roomId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messagesRef = ref(database, `rooms/${roomId}/messages`);
        const newMessageRef = push(messagesRef);
        set(newMessageRef, {
            sender: playerName,
            senderId: myId,
            text: newMessage,
            timestamp: Date.now()
        });
        setNewMessage('');
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.senderId === myId ? 'me' : 'other'}`}>
                        <span className="sender">{msg.sender}</span>
                        <div className="bubble">{msg.text}</div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} className="chat-input-area">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="채팅 입력..."
                />
                <button type="submit">전송</button>
            </form>
        </div>
    );
};

export default Chat;
