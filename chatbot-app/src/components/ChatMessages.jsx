import { useEffect, useRef } from "react";
import { ChatMessage } from "../components/ChatMessage.jsx";
import "../styles/ChatMessages.css";

function ChatMessages({ chatMessages }) {
  // useEffect is used to run some code after the component is created/updated
  // useRef is used to save an HTML element from the component
  const chatMessagesRef = useRef(null);
  useEffect(() => {
    const containerElem = chatMessagesRef.current;
    if (containerElem) {
      containerElem.scrollTop = containerElem.scrollHeight;
    }
  }, [chatMessages]);
  // returns a fragment so no extra div is added around the messages
  if (chatMessages.length === 0) {
    return (
      <div className="welcome-message">
        <p>Welcome to the chatbot project!</p>
      </div>
    );
  }
  return (
    // ref={} takes an HTML element, and saves it into chatMessagesRef
    <div className="chat-messages-container" ref={chatMessagesRef}>
      {chatMessages.map((chatMessage) => {
        // .map() loops over the array and builds a new array of JSX
        // one <ChatMessage /> is created for each object in the array
        // returns one ChatMessage for the current chatMessage
        // message: the text this message should display
        // sender: who sent it, "user" or "robot"
        // key: a unique id so React can tell the messages apart
        return (
          <ChatMessage
            message={chatMessage.message}
            sender={chatMessage.sender}
            time={chatMessage.time}
            key={chatMessage.id}
          />
        );
      })}
    </div>
  );
}

export default ChatMessages;
