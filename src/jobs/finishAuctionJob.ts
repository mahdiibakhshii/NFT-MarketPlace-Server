import ListOnSaleRepo from '../repos/listOnSaleRepo.js';
import schedule from 'node-schedule';
import ProviderService from '../services/web3/ProviderService.js';
export default function finishAuctionJob() {
  schedule.scheduleJob('1 * * * * *', async function () {
    const auctions = await ListOnSaleRepo.getFinishingAuctions();
    if (
      auctions &&
      process.env.DEBUG == 'false' &&
      process.env.company_WALLET != undefined
    )
      auctions.forEach(async (auction) => {
        await ProviderService.sendFinishAuction(
          auction.collectible!.collectionID.contractAddress,
          auction.collectible!.tokenID,
          auction.auctionNum,
          auction.signature,
          process.env.company_WALLET!,
          1
        );
      });
  });
}
