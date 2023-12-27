import DocumentPicker, {
  type DocumentPickerOptions,
  type DocumentPickerResponse,
} from 'react-native-document-picker';
import {
  launchImageLibrary,
  type ImageLibraryOptions,
  type Asset,
} from 'react-native-image-picker';

export type IPickImageSuccessCallback = (assets: Asset[]) => void;
export type IPickImageFailureCallback = () => void;
export type IPickDocumentSuccessCallback = (
  assets: DocumentPickerResponse[]
) => void;
export type IPickDocumentFailureCallback = () => void;

export const pickImage = async (
  options: ImageLibraryOptions,
  callbacks: {
    onSuccess: IPickImageSuccessCallback;
    onFailure?: IPickImageFailureCallback;
  }
) => {
  try {
    const response = await launchImageLibrary(options);

    if (response.didCancel) {
      throw new Error('image cannot be picked');
    }

    if (response.errorMessage || !response.assets) {
      throw new Error('image cannot be picked');
    }

    return callbacks.onSuccess(
      response.assets.map((item) => ({
        ...item,
        uri: item.uri ? item.uri.replace('file://', '') : undefined,
      }))
    );
  } catch (error) {
    if (callbacks.onFailure) {
      return callbacks.onFailure();
    }
  }
};

export const pickFile = async (
  options: DocumentPickerOptions<'ios'>,
  callbacks: {
    onSuccess: (assets: DocumentPickerResponse[]) => void;
    onFailure?: () => void;
  }
) => {
  try {
    const response = await DocumentPicker.pickSingle(options);
    response.uri = response.uri.replace('file://', '');

    return callbacks.onSuccess([response]);
  } catch (error) {
    if (callbacks.onFailure) {
      return callbacks.onFailure();
    }
  }
};
