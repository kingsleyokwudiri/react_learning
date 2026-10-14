// this file is loaded by index.html and compiled by Babel (type="text/babel")

// React is not imported here: Babel compiles this file as a classic script,
// so a bare `import ... from "react"` would become require("react") and throw.
// It is already a global, loaded by <script src="../libs/react.js">.

// the component name must start with a capital letter
// {} is for inserting JS code into JSX
// component syntax is <ComponentName />, e.g. <ChatInput />
// {ChatInput()}

// defines the ChatInput component (the input box + the Send button)
// the { } in the parameters unpacks the props object into two variables
function ChatInput({ chatMessages, setChatMessages }) {
  // array destructuring: inputText is the value, setInputText is the setter
  // React.useState("") creates state that starts as an empty string

  // React.useState is a hook
  // hooks shall be at the top of the component, and must not be nested inside anything else
  const [inputText, setInputText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

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
    setInputText("");
    setIsLoading(true);
    // builds a NEW array of messages (state must never be changed directly)
    const newChatMessage = [
      // copies every existing message into the new array
      ...chatMessages,
      // then adds the user's new message at the end of the array
      // crypto.randomUUID() gives each message a unique id for React's key
      { message: inputText, sender: "user", id: crypto.randomUUID() },
    ];
    // shows the user's message plus a temporary "Loading..." bubble while the
    // robot thinks. the reply below replaces this list, dropping the bubble
    setChatMessages([
      // copies in all the messages, including the user's new one
      ...newChatMessage,
      { message: "Loading...", sender: "robot", id: crypto.randomUUID() },
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
      { message: response, sender: "robot", id: crypto.randomUUID() },
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
      className={
        sender === "user" 
        ? "chat-message-user" 
        : "chat-message-robot"
      }
    >
      {sender === "robot" && (
        <img src="../assets/robot.png" className="chat-message-profile"/>
      )}
      {/* { } inserts JavaScript into JSX, here the message text */}
      
      <div className="chat-message-text">
        {message}
      </div>
      
      {sender === "user" && (
        <img src="../assets/user.png" className="chat-message-profile"/>
      )}
    </div>
  );
}

// defines the ChatMessages component, which shows the whole list
// it receives the chatMessages array as a prop
function ChatMessages({ chatMessages }) {
  // React.useEffect(() => {
  //   console.log("hello")
  // }, [chatMessages])
  // returns a fragment so no extra div is added around the messages
  return (
    <div className="chat-messages-container">
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

// defines App, the main component that holds the state
function App() {
  // React.useState([...]) stores the array below as state
  // the starting value is this array of four message objects
  // Array Destructuring
  // const [chatMessages, setChatMessages] = array;
  // or
  // const chatMessages = array[0];
  // const setChatMessages = array[1];
  const [chatMessages, setChatMessages] = React.useState([
    // the first message object, with three properties
    {
      message: "hello chatbot",
      sender: "user",
      id: "id1",
    },
    {
      message: "Hello! How can I help you?",
      sender: "robot",
      id: "id2",
    },
    {
      message: "can you get me todays date?",
      sender: "user",
      id: "id3",
    },
    {
      message: "Today is September 27",
      sender: "robot",
      id: "id4",
    },
  ]);

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

const container = document.querySelector(".js-container");
// createRoot tells React which element to render into
// .render(<App />) draws the App component inside that container
ReactDOM.createRoot(container).render(<App />);
