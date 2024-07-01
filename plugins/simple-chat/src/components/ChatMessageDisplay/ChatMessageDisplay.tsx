import React from 'react';
import { useChatMessages } from '../../hooks/useChatMessages';

export const ChatMessageDisplay = () => {
  const { messages, error } = useChatMessages();
  if (error) {
    return <div>Error fetching messages: {`${error}`}</div>;
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
      {messages?.map((msg, index) => (
        <li
          key={`chat-${index}`}
        >{`${msg.timestamp} - ${msg.nickname}: ${msg.message}`}</li>
      ))}
    </ul>
  );
};
