import { Schema, model } from 'mongoose';
import { schemaToProps } from '../helpers/schemaHelper.js';

export enum IContractLoggerType {
  collectiblePurchased = 1,
  auctionStarted = 2,
  BidWithdraw = 3,
  auctionFinished = 4,
  connectionOpened = 5,
  connectionClosed = 6,
  royaltyTransfered = 7
}

export interface IContractLogger {
  _id?: Schema.Types.ObjectId;
  opNum: number;
  type: IContractLoggerType;
  createdAt?: Date;
  updatedAt?: Date;
}

const contractLoggerSchema = new Schema<IContractLogger>(
  {
    opNum: { type: Number, required: true, unique: true },
    type: { type: Number }
  },
  {
    timestamps: true
  }
);

contractLoggerSchema.methods.to = schemaToProps;
contractLoggerSchema.index(
  { opNum: 1 },
  { unique: true, partialFilterExpression: { opNum: !0 } }
);

export const ContractLoggerModel = model<IContractLogger>(
  'contractLogger',
  contractLoggerSchema
);

export enum IContractLoggerProps {
  self = '_id opNum type createdAt updatedAt'
}
