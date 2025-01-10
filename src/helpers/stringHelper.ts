import Localization, { Language } from '../constants/localization.js';

export function randomString(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function randomStringExcept(length: number, except: string): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = except;
  while (result === except) {
    result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  }
  return result;
}

export function localized(str: string, language: Language) {
  return (Localization[language] || Localization['en'])[str];
}

export function strRemoveAt(
  str: string,
  index: number,
  length: number
): string {
  return str.slice(0, index) + str.slice(index + 1);
}
