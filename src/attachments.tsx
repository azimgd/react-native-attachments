import React from 'react';

const DEFAULT_ATTACHMENT_ITEM = {
  path: undefined,
  type: undefined,
  progress: 0,
  status: 'IDLE',
  action: 'IDLE',
};

export type IAttachmentItem = {
  path: string;
  type: 'FILE' | 'IMAGE';
  progress: number;
  status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAILURE';
  action: 'IDLE' | 'ENCRYPT' | 'DECRYPT' | 'PREPARE' | 'UPLOAD';
};

export type IAttachmentState = IAttachmentItem[];

export type IProgressCallback = (
  attachment: IAttachmentItem,
  encryptResponse:
    | { inputFilePath: string; outputFilePath: string }
    | undefined,
  prepareResponse:
    | { inputFilePath: string; outputFilePath: string }
    | undefined,
  callbacks: {
    onProgress: () => void;
    onSuccess: () => void;
    onFailure: () => void;
  }
) => Promise<{ inputFilePath: string; outputFilePath: string }>;

type IAddAttachmentsCallback = (
  attachments: Partial<IAttachmentItem>[]
) => void;

type IHandleEncryptCallback = (
  attachment: IAttachmentItem
) => Promise<{ inputFilePath: string; outputFilePath: string }>;

type IHandlePrepareCallback = (
  attachment: IAttachmentItem,
  encryptResponse?: { inputFilePath: string; outputFilePath: string }
) => Promise<{ inputFilePath: string; outputFilePath: string }>;

type IHandleUploadCallback = (
  attachment: IAttachmentItem,
  encryptResponse?: { inputFilePath: string; outputFilePath: string },
  prepareResponse?: { inputFilePath: string; outputFilePath: string }
) => Promise<{ inputFilePath: string; outputFilePath: string }>;

type IHandleCompleteFlowOptions = {
  encrypt?: IHandleEncryptCallback;
  prepare?: IHandlePrepareCallback;
  upload?: IHandleUploadCallback;
};

export async function handleCompleteFlow(
  attachments: IAttachmentState,
  options: IHandleCompleteFlowOptions
): Promise<void> {
  for await (const attachment of attachments) {
    try {
      let encryptResponse;
      if (options.encrypt) {
        await options.encrypt(attachment);
      }

      let prepareResponse;
      if (options.prepare) {
        await options.prepare(attachment, encryptResponse);
      }

      if (options.upload) {
        await options.upload(attachment, encryptResponse, prepareResponse);
      }
    } catch (error) {
      throw new Error('Failed to process complete flow');
    }
  }

  return Promise.resolve();
}

const updateAttachmentByPath = (
  attachments: IAttachmentState,
  attachmentPath: string,
  attachmentPartial: Partial<IAttachmentItem>
) =>
  attachments.map((attachment) => {
    if (attachment.path === attachmentPath) {
      return { ...attachment, ...attachmentPartial };
    }
    return attachment;
  });

export function useCompleteFlow(
  defaultAttachments: IAttachmentState,
  {
    handleUpload,
    handlePrepare,
    handleEncrypt,
  }: {
    handleUpload: IProgressCallback;
    handlePrepare: IProgressCallback;
    handleEncrypt: IProgressCallback;
  }
) {
  const [attachments, setAttachments] =
    React.useState<IAttachmentState>(defaultAttachments);

  /**
   * ADD ATTACHMENTS
   */
  const addAttachments: IAddAttachmentsCallback = (newAttachments) => {
    setAttachments((attachmentsState) => {
      const existingAttachments = newAttachments.map(
        (attachment) => attachment.path
      );
      const filteredAttachments = attachmentsState.filter(
        (attachment) => !existingAttachments.includes(attachment.path)
      );
      const alteredAttachments = newAttachments.map((attachment) => ({
        ...DEFAULT_ATTACHMENT_ITEM,
        ...attachment,
      }));
      return filteredAttachments.concat(alteredAttachments as IAttachmentState);
    });
  };

  /**
   * ENCRYPT
   */
  const encrypt: IHandleEncryptCallback = async (attachment) => {
    const onProgress = () =>
      setAttachments((attachmentsState) =>
        updateAttachmentByPath(attachmentsState, attachment.path, {
          action: 'ENCRYPT',
          status: 'LOADING',
        })
      );

    const onSuccess = () =>
      setAttachments((attachmentsState) =>
        updateAttachmentByPath(attachmentsState, attachment.path, {
          action: 'ENCRYPT',
          status: 'SUCCESS',
        })
      );

    const onFailure = () =>
      setAttachments((attachmentsState) =>
        updateAttachmentByPath(attachmentsState, attachment.path, {
          action: 'ENCRYPT',
          status: 'FAILURE',
        })
      );

    return handleEncrypt(attachment, undefined, undefined, {
      onProgress,
      onSuccess,
      onFailure,
    });
  };

  /**
   * PREPARE
   */
  const prepare: IHandlePrepareCallback = async (
    attachment,
    encryptResponse
  ) => {
    const onProgress = () =>
      setAttachments((attachmentsState) =>
        updateAttachmentByPath(attachmentsState, attachment.path, {
          action: 'PREPARE',
          status: 'LOADING',
        })
      );

    const onSuccess = () =>
      setAttachments((attachmentsState) =>
        updateAttachmentByPath(attachmentsState, attachment.path, {
          action: 'PREPARE',
          status: 'SUCCESS',
        })
      );

    const onFailure = () =>
      setAttachments((attachmentsState) =>
        updateAttachmentByPath(attachmentsState, attachment.path, {
          action: 'PREPARE',
          status: 'FAILURE',
        })
      );

    return handlePrepare(attachment, encryptResponse, undefined, {
      onProgress,
      onSuccess,
      onFailure,
    });
  };

  /**
   * UPLOAD
   */
  const upload: IHandleUploadCallback = async (
    attachment,
    encryptResponse,
    prepareResponse
  ) => {
    const onProgress = () =>
      setAttachments((attachmentsState) =>
        updateAttachmentByPath(attachmentsState, attachment.path, {
          action: 'UPLOAD',
          status: 'LOADING',
        })
      );

    const onSuccess = () =>
      setAttachments((attachmentsState) =>
        updateAttachmentByPath(attachmentsState, attachment.path, {
          action: 'UPLOAD',
          status: 'SUCCESS',
        })
      );

    const onFailure = () =>
      setAttachments((attachmentsState) =>
        updateAttachmentByPath(attachmentsState, attachment.path, {
          action: 'UPLOAD',
          status: 'FAILURE',
        })
      );

    return handleUpload(attachment, encryptResponse, prepareResponse, {
      onProgress,
      onSuccess,
      onFailure,
    });
  };

  const completeFlow = React.useCallback(() => {
    setAttachments((attachmentsState) => {
      handleCompleteFlow(attachmentsState, {
        encrypt,
        prepare,
        upload,
      });
      return attachments;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    attachments,
    completeFlow,
    addAttachments,
  };
}
