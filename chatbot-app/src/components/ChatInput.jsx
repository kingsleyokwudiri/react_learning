import { useState } from "react";
import Chatbot from "../scripts/chatbot.js";
import "../styles/ChatInput.css";

// defines the ChatInput component (the input box + the Send button)
// the { } in the parameters unpacks the props object into two variables
export function ChatInput({ chatMessages, setChatMessages }) {
  // array destructuring: inputText is the value, setInputText is the setter
  // useState("") creates state that starts as an empty string

  // useState is a hook
  // hooks shall be at the top of the component, and must not be nested inside anything else
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // runs every time the user types a character into the input
  function saveInputText(event) {
    setInputText(event.target.value);
  }

  // runs when the user clicks Send or presses Enter
  // async lets this function pause at an await and continue later
  async function sendMessage() {
    // if the robot is still thinking or the input is empty, do nothing
    if (isLoading || inputText === "") {
      return;
    }
    // if (chatMessages.length === 0) {
    // }
    setInputText("");
    setIsLoading(true);
    // saves when this message was sent, so it can be shown under the message
    const time = new Date().toISOString();
    // builds a NEW array of messages (state must never be changed directly)
    const newChatMessage = [
      // copies every existing message into the new array
      ...chatMessages,
      // then adds the user's new message at the end of the array
      // crypto.randomUUID() gives each message a unique id for React's key
      { message: inputText, sender: "user", id: crypto.randomUUID(), time },
    ];
    // shows the user's message plus a temporary "Loading..." bubble while the
    // robot thinks. the reply below replaces this list, dropping the bubble
    setChatMessages([
      // copies in all the messages, including the user's new one
      ...newChatMessage,
      { message: "Loading...", sender: "robot", id: crypto.randomUUID(), time },
    ]);
    // asks the Chatbot object from chatbot.js for a reply to the input
    // getResponseAsync waits a second before replying, and returns a Promise
    // await pauses here until that Promise resolves, then gives us the reply
    const response = await Chatbot.getResponseAsync(inputText);
    // saves the list one more time, this time with the robot's reply added
    // everything below only runs after the await above has finished
    setChatMessages([
      // copies in all the messages, including the user's new one
      // this rebuilds from newChatMessage, so the "Loading..." bubble is dropped
      ...newChatMessage,
      // adds the robot's real reply as the last message
      {
        message: response,
        sender: "robot",
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
      },
    ]);
    setIsLoading(false);
  }

  return (
    // return hands the JSX below back to React so it can be drawn
    // <></> is a fragment: it groups elements without adding an extra div
    // used <div> for flexbox
    <div className="chat-input-container">
      {/* onChange: runs each time the text changes, so inputText stays in sync */}
      {/* value: what the input displays - this makes it a "controlled" input */}
      <input
        placeholder="Send a message to Chatbot"
        className="chat-input"
        size="30"
        onChange={saveInputText}
        value={inputText}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            sendMessage();
          } else if (event.key === "Escape") {
            setInputText("");
          }
        }}
      />
      <button className="send-button" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}
