import { RiChat1Line } from '@remixicon/react';
import {
  Card,
  CardBody,
  CardHeader,
  Flex,
  PluginHeader,
  Text,
} from '@backstage/ui';
import {
  featureFlagsApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';
import { SIMPLE_CHAT_USER_LIST_FLAG } from '../../api/types';
import { useChatPresence } from '../../hooks/useChatPresence';
import { ChatMessageDisplay } from '../ChatMessageDisplay/ChatMessageDisplay';
import { ChatMessageInput } from '../ChatMessageInput/ChatMessageInput';
import { ConnectedUsersPanel } from '../ConnectedUsersPanel';
import styles from './ExampleComponent.module.css';

export const ExampleComponent = () => {
  useChatPresence();

  const featureFlagsApi = useApi(featureFlagsApiRef);
  const showUserList = featureFlagsApi.isActive(SIMPLE_CHAT_USER_LIST_FLAG);

  return (
    <>
      <PluginHeader title="Simple Chat" icon={<RiChat1Line />} />
      <div className={styles.page}>
        <Card>
          <CardHeader>
            <Text variant="title-small">Welcome to simple-chat!</Text>
          </CardHeader>
          <CardBody>
            <Flex direction="column" gap="3">
              <div className={styles.chatLayout}>
                <div className={styles.messagePane}>
                  <ChatMessageDisplay />
                </div>
                {showUserList && <ConnectedUsersPanel />}
              </div>
              <ChatMessageInput />
            </Flex>
          </CardBody>
        </Card>
      </div>
    </>
  );
};
