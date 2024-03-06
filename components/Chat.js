import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from 'next/image';

const Chat = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState({});
  const [messageSent, setMessageSent] = useState(false); // State to track message sent status
  const genAi = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_APIKEY);

  const handleSendMessage = async () => {
    if (!inputValue) return alert("Please enter a prompt");

    const messageId = Date.now(); 
    setLoadingMessages(prevState => ({ ...prevState, [messageId]: true }));

    const model = genAi.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: messages.map((msg) => ({ role: msg.role, parts: msg.text })),
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });

    try {
      const result = await chat.sendMessageStream(inputValue);
      const response = await result.response;
      const text = await response.text();

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", text: inputValue, timestamp: Date.now() },
        { role: "model", text, timestamp: Date.now() },
      ]);
      setInputValue("");
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 3000);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setLoadingMessages(prevState => ({ ...prevState, [messageId]: false }));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", fontFamily: "'Google Sans', sans-serif" }}>
      <div className="chat-container">
        <div className="chatCard">
          <div className="head">
            <div className="left">
              <Image src="/logo.jpeg" alt="Logo" width={50} height={50} />
              <div className="name">Chat</div>
            </div>
            <div className="fiftyper">
              <i className="fas fa-ellipsis-h"></i>
            </div>
            <div className="github-container">
              <a href="https://github.com/sriparna-koar" target="_blank" rel="noopener noreferrer">
                <Image src="/github.png" alt="GitHub" width={30} height={30} className="github-icon" />
              </a>
            </div>
          </div>
          <div className="message_area">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}-message`}>
                <div className="img">
                  <Image
                    src={msg.role === "user" ? "/my_pic.jpg" : "/logo.jpeg"}
                    alt="" width={50} height={50}
                  />
                </div>
                <div className="message-content">
                  <div className="text">{msg.text}</div>
                  <div className="timestamp">{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {Object.keys(loadingMessages).map((messageId) => (
              loadingMessages[messageId] && (
                <div key={messageId} className="loading">
                  Loading...
                </div>
              )
            ))}
            {messageSent && (
              <div className="message-sent">Message sent!</div>
            )}
          </div>
          <div className="input-area">
            <div className="sending">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
              />
              <button onClick={handleSendMessage} className="send" disabled={Object.values(loadingMessages).some(Boolean)}>
                <Image src="/send.jpg" alt="Send" width={34} height={44} className="send-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

