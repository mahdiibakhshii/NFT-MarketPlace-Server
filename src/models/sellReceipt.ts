import { model, Schema } from 'mongoose';
import { ObjectIDType } from '../helpers/aliases.js';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { IUser } from './user';
import { ICollectible } from './collectible.js';

export enum sellReceiptTypeEnum {
  forAuction = 0,
  forInstant = 1,
  forServiceFee = 2,
  forTransferByOwner = 3
}
export interface ISellReceipt {
  _id: Schema.Types.ObjectId;
  collectibleID: ObjectIDType<ICollectible>;
  buyer: ObjectIDType<IUser>;
  seller: ObjectIDType<IUser>;
  sellPrice: number;
  currency: string;
  txnHash: string;
  amount: number;
  type: sellReceiptTypeEnum;
}

const sellReceiptSchema = new Schema<ISellReceipt>(
  {
    collectibleID: {
      type: Schema.Types.ObjectId,
      ref: 'collectible',
      required: true
    },
    buyer: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    sellPrice: { type: Number, required: true },
    currency: { type: String, default: 'eth' },
    txnHash: { type: String, default: undefined },
    amount: { type: Number, required: true },
    type: { type: Number, required: true }
  },
  { timestamps: true }
);
sellReceiptSchema.methods.to = schemaToProps;

export const SellReceiptModel = model<ISellReceipt>(
  'sellReceipt',
  sellReceiptSchema
);

export enum ISellReceiptProps {
  self = '_id buyer seller sellPrice currency txnHash amount type'
}
