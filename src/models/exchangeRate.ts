import { model, Schema } from 'mongoose';
import { schemaToProps } from '../helpers/schemaHelper.js';

export interface IExchangeRate {
  _id: Schema.Types.ObjectId;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
}

const exchangeRateSchema = new Schema<IExchangeRate>(
  {
    baseCurrency: { type: String, required: true },
    targetCurrency: { type: String, required: true },
    rate: { type: Number, required: true }
  },
  { timestamps: true }
);
exchangeRateSchema.methods.to = schemaToProps;

export const exchangeRateModel = model<IExchangeRate>(
  'exchangeRate',
  exchangeRateSchema
);

export enum IExchangeRateProps {
  self = '_id baseCurrency targetCurrency rate'
}
