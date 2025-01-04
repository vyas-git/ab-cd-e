import { UserContext } from '../types';
import { Prefix } from './constant';
import { CountryService } from './CountryService';
import uuid from './uuid';

export class UserService {
  static async setUserId(userId: string) {
    localStorage.setItem(Prefix + 'userId', userId);
    return new Promise((resolve, _reject) => {
      resolve(userId);
    });
  }

  static async setCountryCode(userId: string) {
    sessionStorage.setItem(Prefix + 'countryCode', userId);
    return new Promise((resolve, _reject) => {
      resolve(userId);
    });
  }

  static async setUserContext(userContext: UserContext) {
    if (userContext) {
      this.setUserId(userContext.userId);
      this.setCountryCode(userContext.countryCode);
    }
    return new Promise((resolve, _reject) => {
      resolve(userContext);
    });
  }

  static getUserId() {
    let userId: string = localStorage.getItem(Prefix + 'userId');
    if (!userId || userId.length == 0 || userId == 'null' || userId == 'undefined') {
      userId = setDefalutUserId();
    }
    return userId;
  }

  static getCountryCode() {
    let countryCode = sessionStorage.getItem(Prefix + 'countryCode');
    if (!countryCode || countryCode.length < 2 || countryCode == 'null' || countryCode == 'undefined') {
      countryCode = CountryService.getCountryCode();
    }
    return countryCode;
  }
}

function setDefalutUserId() {
  let genUserId = uuid();
  UserService.setUserId(genUserId);
  return genUserId;
}
