import { Text } from '@backstage/ui';
import { useChatMessages } from '../../hooks/useChatMessages';

export const ChatMessageDisplay = () => {
  const { messages, error } = useChatMessages();
  if (error) {
    return <Text color="danger">Error fetching messages: {`${error}`}</Text>;
  }
  if (!messages || messages.length === 0) {
    return (
      <Text color="secondary">
        No messages to show yet, type a message in the input below to start
        chatting
      </Text>
    );
  }
  return (
    <ul>
      {messages.map((msg, index) => (
        <li key={`chat-${index}`}>
          <Text variant="body-medium">
            {`${msg.timestamp} - ${msg.nickname}: ${msg.message}`}
          </Text>
        </li>
      ))}
    </ul>
  );
};
