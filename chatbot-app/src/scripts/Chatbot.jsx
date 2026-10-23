// The chatbot exercise, ported from ../../no-build/chatbot/app.jsx.

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

import { useState } from "react";
import { ChatInput } from "../components/ChatInput.jsx";
import ChatMessages from "../components/ChatMessages.jsx";

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

// defines the ChatMessages component, which shows the whole list
// it receives the chatMessages array as a prop

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
