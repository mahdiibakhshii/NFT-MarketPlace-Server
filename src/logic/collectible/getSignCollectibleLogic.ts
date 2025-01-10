import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ICollectible } from '../../models/collectible.js';
import { IUser } from '../../models/user.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import CollectionRepo from '../../repos/collectionRepo.js';

export async function getSignCollectibleLogic(
  userID: ObjectIDType<IUser>,
  colletibleID: ObjectIDType<ICollectible>,
  amount: number
): Promise<{
  statusCode: number;
  data:
    | {
        collectionAddress: string;
        collectibleId: number;
      }
    | undefined;
  err: string | undefined;
}> {
  const collectibleObj = await CollectibleRepo.getByCollectibleID(colletibleID);
  //validate the request
  if (collectibleObj === null)
    return {
      statusCode: 404,
      data: undefined,
      err: 'collectible not found!'
    };
  const isOwner = await CollectibleRepo.checkCollectibleOwnershipByUserID(
    collectibleObj._id!,
    userID
  );
  if (!isOwner)
    return {
      statusCode: 409,
      data: undefined,
      err: 'You dont have permission to sign this collectible!'
    };
  const ownerCount = await CollectibleRepo.getOwnerCountByCollectibleID(
    collectibleObj._id!,
    userID
  );
  if (ownerCount && amount > ownerCount)
    return {
      statusCode: 409,
      data: undefined,
      err: 'requested amount is higher than ownership amout!'
    };
  if (collectibleObj.state !== 1)
    return {
      statusCode: 409,
      data: undefined,
      err: 'collectible is not minted!'
    };
  if (
    await ListOnSaleRepo.checkActiveListOnSaleByCollectibleIDAndSeller(
      collectibleObj._id!,
      userID
    )
  )
    return {
      statusCode: 409,
      data: undefined,
      err: 'this user already has unfinished listing on this collectible!'
    };
  //fetch collection to be minted on and calculate tokenID.
  const collectionObj = await CollectionRepo.getTokensCount(
    collectibleObj.collectionID!
  );

  return {
    statusCode: 200,
    data: {
      collectibleId: collectibleObj.tokenID!,
      collectionAddress: collectionObj!.contractAddress!
    },
    err: undefined
  };
}
