const { Buffer } = require('node:buffer');

export const getStaticProps = async () => {
  const { encryptFile, decryptFile } = require('react-native-attachments');

  encryptFile(
    {
      inputFilePath:
        '/Users/home/Library/Developer/CoreSimulator/Devices/F0D9B972-0168-4007-A473-1E4E8ABABD34/data/Media/DCIM/100APPLE/IMG_0001.JPG',
      outputFilePath:
        '/Users/home/Library/Developer/CoreSimulator/Devices/F0D9B972-0168-4007-A473-1E4E8ABABD34/data/Media/DCIM/100APPLE/IMG_0001.JPG.encrypted',
    },
    {
      key: Buffer.from('DEFAULT_KEYINPUT'),
      ivv: Buffer.from('DEFAULT_IVVINPUT'),
    },
    console.log
  );

  decryptFile(
    {
      inputFilePath:
        '/Users/home/Library/Developer/CoreSimulator/Devices/F0D9B972-0168-4007-A473-1E4E8ABABD34/data/Media/DCIM/100APPLE/IMG_0001.JPG.encrypted',
      outputFilePath:
        '/Users/home/Library/Developer/CoreSimulator/Devices/F0D9B972-0168-4007-A473-1E4E8ABABD34/data/Media/DCIM/100APPLE/IMG_0001.JPG.decrypted',
    },
    {
      key: Buffer.from('DEFAULT_KEYINPUT'),
      ivv: Buffer.from('DEFAULT_IVVINPUT'),
    },
    console.log
  );

  return {
    props: {
      fileContent: null,
    },
  };
};

export default function Home({ fileContent }) {
  return null;
}
