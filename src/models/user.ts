import { Schema, model } from 'mongoose';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { IMedia } from './media';

export enum IUserSocialMediaType {
  twitter = 1,
  instagram = 2,
  facebook = 3
}

export interface IUserSocialMedia {
  type: IUserSocialMediaType;
  url: string;
  isVerified: boolean;
}

export interface IUserUrls {
  customUrl: string;
  websiteUrl: string;
}

export interface IUserMedias {
  profilePic: Partial<IMedia>;
  coverPic: Partial<IMedia>;
}

export interface IUser {
  _id?: Schema.Types.ObjectId;

  // meta mask account id
  accountID: string;

  // info
  name?: string;
  bio?: string;
  socialMedia: IUserSocialMedia[];
  urls?: IUserUrls;
  medias?: IUserMedias;
  // system
  isVerified: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  to?: (props: IUserProps) => Partial<IUser>;
}

const userSchema = new Schema<IUser>(
  {
    accountID: { type: String, unique: true },
    name: String,
    bio: String,
    socialMedia: [
      {
        type: { type: Number },
        url: String,
        isVerified: Boolean
      }
    ],
    urls: {
      customUrl: { type: String },
      websiteUrl: { type: String }
    },
    medias: {
      profilePic: {
        _id: { type: Schema.Types.ObjectId, ref: 'media' },
        hash: { type: String },
        size: { type: Number },
        type: { type: Number },
        mimeType: { type: String },
        i: {
          w: { type: Number },
          h: { type: Number }
        }
      },
      coverPic: {
        _id: { type: Schema.Types.ObjectId, ref: 'media' },
        hash: { type: String },
        size: { type: Number },
        type: { type: Number },
        mimeType: { type: String },
        i: {
          w: { type: Number },
          h: { type: Number }
        }
      }
    },
    isVerified: Boolean
  },
  {
    timestamps: true
  }
);
userSchema.methods.to = schemaToProps;

export const UserModel = model<IUser>('user', userSchema);

export enum IUserProps {
  self = '_id accountID name bio socialMedia urls medias isVerified',
  idOnly = '_id'
}
