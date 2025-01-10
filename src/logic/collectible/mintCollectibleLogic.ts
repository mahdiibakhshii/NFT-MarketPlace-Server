import fs from 'fs';
import { mediaGetLogic } from '../media/mediaGetLogic.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ICollectible } from '../../models/collectible.js';
import { IUser } from '../../models/user.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import ipfsService from '../../services/ipfs/ipfsService.js';
export async function mintCollectibleLogic(
  userID: ObjectIDType<IUser>,
  colletibleID: ObjectIDType<ICollectible>
): Promise<{
  statusCode: number;
  data:
    | {
        tokenId: number;
        ipfs: string;
        collectionIndex: number;
        collectibleAmount: number;
        collectibleName: string;
      }
    | undefined;
  err: string | undefined;
}> {
  try {
    const collectibleObj = await CollectibleRepo.getByCollectibleID(
      colletibleID
    );
    //validate the request
    if (collectibleObj === null)
      return {
        statusCode: 404,
        data: undefined,
        err: 'collectible not found!'
      };
    if (collectibleObj?.creator!.toString() !== userID.toString())
      return {
        statusCode: 409,
        data: undefined,
        err: 'You dont have permission to mint this collectible!'
      };
    if (collectibleObj.state === 1)
      return {
        statusCode: 409,
        data: undefined,
        err: 'collectible already minted!'
      };
    //fetch collection to be minted on and calculate tokenID.
    const collectionObj = await CollectionRepo.getTokensCount(
      collectibleObj.collectionID!
    );
    const tokenID = collectionObj!.tokensCount! + 1;
    //store collectible metadata into IPFS
    const nftDir =
      process.env.COLLECTIONS_METADATA_PATH! + collectionObj?.contractAddress;
    const imageToBeMinted = await mediaGetLogic(
      collectibleObj.imageHash!,
      undefined
    );
    if (!imageToBeMinted.found)
      return {
        statusCode: 500,
        data: undefined,
        err: 'No collectible media has attached!'
      };
    const image: Buffer = imageToBeMinted.media!;
    const imageIpfsCID = await ipfsService.nftStorage.storeImageData(
      Buffer.from(image)
    );
    if (imageIpfsCID)
      await CollectibleRepo.updateIpfsByCollectibleID(
        colletibleID,
        imageIpfsCID
      );
    else
      return {
        statusCode: 500,
        data: undefined,
        err: 'error in uploading image at ipfs'
      };
    const nftMetaData = {
      image: 'ipfs.io/ipfs/' + imageIpfsCID,
      name: collectibleObj.name,
      description: collectibleObj.description
    };
    await fs.promises.writeFile(
      nftDir + '/' + tokenID + '.json',
      JSON.stringify(nftMetaData),
      'utf8'
    );
    const directoryCID = await ipfsService.nftStorage.storeNftDir(nftDir);
    const ipfs: string = 'ipfs.io/ipfs/' + directoryCID + '/';
    await CollectionRepo.updateIpfsCIDByCollectionID(
      collectibleObj.collectionID!,
      ipfs
    );
    return {
      statusCode: 200,
      data: {
        tokenId: tokenID,
        ipfs: ipfs,
        collectionIndex: collectionObj!.contractIndex!,
        collectibleAmount: collectibleObj!.volume!,
        collectibleName: collectibleObj!.name!
      },
      err: undefined
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      data: undefined,
      err: 'unhandled error handled!'
    };
  }
}
