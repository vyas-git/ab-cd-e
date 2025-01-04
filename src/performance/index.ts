import { CustomOptionsType } from '../types';
import Report from '../services/report';
import pagePerf from './perf';
import FMP from './fmp';
import { IPerfDetail } from './type';
import { BrowserUA } from '../services/types';
import { UAParser } from '../customUtils';
import { UserService } from '../services/userService';
import { UptimeService } from '../services/UptimeService';

class TracePerf {
  private perfConfig = {
    perfDetail: {},
  } as { perfDetail: IPerfDetail };

  public getParsedUA(): BrowserUA {
    let { browser, os, platform } = UAParser.getParsedUA();
    let browserUA: BrowserUA = {};
    browserUA.browser = browser.name.concat(' ', browser.version);
    browserUA.os = os.name.concat(' ', os.version);
    browserUA.device = platform.type;
    return browserUA;
  }

  public getCountryCode(defaultCountry?: string[]): string {
    let countryCode = UserService.getCountryCode();
    if (!countryCode) {
      if (defaultCountry && defaultCountry.length > 0) {
        countryCode = defaultCountry[0];
      }
    }
    return countryCode;
  }

  public async recordPerf(options: CustomOptionsType) {
    let browserUA = this.getParsedUA();
    let fmp: { fmpTime: number | undefined } = { fmpTime: undefined };
    if (options.autoTracePerf) {
      this.perfConfig.perfDetail = await new pagePerf().getPerfTiming();
      if (options.useFmp) {
        fmp = await new FMP();
      }
    }
    let perfInterval = options.perfInterval || 30000;
    // auto report pv and perf data
    setTimeout(() => {
      const perfDetail = options.autoTracePerf
        ? {
            ...this.perfConfig.perfDetail,
            fmpTime: options.useFmp ? parseInt(String(fmp.fmpTime), 10) : undefined,
          }
        : undefined;
      const perfInfo = {
        ...perfDetail,
        pagePath: this.getPagePath(location),
        domain: UptimeService.getDomainInfo(),
        serviceVersion: options.serviceVersion,
        service: options.service,
        os: browserUA.os,
        device: browserUA.device,
        browser: browserUA.browser,
        countryCode: this.getCountryCode(),
        syntheticUser: this.synthCheck(),
      };
      new Report('PERF', options.collector, options.authorization, options.teamId).sendByXhr(perfInfo);
      // clear perf data
      this.clearPerf();
    }, perfInterval);
  }

  private synthCheck() {
    if (!(window && window.navigator && window.navigator.webdriver)) return false;
    return true;
  }

  private getPagePath(location: Location) {
    if (location.hash && location.hash.length > 0) {
      return location.hash;
    }
    return location.pathname;
  }

  private clearPerf() {
    if (!(window.performance && window.performance.clearResourceTimings)) {
      return;
    }
    window.performance.clearResourceTimings();
    this.perfConfig = {
      perfDetail: {},
    } as { perfDetail: IPerfDetail };
  }
}

export default new TracePerf();
