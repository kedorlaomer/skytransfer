import { EncryptedFileReference } from '../models/encryption';
import { genKeyPairFromSeed, SkynetClient } from "skynet-js";
import { DEFAULT_DOMAIN, ENCRYPTED_FILES_SKYDB_KEY_NAME } from '../config';

class Utils {
  skynetClient = new SkynetClient(DEFAULT_DOMAIN);

  public generateEncryptionKey(sessionPrivateKey: string): string {
    return genKeyPairFromSeed(`${sessionPrivateKey}-aes-encrypt`).privateKey;
  }

  public async storeSessionEncryptedFiles(sessionPrivateKey: string, encryptedFiles: EncryptedFileReference[]): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (encryptedFiles.length === 0) {
        return resolve(false);
      }

      try {
        await this.skynetClient.db.setJSON(
          sessionPrivateKey,
          ENCRYPTED_FILES_SKYDB_KEY_NAME,
          {
            data: encryptedFiles,
          },
        );
        return resolve(true);
      } catch (error) {
        return reject(error);
      }
    });
  }

  public async getSessionEncryptedFiles(sessionPublicKey: string): Promise<EncryptedFileReference[]> {
    let files: EncryptedFileReference[] = [];

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this.skynetClient.db.getJSON(
          sessionPublicKey,
          ENCRYPTED_FILES_SKYDB_KEY_NAME,
        );

        if (data) {
          files = data.data as EncryptedFileReference[];
        }

        return resolve(files);
      } catch (error) {
        return reject(error);
      }
    });
  }

  publicKeyFromPrivateKey(privateKey: string): string {
    return privateKey.substr(privateKey.length - 64);
  }

  public fileSize(size: number): string {
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
}

export default Utils;
