import { NFTStorage, CIDString } from 'nft.storage';
import { filesFromPath } from 'files-from-path';
import path from 'path';
import { Blob } from 'nft.storage';
import IService from '../IService.js';

interface IIpfsService extends IService {
  nftStorage: {
    storeImageData: (image: Buffer) => Promise<CIDString | undefined>;
    storeNftDir: (directoryPath: string) => Promise<CIDString>;
  };
}
const ipfsService: IIpfsService = {
  start: async function () {
    return;
  },
  nftStorage: {
    storeImageData: async function (image: Buffer) {
      try {
        const nftStorage = new NFTStorage({
          token: process.env.NFT_STORAGE_KEY!
        });
        const buffered = Buffer.from(image);
        const blob = await new Blob([buffered], { type: 'image/' });
        return nftStorage.storeBlob(blob);
      } catch (e) {
        //TODO : Throw appropriate exception.
        console.error(e);
      }
    },
    storeNftDir: async function (directoryPath: string) {
      const files = filesFromPath(directoryPath, {
        pathPrefix: path.resolve(directoryPath),
        hidden: true // use the default of false if you want to ignore files that start with '.'
      });
      const storage = new NFTStorage({ token: process.env.NFT_STORAGE_KEY! });
      const cid = await storage.storeDirectory(files);
      return cid;
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stop: async function () {}
};

export default ipfsService;
