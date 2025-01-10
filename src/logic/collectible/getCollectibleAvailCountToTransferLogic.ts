import { ObjectIDType } from '../../helpers/aliases.js';
import { IUser } from '../../models/user.js';
import { ICollectible } from '../../models/collectible.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';

export async function getCollectibleAvailCountToTransferLogic(
  userID: ObjectIDType<IUser>,
  collectibleID: ObjectIDType<ICollectible>
): Promise<{
  statusCode: number;
  data:
    | {
        availCount: number;
      }
    | undefined;
  err: string | undefined;
}> {
  const collectibleObj = await CollectibleRepo.getByCollectibleID(
    collectibleID
  );
  if (!collectibleObj)
    return {
      statusCode: 404,
      data: undefined,
      err: 'collectible not found!'
    };
  const isOwner = await CollectibleRepo.checkCollectibleOwnershipByUserID(
    collectibleID,
    userID
  );
  if (!isOwner)
    return {
      statusCode: 409,
      data: undefined,
      err: 'requested user is not collectible owner!'
    };
  const ownerCount = await CollectibleRepo.getOwnerCountByCollectibleID(
    collectibleID,
    userID
  );
  const listAmount =
    await ListOnSaleRepo.getCollectibleListingTotalAmountByCollectibleIDAndSellerID(
      collectibleID,
      userID
    );
  return {
    statusCode: 200,
    data: {
      availCount:
        ownerCount == null || ownerCount == undefined
          ? 0
          : ownerCount - listAmount
    },
    err: undefined
  };
}
