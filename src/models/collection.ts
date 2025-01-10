import { Schema, model } from 'mongoose';
import { CIDString } from 'nft.storage';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { ObjectIDType } from '../helpers/aliases.js';
import { IUser } from './user';

export interface ICollection {
  _id: Schema.Types.ObjectId;
  creator: ObjectIDType<IUser>;
  title: string;
  description: string;
  color: string;
  symbol: string;
  contractIndex: number;
  contractAddress: string;
  ipfsCID: CIDString;
  tokensCount: number;
  isDeployed: boolean;
}

const collectionchema = new Schema<ICollection>(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    title: { type: String, required: true },
    description: { type: String },
    color: { type: String, required: true },
    symbol: { type: String, required: true },
    contractIndex: { type: Number, default: undefined },
    contractAddress: { type: String, default: undefined },
    ipfsCID: { type: String, default: undefined },
    tokensCount: { type: Number, default: 0 },
    isDeployed: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);
collectionchema.methods.to = schemaToProps;

export const collectionModel = model<ICollection>(
  'collection',
  collectionchema
);

export enum ICollectionProps {
  self = '_id creator title description color symbol contractIndex ipfsCID tokensCount'
}
