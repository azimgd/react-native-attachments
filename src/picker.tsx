import {
  type DocumentPickerOptions,
  type DocumentPickerResponse,
} from 'react-native-document-picker';
import {
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
  options;
  callbacks;
};

export const pickFile = async (
  options: DocumentPickerOptions<'ios'>,
  callbacks: {
    onSuccess: (assets: DocumentPickerResponse[]) => void;
    onFailure?: () => void;
  }
) => {
  options;
  callbacks;
};
