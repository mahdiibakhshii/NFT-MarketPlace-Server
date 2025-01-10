import { IUserProps } from '../../models/user.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import UserRepo from '../../repos/user/userRepo.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { IListOnSale } from '../../models/listOnSale.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';

interface actionObjLogicInput {
  collectionAddress: string;
  tokenID: number;
  auctionNum: number;
  auctioneer: string;
}

export async function activeAuctionLogic(
  auctionObj: actionObjLogicInput
): Promise<{
  statusCode: number;
  data: ObjectIDType<IListOnSale> | undefined;
  err: string | undefined;
}> {
  try {
    //DOC: Fetch auctioneer obj
    const auctioneerObj = await UserRepo.findByAccountID(
      auctionObj.auctioneer,
      IUserProps.idOnly
    );
    if (!auctioneerObj) {
      //TODO: add exception log
      return { statusCode: 404, data: undefined, err: 'buyer not found!' };
    }
    //DOC: verify request
    const collectionAddress = await CollectionRepo.getByContractAddress(
      auctionObj.collectionAddress
    );
    if (!collectionAddress) {
      //TODO: add exception log
      return {
        statusCode: 404,
        data: undefined,
        err: 'collection not found!'
      };
    }
    const collectibleObj = await CollectibleRepo.getByCollectionIDandTokenID(
      collectionAddress._id!,
      auctionObj.tokenID
    );
    if (collectibleObj == null) {
      return {
        statusCode: 404,
        data: undefined,
        err: 'collectible not found!'
      };
    }
    //DOC: Validation
    const x =
      await ListOnSaleRepo.getInitializedAuctionByCollectibleIDAndSeller(
        collectibleObj._id!,
        auctioneerObj._id!
      );
    if (!x) {
      return {
        statusCode: 404,
        data: undefined,
        err: 'initialized auction not found!'
      };
    }
    await ListOnSaleRepo.activeAuctionState(x._id!);
    return { statusCode: 200, data: x._id, err: undefined };
  } catch (e) {
    console.log('error in activing auction', e);
    return {
      statusCode: 500,
      data: undefined,
      err: 'create activing failed!'
    };
  }
}
