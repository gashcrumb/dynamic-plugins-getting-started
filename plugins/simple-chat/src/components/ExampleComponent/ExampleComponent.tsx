import { RiChat1Line } from '@remixicon/react';
import {
  Card,
  CardBody,
  CardHeader,
  Flex,
  PluginHeader,
  Text,
} from '@backstage/ui';
import { ChatMessageDisplay } from '../ChatMessageDisplay/ChatMessageDisplay';
import { ChatMessageInput } from '../ChatMessageInput/ChatMessageInput';
import styles from './ExampleComponent.module.css';

export const ExampleComponent = () => (
  <>
    <PluginHeader title="Simple Chat" icon={<RiChat1Line />} />
    <div className={styles.page}>
      <Card>
        <CardHeader>
          <Text variant="title-small">Welcome to simple-chat!</Text>
        </CardHeader>
        <CardBody>
          <Flex direction="column" gap="3">
            <div className={styles.messagePane}>
              <ChatMessageDisplay />
            </div>
            <ChatMessageInput />
          </Flex>
        </CardBody>
      </Card>
    </div>
  </>
);
