// The chatbot exercise, ported from ../../no-build/chatbot/app.jsx.
//
// Same components, same behavior -- the difference is how the file is loaded.
// There, Babel compiles the JSX in the browser and React comes from a <script>
// tag in no-build/libs/, so the code refers to the global `React.useState`.
// Here, Vite compiles it ahead of time and React is a real npm package, so the
// hooks are imported. The `Chatbot` object from ../../no-build/libs/chatbot.js
// is now a local module too (see ./chatbot.js).
//
// The images moved into public/, so their URLs are root-relative: /robot.png.
//
// component name must start with a capital letter
// {} is for inserting JS code into JSX
// component syntax is <ComponentName />, e.g. <ChatInput />
// {ChatInput()}

import { useState, useEffect, useRef } from "react";
import { ChatInput } from "../components/ChatInput.jsx";
import RobotProfileImage from "../../public/robot.png";
import UserProfileImage from "../../public/user.png";

import "../styles/Chatbot.css";

// <div></div> is a block element, it will take up an entire line
// components are designed to be reusable,
// so they should be generic and not specific to a single use case
// props is short for properties,
//
// it is an object that contains the data passed to the component

// defines the ChatMessage component, which shows one single message
// it receives message (the text) and sender ("user" or "robot")
// or const message = props.message;
// or const { message, sender } = props;
function ChatMessage({ message, sender }) {
  // guard operator
  return (
    // React needs one single root element, so everything goes in a <div>
    <div
      className={sender === "user" ? "chat-message-user" : "chat-message-robot"}
    >
      {sender === "robot" && (
        <img src={RobotProfileImage} className="chat-message-profile" />
      )}
      {/* { } inserts JavaScript into JSX, here the message text */}

      <div className="chat-message-text">{message}</div>

      {sender === "user" && (
        <img src={UserProfileImage} className="chat-message-profile" />
      )}
    </div>
  );
}

// defines the ChatMessages component, which shows the whole list
// it receives the chatMessages array as a prop
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
            key={chatMessage.id}
          />
        );
      })}
    </div>
  );
}

// Chatbot is the main component that holds the state
export default function ChatbotApp() {
  // useState([...]) stores the array below as state
  // the starting value is an empty array, so the chat starts with no messages
  // Array Destructuring
  // const [chatMessages, setChatMessages] = array;
  // or
  // const chatMessages = array[0];
  // const setChatMessages = array[1];
  const [chatMessages, setChatMessages] = useState([]);

  // returns the JSX that makes up the whole page
  return (
    // a fragment groups the two components below
    <div className="app-container">
      {/* chatMessages: passed down so ChatInput can read the list */}
      {/* setChatMessages: passed down so ChatInput can update the list */}
      {/* chatMessages: the same list, passed down so it can be displayed */}
      <ChatMessages chatMessages={chatMessages} />
      <ChatInput
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
      />
    </div>
  );
}
