import * as timeZoneSource from '../assets/timeZone.json';

export class CountryService {
  static timeZoneMap = new Map<string, string[]>(Object.entries(timeZoneSource.zones));

  static getCountryCode() {
    let countryCode: string;
    try {
      const region = new Intl.DateTimeFormat().resolvedOptions();
      let timeZone = region.timeZone;
      countryCode = this.timeZoneMap.get(timeZone)[0];
    } catch (e) {}
    return countryCode;
  }
}
