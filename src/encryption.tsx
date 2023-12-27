import fs from 'fs';
import crypto from 'crypto';

type IEvent = 'LOADING' | 'SUCCESS' | 'FAILURE';
export type IEncryptionPayload = {
  LOADING: { inputFilePath: string; outputFilePath: string };
  SUCCESS: { inputFilePath: string; outputFilePath: string };
  FAILURE: { inputFilePath: string; outputFilePath: string; error: string };
};
export type IEncryptionCallback = <T extends IEvent>(
  event: T,
  payload: IEncryptionPayload[T]
) => void;

export async function encryptFile(
  path: {
    inputFilePath: string;
    outputFilePath: string;
  },
  options: {
    key: crypto.CipherKey;
    ivv: crypto.BinaryLike;
    bufferSize: number;
  },
  callback: IEncryptionCallback
): Promise<void> {
  const readStream = fs.createReadStream(path.inputFilePath, {
    encoding: 'base64',
    highWaterMark: options.bufferSize,
  });
  const writeStream = fs.createWriteStream(path.outputFilePath, {
    encoding: 'base64',
    flags: 'a', // 'a' for appending data
  });

  const cipher = crypto.createCipheriv(
    'aes-128-cbc' as crypto.CipherGCMTypes,
    options.key,
    options.ivv
  );

  readStream.on('error', (error: any) => {
    callback('FAILURE', { ...path, error: error.message });
  });

  readStream.on('data', (chunk: any) => {
    const encryptedChunk = cipher.update(chunk, 'utf8', 'base64');
    writeStream.write(encryptedChunk);
    callback('LOADING', path);
  });

  readStream.on('end', async () => {
    const finalEncryptedChunk = cipher.final('base64');
    writeStream.write(finalEncryptedChunk);
    writeStream.end();
    callback('SUCCESS', path);
  });
}

export async function decryptFile(
  path: {
    inputFilePath: string;
    outputFilePath: string;
  },
  options: {
    key: crypto.CipherKey;
    ivv: crypto.BinaryLike;
    bufferSize: number;
  },
  callback: IEncryptionCallback
): Promise<void> {
  const readStream = fs.createReadStream(path.inputFilePath, {
    encoding: 'base64',
    highWaterMark: options.bufferSize,
  });
  const writeStream = fs.createWriteStream(path.outputFilePath, {
    encoding: 'base64',
    flags: 'a', // 'a' for appending data
  });

  const decipher = crypto.createDecipheriv(
    'aes-128-cbc' as crypto.CipherGCMTypes,
    options.key,
    options.ivv
  );

  readStream.on('error', (error: any) => {
    callback('FAILURE', { ...path, error: error.message });
  });

  readStream.on('data', (chunk: any) => {
    const decryptedChunk = decipher.update(chunk, 'base64', 'utf8');
    writeStream.write(decryptedChunk);
    callback('LOADING', path);
  });

  readStream.on('end', async () => {
    const finalDecryptedChunk = decipher.final('utf8');
    writeStream.write(finalDecryptedChunk);
    writeStream.end();
    callback('SUCCESS', path);
  });
}
