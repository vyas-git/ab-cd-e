import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { computeStackTraceFromStackProp, Environment, SdkInfo } from '../customUtils';
// TODO: remove console

class PromiseErrors extends Base {
  public handleErrors(options: {
    service: string | undefined;
    serviceVersion: string | undefined;
    pagePath: string | undefined;
    collector: string | undefined;
    countryCodes: string[] | undefined;
  }) {
    window.addEventListener('rejectionhandled', (event: any) => {
      try {
        let url = '';
        if (!event || !event.reason) {
          return;
        }
        if (event.reason.config && event.reason.config.url) {
          url = event.reason.config.url;
        }
        let ex = computeStackTraceFromStackProp(event);
        let errorName = this.getErrorName(ex);
        let browserUA = this.getParsedUA();

        this.logInfo = {
          uniqueId: uuid(),
          service: options.service,
          serviceVersion: options.serviceVersion,
          pagePath: this.getPagePath(location),
          category: ErrorsCategory.PROMISE_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: url || location.href,
          message: event.reason.message,
          stack: event.reason.stack ? event.reason.stack : Error().stack,
          collector: options.collector,
          timestamp: new Date().getTime(),
          environment: Environment.getEnvironment(),
          level: 'error',
          exception: ex,
          errorName: errorName,
          userAgent: navigator.userAgent,
          sdk: SdkInfo.getSdk(),
          userId: this.getUserId(),
          countryCode: this.getCountryCode(options.countryCodes),
          breadcrumbs: this.getBreadcrumbs(errorName),
          os: browserUA.os,
          device: browserUA.device,
          browser: browserUA.browser,
          syntheticUser: this.synthCheck(),
        };
        this.traceInfo();
      } catch (error) {
        throw error;
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      try {
        let url = '';
        if (!event || !event.reason) {
          return;
        }
        if (event.reason.config && event.reason.config.url) {
          url = event.reason.config.url;
        }
        let ex = computeStackTraceFromStackProp(event);
        let browserUA = this.getParsedUA();

        this.logInfo = {
          uniqueId: uuid(),
          service: options.service,
          serviceVersion: options.serviceVersion,
          pagePath: this.getPagePath(location),
          category: ErrorsCategory.PROMISE_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: url || location.href,
          message: event.reason.message,
          stack: event.reason.stack ? event.reason.stack : Error().stack,
          collector: options.collector,
          timestamp: new Date().getTime(),
          environment: Environment.getEnvironment(),
          level: 'error',
          exception: ex,
          errorName: this.getErrorName(ex),
          userAgent: navigator.userAgent,
          sdk: SdkInfo.getSdk(),
          userId: this.getUserId(),
          countryCode: this.getCountryCode(),
          breadcrumbs: this.getBreadcrumbs(),
          os: browserUA.os,
          device: browserUA.device,
          browser: browserUA.browser,
          syntheticUser: this.synthCheck(),
        };
        this.traceInfo();
      } catch (error) {
        throw error;
      }
    });
  }
}
export default new PromiseErrors();
