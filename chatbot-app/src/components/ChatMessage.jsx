import dayjs from "dayjs";
import RobotProfileImage from "../../public/robot.png";
import UserProfileImage from "../../public/user.png";
import "../styles/ChatMessage.css";

export function ChatMessage({ message, sender, time }) {
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
      <div className="chat-message-text">
        {message}
        {time && (
          <div className="chat-message-time">
            {dayjs(time).format("h:mm A")}
          </div>
        )}
      </div>

      {sender === "user" && (
        <img src={UserProfileImage} className="chat-message-profile" />
      )}
    </div>
  );
}
