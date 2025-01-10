import IService from './IService';
import axios from 'axios';
import ExchangeRateRepo from '../repos/exchangeRateRepo.js';
interface IExchangeCalcService extends IService {
  coinBaseCalc: (fromCurrency: string, toCurrency: string) => Promise<number>;
}
const ExchangeCalcService: IExchangeCalcService = {
  start: async function () {
    return;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stop: async function () {},
  coinBaseCalc: async function (
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    try {
      const result = await axios.get(
        'https://api.coinbase.com/v2/exchange-rates?currency=eth',
        {
          responseType: 'json',
          timeout: 2000
        }
      );
      const exchangeRate = parseFloat(
        parseFloat(result.data.data.rates.USD).toFixed(3)
      );
      await ExchangeRateRepo.create({
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency,
        rate: exchangeRate
      });
      return exchangeRate;
    } catch (e) {
      const rateObj = await ExchangeRateRepo.getLastExchangeRate();
      if (rateObj) return rateObj.rate!;
      return 0;
    }
  }
};

export default ExchangeCalcService;
