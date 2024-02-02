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
  action: 'IDLE' | 'UPLOAD';
};

export type IAttachmentState = IAttachmentItem[];
export type IMetaState = Record<string, string>;

export type IProgressCallback = (
  attachment: IAttachmentItem,
  meta: IMetaState,
  callbacks: {
    onProgress: () => void;
    onSuccess: () => void;
    onFailure: () => void;
  }
) => Promise<{ inputFilePath: string; outputFilePath: string }>;

type IAddAttachmentsCallback = (
  attachments: Partial<IAttachmentItem>[]
) => void;

type IHandleUploadCallback = (
  attachment: IAttachmentItem,
  meta: IMetaState
) => Promise<{ inputFilePath: string; outputFilePath: string }>;

type IHandleCompleteFlowOptions = {
  upload?: IHandleUploadCallback;
};

export async function handleCompleteFlow(
  attachments: IAttachmentState,
  meta: IMetaState,
  options: IHandleCompleteFlowOptions,
  callbacks: {
    onSuccess: () => void;
    onProgress: () => void;
    onFailure: () => void;
  }
): Promise<void> {
  callbacks.onProgress();

  for await (const attachment of attachments) {
    try {
      if (options.upload) {
        await options.upload(attachment, meta);
      }
    } catch (error) {
      callbacks.onFailure();
      // @ts-ignore
      console.warn('Failed to process complete flow: ' + error?.message);
    }

    await callbacks.onSuccess();
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
  }: {
    handleUpload: IProgressCallback;
  },
  callbacks: {
    onSuccess: () => void;
    onProgress: () => void;
    onFailure: () => void;
  }
) {
  const [_, setMeta] = React.useState<IMetaState>({});
  const [attachments, setAttachments] =
    React.useState<IAttachmentState>(defaultAttachments);

  /**
   * ADD META
   */
  const addMeta = (key: string, value: string) => {
    setMeta((metaState) => ({ ...metaState, [key]: value }));
  };

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
   * UPLOAD
   */
  const upload: IHandleUploadCallback = async (attachment, meta) => {
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

    return handleUpload(attachment, meta, {
      onProgress,
      onSuccess,
      onFailure,
    });
  };

  const completeFlow = () => {
    setMeta((metaState) => {
      setAttachments((attachmentsState) => {
        handleCompleteFlow(
          attachmentsState,
          metaState,
          {
            upload,
          },
          callbacks
        );
        return attachmentsState;
      });
      return metaState;
    });
  };

  return {
    addMeta,
    attachments,
    completeFlow,
    addAttachments,
  };
}
