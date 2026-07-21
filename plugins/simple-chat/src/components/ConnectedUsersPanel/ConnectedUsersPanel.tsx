import { Text } from '@backstage/ui';
import { useChatUsers } from '../../hooks/useChatUsers';
import styles from './ConnectedUsersPanel.module.css';

export const ConnectedUsersPanel = () => {
  const { users, error } = useChatUsers();

  return (
    <aside className={styles.panel} aria-label="Connected users">
      <Text variant="title-x-small">Connected users</Text>
      {error ? (
        <Text color="danger" variant="body-small">
          Error loading users: {`${error}`}
        </Text>
      ) : !users || users.length === 0 ? (
        <Text color="secondary" variant="body-small">
          No users connected yet
        </Text>
      ) : (
        <ul className={styles.list}>
          {users.map(user => (
            <li key={user.userEntityRef}>
              <Text variant="body-small">{user.userEntityRef}</Text>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};
