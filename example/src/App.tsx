import * as React from 'react';

import { StyleSheet, View, Text, Pressable } from 'react-native';
import {
  useCompleteFlow,
  pickImage,
  pickFile,
  type IProgressCallback,
  type IAttachmentItem,
  type IPickDocumentSuccessCallback,
  type IPickImageSuccessCallback,
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
  meta,
  encryptResponse,
  prepareResponse,
  { onProgress, onSuccess, onFailure }
) => {
  onProgress();

  return new Promise((resolve) => {
    setTimeout(() => {
      onSuccess();
      resolve({ inputFilePath: '', outputFilePath: '' });
      onFailure;
    }, 2000);
  });
};

const handlePrepare: IProgressCallback = async (
  attachment,
  meta,
  encryptResponse,
  prepareResponse,
  { onProgress, onSuccess, onFailure }
) => {
  onProgress();

  return new Promise((resolve) => {
    setTimeout(() => {
      onSuccess();
      resolve({ inputFilePath: '', outputFilePath: '' });
      onFailure;
    }, 2000);
  });
};

const handleEncrypt: IProgressCallback = async (
  attachment,
  meta,
  encryptResponse,
  prepareResponse,
  { onProgress, onSuccess, onFailure }
) => {
  onProgress();

  return new Promise((resolve) => {
    setTimeout(() => {
      onSuccess();
      resolve({ inputFilePath: '', outputFilePath: '' });
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
    completeFlow.addMeta('asd', 'dsa');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePickImage = React.useCallback(() => {
    const onSuccess: IPickImageSuccessCallback = (assets) => {
      const modifiedAssets = assets.map((asset) => ({
        path: asset.uri!,
        type: 'IMAGE' as 'IMAGE',
      }));
      completeFlow.addAttachments(modifiedAssets);
    };

    pickImage({ mediaType: 'mixed' }, { onSuccess });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePickFile = React.useCallback(() => {
    const onSuccess: IPickDocumentSuccessCallback = (assets) => {
      const modifiedAssets = assets.map((asset) => ({
        path: asset.uri!,
        type: 'FILE' as 'FILE',
      }));
      completeFlow.addAttachments(modifiedAssets);
    };

    pickFile({}, { onSuccess });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handlePickImage}>
        <Text>Pick image</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handlePickFile}>
        <Text>Pick file</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={completeFlow.completeFlow}>
        <Text>Process all</Text>
      </Pressable>

      {completeFlow.attachments.map((attachment, index) => (
        <Text style={styles.text} key={index}>
          {attachment.path} {attachment.action} {attachment.status}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ececec',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  text: {
    marginBottom: 10,
  },
});
