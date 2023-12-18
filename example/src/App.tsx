import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import {
  useCompleteFlow,
  type IProgressCallback,
  type IAttachmentItem,
} from 'react-native-attachments';

const DEFAULT_ATTACHMENTS_STATE: Partial<IAttachmentItem>[] = [
  {
    path: '/usr/image1.jpg',
    type: 'FILE',
  },
  {
    path: '/usr/image2.jpg',
    type: 'FILE',
  },
  {
    path: '/usr/image3.jpg',
    type: 'FILE',
  },
];

const handleUpload: IProgressCallback = async (
  attachment,
  { onProgress, onSuccess, onFailure }
) => {
  onProgress();

  return new Promise((resolve) => {
    setTimeout(() => {
      onSuccess();
      resolve(attachment);
      onFailure;
    }, 2000);
  });
};

const handlePrepare: IProgressCallback = async (
  attachment,
  { onProgress, onSuccess, onFailure }
) => {
  onProgress();

  return new Promise((resolve) => {
    setTimeout(() => {
      onSuccess();
      resolve(attachment);
      onFailure;
    }, 2000);
  });
};

const handleEncrypt: IProgressCallback = async (
  attachment,
  { onProgress, onSuccess, onFailure }
) => {
  onProgress();

  return new Promise((resolve) => {
    setTimeout(() => {
      onSuccess();
      resolve(attachment);
      onFailure;
    }, 2000);
  });
};

export default function App() {
  const completeFlow = useCompleteFlow([], {
    handleUpload,
    handlePrepare,
    handleEncrypt,
  });

  React.useEffect(() => {
    completeFlow.addAttachments(DEFAULT_ATTACHMENTS_STATE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setTimeout(() => completeFlow.completeFlow(), 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {completeFlow.attachments.map((attachment, index) => (
        <Text key={index}>
          {attachment.path} {attachment.action} {attachment.status}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
