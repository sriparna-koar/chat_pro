import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from 'next/image';

const Chat = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const genAi = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_APIKEY);

  const handleSendMessage = async () => {
    if (!inputValue) return alert("Please enter a prompt");

    setLoading(true);

    const model = genAi.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: messages.map((msg) => ({ role: msg.role, parts: msg.text })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    try {
      const result = await chat.sendMessageStream(inputValue);
      const response = await result.response;
      const text = await response.text();

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", text: inputValue },
        { role: "model", text },
      ]);
      setInputValue("");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container" style={{fontFamily: "'Google Sans', sans-serif"}}>
      <div className="chatCard">
        <div className="head">
          <div className="left">
          <Image src="/logo.jpeg" alt="Logo" width={50} height={50} />

            <div className="name">Chat</div>
          </div>
          <div className="fiftyper">
            <i className="fas fa-ellipsis-h"></i>
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
              <div className="text">{msg.text}</div>
            </div>
          ))}
        </div>
        {loading && (
          <div className="loading">
            Gemini is typing{" "}
            <span className="dot1"></span>{" "}
            <span className="dot2"></span>{" "}
            <span className="dot3"></span>
          </div>
        )}
        <div className="input-area">
          <div className="sending">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage} className="send" disabled={loading}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
