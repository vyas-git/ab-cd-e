import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { computeStackTraceFromStackProp, Environment, SdkInfo } from '../customUtils';

class FrameErrors extends Base {
  public handleErrors(
    options: { service: string; serviceVersion: string; pagePath: string; collector?: string; countryCodes?: string[] },
    error: Error,
  ) {
    let ex = computeStackTraceFromStackProp(error);
    let errorName = this.getErrorName(ex);
    let browserUA = this.getParsedUA();

    this.logInfo = {
      uniqueId: uuid(),
      service: options.service,
      serviceVersion: options.serviceVersion,
      pagePath: this.getPagePath(location),
      category: ErrorsCategory.JS_ERROR,
      grade: GradeTypeEnum.ERROR,
      errorUrl: location.href || error.name,
      message: error.message.split('\n')[0],
      collector: options.collector || location.origin,
      stack: error.stack,
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
    this.traceInfo(ex);
  }
}
export default new FrameErrors();
