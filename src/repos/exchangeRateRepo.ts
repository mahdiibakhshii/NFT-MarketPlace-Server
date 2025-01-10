import { exchangeRateModel, IExchangeRate } from '../models/exchangeRate.js';

async function create(
  exchangeRateObj: Partial<IExchangeRate>
): Promise<Partial<IExchangeRate> | null> {
  const lastObj = await getLastExchangeRate();
  if (lastObj?.rate?.toFixed() !== exchangeRateObj.rate?.toFixed())
    return await exchangeRateModel.create(exchangeRateObj);
  return null;
}
async function getLastExchangeRate(): Promise<Partial<IExchangeRate> | null> {
  return await exchangeRateModel.findOne().sort({ createdAt: -1 });
}

const ExchangeRateRepo = {
  create,
  getLastExchangeRate
};

export default ExchangeRateRepo;
