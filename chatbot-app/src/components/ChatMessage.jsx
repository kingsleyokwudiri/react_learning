import dayjs from "dayjs";
import RobotProfileImage from "../../public/robot.png";
import UserProfileImage from "../../public/user.png";
import "../styles/ChatMessage.css";

export function ChatMessage({ message, sender, time }) {
  // ChatInput adds a temporary message with this exact text while it waits for
  // a reply, so it is drawn as animated dots instead of a "Loading..." bubble.
  const isTyping = sender === "robot" && message === "Loading...";

  // guard operator
  return (
    // React needs one single root element, so everything goes in a <div>
    <div
      className={sender === "user" ? "chat-message-user" : "chat-message-robot"}
    >
      {sender === "robot" && (
        <img
          src={RobotProfileImage}
          className="chat-message-profile"
          alt=""
        />
      )}
      {/* { } inserts JavaScript into JSX, here the message text */}
      <div className="chat-message-text">
        {isTyping ? (
          // role="status" lets screen readers announce that a reply is coming
          <div
            className="typing-indicator"
            role="status"
            aria-label="Chatbot is typing"
          >
            <span />
            <span />
            <span />
          </div>
        ) : (
          message
        )}
        {time && !isTyping && (
          <div className="chat-message-time">
            {dayjs(time).format("h:mm A")}
          </div>
        )}
      </div>

      {sender === "user" && (
        <img src={UserProfileImage} className="chat-message-profile" alt="" />
      )}
    </div>
  );
}
