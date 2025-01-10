import moment from 'moment';
import CollectionRepo from '../../repos/collectionRepo.js';
import { IUserProps } from '../../models/user.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import SellReceiptRepo from '../../repos/sellReceiptRepo.js';
import UserRepo from '../../repos/user/userRepo.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import { sellReceiptTypeEnum } from '../../models/sellReceipt.js';
import ActivityRepo from '../../repos/activityRepo.js';
import { activityTypeEnum } from '../../models/activity.js';
import NotificationRepo from '../../repos/notificationRepo.js';
import { notificationTypeEnum } from '../../models/notification.js';

interface ISellReceiptLogicInput {
  buyer: string;
  seller: string;
  collectionAddress: string;
  tokenID: number;
  auctionNum?: number;
  sellPrice: number;
  amount: number;
  type: sellReceiptTypeEnum;
  royaltyAddress: string | undefined;
  royaltyAmount: number | undefined;
}
export async function createSellReceiptLogic(
  sellReceiptObj: ISellReceiptLogicInput
) {
  try {
    console.log({ sellReceiptObj });
    //DOC: Fetch buyer and seller obj
    const buyerObj = await UserRepo.findByAccountID(
      sellReceiptObj.buyer,
      IUserProps.idOnly
    );
    const sellerObj = await UserRepo.findByAccountID(
      sellReceiptObj.seller,
      IUserProps.idOnly
    );
    if (!buyerObj) {
      //TODO: add exception log
      return { statusCode: 404, data: undefined, err: 'buyer not found!' };
    }
    if (!sellerObj) {
      //TODO: add exception log
      return { statusCode: 404, data: undefined, err: 'seller not found!' };
    }
    //DOC: verify request
    const collectionAddress = await CollectionRepo.getByContractAddress(
      sellReceiptObj.collectionAddress
    );
    if (!collectionAddress) {
      //TODO: add exception log
      return { statusCode: 404, data: undefined, err: 'collection not found!' };
    }
    const collectibleObj = await CollectibleRepo.getByCollectionIDandTokenID(
      collectionAddress._id!,
      sellReceiptObj.tokenID
    );
    if (collectibleObj == null) {
      return {
        statusCode: 404,
        data: undefined,
        err: 'collectible not found!'
      };
    }
    //DOC: update ownersList and create activity docs
    if (sellReceiptObj.type !== sellReceiptTypeEnum.forServiceFee) {
      const isBuyerAlreadyOwner =
        await CollectibleRepo.checkCollectibleOwnershipByUserID(
          collectibleObj._id!,
          buyerObj._id!
        );
      const sellerOwnCount = await CollectibleRepo.getOwnerCountByCollectibleID(
        collectibleObj._id!,
        sellerObj._id!
      );
      if (!sellerOwnCount || sellerOwnCount - sellReceiptObj.amount < 0)
        return {
          statusCode: 409,
          data: undefined,
          err: 'seller ownes count is less than receipt amount!'
        };
      if (isBuyerAlreadyOwner) {
        await CollectibleRepo.updateOwnerCountByCollectibleID(
          collectibleObj._id!,
          buyerObj._id!,
          sellReceiptObj.amount
        );
      } else {
        await CollectibleRepo.setOwnerByCollectibleID(
          collectibleObj._id!,
          buyerObj._id!,
          sellReceiptObj.amount
        );
      }
      await CollectibleRepo.updateOwnerCountByCollectibleID(
        collectibleObj._id!,
        sellerObj._id!,
        sellReceiptObj.amount * -1
      );
      if (sellReceiptObj.type === sellReceiptTypeEnum.forTransferByOwner) {
        //DOC: create transfer activity for giver
        await ActivityRepo.createActivity({
          collectible: collectibleObj._id,
          user: sellerObj._id!,
          secondUser: buyerObj._id!,
          amount: sellReceiptObj.amount!,
          type: activityTypeEnum.nftTransferOut,
          issueDate: moment().toDate()
        });
        //DOC: create transfer activity for getter
        await ActivityRepo.createActivity({
          collectible: collectibleObj._id,
          user: buyerObj._id!,
          secondUser: sellerObj._id!,
          amount: sellReceiptObj.amount!,
          type: activityTypeEnum.nftTransferIn,
          issueDate: moment().toDate()
        });
      } else {
        //DOC: create sell activity for seller
        await ActivityRepo.createActivity({
          collectible: collectibleObj._id,
          user: sellerObj._id!,
          secondUser: buyerObj._id!,
          amount: sellReceiptObj.amount!,
          price: sellReceiptObj.sellPrice,
          type: activityTypeEnum.nftSold,
          issueDate: moment().toDate()
        });
        //DOC: create buy activity for buyer
        await ActivityRepo.createActivity({
          collectible: collectibleObj._id,
          user: buyerObj._id!,
          secondUser: sellerObj._id!,
          amount: sellReceiptObj.amount!,
          price: sellReceiptObj.sellPrice,
          type: activityTypeEnum.nftBought,
          issueDate: moment().toDate()
        });
        //DOC: create sell notification for seller
        await NotificationRepo.createNotification({
          collectible: collectibleObj._id,
          user: sellerObj._id!,
          secondUser: buyerObj._id!,
          amount: sellReceiptObj.amount!,
          type: notificationTypeEnum.nftSold,
          issueDate: moment().toDate()
        });
        //DOC: create buy notification for buyer
        await NotificationRepo.createNotification({
          collectible: collectibleObj._id,
          user: buyerObj._id!,
          secondUser: sellerObj._id!,
          amount: sellReceiptObj.amount!,
          type: notificationTypeEnum.nftBought,
          issueDate: moment().toDate()
        });
        //DOC: creating royalty notification
        if (sellReceiptObj.royaltyAddress) {
          const royaltyUser = await UserRepo.findByAccountID(
            sellReceiptObj.royaltyAddress,
            IUserProps.idOnly
          );
          if (!royaltyUser) {
            //TODO: add exception log
            return {
              statusCode: 404,
              data: undefined,
              err: 'royaltyUser not found!'
            };
          }
          await NotificationRepo.createNotification({
            collectible: collectibleObj._id,
            user: royaltyUser._id,
            secondUser: sellerObj._id,
            amount: sellReceiptObj.royaltyAmount,
            type: notificationTypeEnum.royalityTransfered,
            issueDate: moment().toDate()
          });
        }
      }
    }
    if (sellReceiptObj.type === sellReceiptTypeEnum.forInstant)
      await ListOnSaleRepo.updateActiveInstanAmountByCollectibleIDAndSeller(
        collectibleObj._id!,
        sellerObj._id!,
        sellReceiptObj.amount * -1
      );
    //DOC: Create sellReceipt Process
    const newSellReceiptObj = await SellReceiptRepo.createSellReceipt({
      collectibleID: collectibleObj._id,
      buyer: buyerObj._id,
      seller: sellerObj._id,
      sellPrice: sellReceiptObj.sellPrice,
      amount: sellReceiptObj.amount,
      type: sellReceiptObj.type
    });
    if (!newSellReceiptObj) {
      return {
        statusCode: 409,
        data: undefined,
        err: 'error in creating new sellReceipt!'
      };
    }
    return { statusCode: 200, data: 'newSellReceiptObj', err: undefined };
  } catch (e) {
    console.log(e);
    return { statusCode: 500, data: undefined, err: 'Unhandled error !: ' + e };
  }
}
