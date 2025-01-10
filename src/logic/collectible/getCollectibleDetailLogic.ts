import { IBid } from '../../models/bid.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ICollectible } from '../../models/collectible.js';
import { IUser } from '../../models/user.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import BidRepo from '../../repos/bidRepo.js';
import ExchangeCalcService from '../../services/exchangeRateCalc.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import { IListOnSale } from '../../models/listOnSale.js';
import { IActivity } from '../../models/activity.js';
import ActivityRepo from '../../repos/activityRepo.js';

export async function getCollectibleDetailLogic(
  userID: ObjectIDType<IUser> | undefined,
  collectibleID: ObjectIDType<ICollectible>
): Promise<{
  statusCode: number;
  data:
    | {
        info: Partial<ICollectible>;
        owners: [];
        history: Partial<IActivity>[];
        bids: Partial<IBid>[];
        isOwner: boolean;
        ownerHasActiveList: boolean;
        exchangeRate: number;
        serviceFee: number;
        totalCount: number;
        listCount: number;
        listing: Partial<IListOnSale>[] | null;
        sellBoard: {
          instant: {
            hasInstant: boolean;
            minInstant: Partial<IListOnSale> | null;
          };
          auction: {
            hasAuction: boolean;
            highestBid: Partial<IBid> | null;
            minAuction: Partial<IListOnSale> | null;
          };
        };
      }
    | undefined;
  err: string | undefined;
}> {
  //DOC: check the requested user is owner or not.
  let isOwner = false;
  let ownerHasActiveList = false;
  if (userID) {
    isOwner =
      (await CollectibleRepo.checkCollectibleOwnershipByUserID(
        collectibleID,
        userID
      )) === null
        ? false
        : true;
    if (
      isOwner &&
      (await ListOnSaleRepo.checkActiveListOnSaleByCollectibleIDAndSeller(
        collectibleID,
        userID
      ))
    )
      ownerHasActiveList = true;
  }
  //DOC: fetch collectible History
  const history: Partial<IActivity>[] =
    await ActivityRepo.getCollectibleHistory(collectibleID);
  //DOC: fetch bids
  let bids: Partial<IBid>[] = [];
  //TODO: service Fee should be implemented
  const serviceFee = 1;
  //DOC: Fetch exhchange rate
  const exchangeRate = await ExchangeCalcService.coinBaseCalc('eth', 'usd');
  //DOC: Fetch collectible info section
  const collectibleObj = await CollectibleRepo.getCollectibleInfo(
    collectibleID
  );
  //DOC: Fetch amount of copies that has been listed for sale
  const listCount = await ListOnSaleRepo.getCollectibleListingTotalAmount(
    collectibleID
  );
  //DOC: Fetch listing data
  const sellBoard: {
    instant: { hasInstant: boolean; minInstant: Partial<IListOnSale> | null };
    auction: {
      hasAuction: boolean;
      highestBid: Partial<IBid> | null;
      minAuction: Partial<IListOnSale> | null;
    };
  } = {
    instant: { hasInstant: false, minInstant: null },
    auction: { hasAuction: false, highestBid: null, minAuction: null }
  };
  const instantListing = await ListOnSaleRepo.getActiveInstantsByCollectibleID(
    collectibleID
  );
  const auctionListing = await ListOnSaleRepo.getActiveAuctionsByCollectibleID(
    collectibleID
  );
  const totalListings: Partial<IListOnSale>[] = [
    ...instantListing!,
    ...auctionListing!
  ];
  if (instantListing?.length) {
    sellBoard.instant.hasInstant = true;
    sellBoard.instant.minInstant = instantListing[0];
  }
  if (auctionListing?.length) {
    totalListings.concat(auctionListing);
    sellBoard.auction.hasAuction = true;
    const highestBid = await BidRepo.getHighestActiveBidByCollectibleId(
      collectibleID
    );
    if (highestBid.length !== 0) sellBoard.auction.highestBid = highestBid[0];
    else sellBoard.auction.minAuction = auctionListing[0];
  }
  //DOC: Fetch total amount of collectible
  const totalCount = await CollectibleRepo.getTotalAvailableCollectibleCount(
    collectibleID
  );
  if (!collectibleObj)
    return {
      statusCode: 404,
      data: undefined,
      err: 'collectible dosent exist!'
    };
  bids = await BidRepo.getActiveBidsBycollectibleID(collectibleID);

  return {
    statusCode: 200,
    data: {
      info: collectibleObj!,
      owners: [],
      history: history,
      bids: bids,
      isOwner: isOwner,
      ownerHasActiveList: ownerHasActiveList,
      exchangeRate: exchangeRate,
      serviceFee: serviceFee,
      totalCount: totalCount,
      listCount: listCount,
      listing: totalListings,
      sellBoard: sellBoard
    },
    err: undefined
  };
}
