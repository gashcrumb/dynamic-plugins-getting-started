import { ChatMessage } from '../../api/types';

type ChatMessageDisplayProps = {
  messages?: ChatMessage[];
  error?: Error;
};

export const ChatMessageDisplay = ({
  messages,
  error,
}: ChatMessageDisplayProps) => {
  if (error) {
    return <div>Error fetching messages: {error.message}</div>;
  }
  if (!messages || messages.length === 0) {
    return (
      <div>
        No messages to show yet, type a message in the input below to start
        chatting
      </div>
    );
  }
  return (
    <ul>
      {messages.map((msg, index) => (
        <li
          key={`chat-${index}`}
        >{`${msg.timestamp} - ${msg.nickname}: ${msg.message}`}</li>
      ))}
    </ul>
  );
};
