import { Exceptions } from './exceptions.js';

const en = {
  [Exceptions.userNotFound]: 'User not found',
  [Exceptions.mediaBadType]: 'type of media is not acceptable',
  [Exceptions.mediaSizeLimit]: 'media size limit',
  [Exceptions.mediaMvErr]: 'error in media mv func',
  [Exceptions.mediaMvNotFound]: 'media mv func not found'
};

export enum Language {
  en = 'en'
}

const Localization: { [key: string]: any } = {
  [Language.en]: en
};
export default Localization;
