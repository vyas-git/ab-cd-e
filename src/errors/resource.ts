import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { computeStackTraceFromStackProp, Environment, SdkInfo } from '../customUtils';
// TODO: remove console

class ResourceErrors extends Base {
  public handleErrors(options: {
    service: string | undefined;
    serviceVersion: string | undefined;
    pagePath: string | undefined;
    collector: string | undefined;
    countryCodes: string[] | undefined;
  }) {
    window.addEventListener('error', (event) => {
      try {
        if (!event) {
          return;
        }
        const target: any = event.target || event.srcElement;
        const isElementTarget =
          target instanceof HTMLScriptElement ||
          target instanceof HTMLLinkElement ||
          target instanceof HTMLImageElement;

        if (!isElementTarget) {
          // return js error
          return;
        }
        let ex = computeStackTraceFromStackProp(event);
        let errorName = this.getErrorName(ex);
        let browserUA = this.getParsedUA();

        this.logInfo = {
          uniqueId: uuid(),
          service: options.service,
          serviceVersion: options.serviceVersion,
          pagePath: this.getPagePath(location),
          category: ErrorsCategory.RESOURCE_ERROR,
          grade: target.tagName === 'IMG' ? GradeTypeEnum.WARNING : GradeTypeEnum.ERROR,
          errorUrl:  this.getErrorUrl(target),
          message: `load ${target.tagName} resource error`,
          collector: options.collector,
          stack: `load ${target.tagName} resource error`,
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
  }
  public getErrorUrl(target) {
    if (target instanceof HTMLScriptElement || target instanceof HTMLImageElement) {
      return target.src;
    } else if (target instanceof HTMLLinkElement) {
      return target.href;
    } else {
      return location.href;
    }
  }
}
export default new ResourceErrors();
