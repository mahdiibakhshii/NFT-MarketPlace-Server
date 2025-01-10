import ExchangeCalcService from '../../services/exchangeRateCalc.js';
import BidRepo from '../../repos/bidRepo.js';
import SellReceiptRepo from '../../repos/sellReceiptRepo.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';

export async function homeTrendLogic() {
  const exchangeRate = await ExchangeCalcService.coinBaseCalc('eth', 'usd');
  const highestBids = await BidRepo.getHighestActiveBids();
  const mostSoldCollections = await SellReceiptRepo.getMostSoldCollections();
  const newestListOnSales = await ListOnSaleRepo.getNewestListOnSales(1, 8);

  const newestCollectiblesSec2 = [];
  newestCollectiblesSec2.push(newestListOnSales[0]);
  newestCollectiblesSec2.push(newestListOnSales[1]);
  newestCollectiblesSec2.push(newestListOnSales[2]);
  newestCollectiblesSec2.push(newestListOnSales[3]);
  return {
    sec1: highestBids,
    sec2: newestCollectiblesSec2,
    sec3: highestBids,
    sec4: mostSoldCollections,
    sec5: newestListOnSales,
    exchangeRate: exchangeRate
  };
}
