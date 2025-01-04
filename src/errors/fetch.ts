import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { computeStackTraceFromStackProp, Environment, SdkInfo } from '../customUtils';

class AjaxFetchErrors extends Base {
  // get http error info
  public isEventNotFromCollector(input, options) {
    const targetUrl = input.url ? input.url : input;
    const result = targetUrl ? !targetUrl.includes(options.collector) : true;
    return result;
  }

  public getErrorUrl(input) {
    return input.url ? input.url : input;
  }

  public handleError(error, options, traceId, input, startTime) {
    try {
      if (input && this.isEventNotFromCollector(input, options)) {
        let ex = computeStackTraceFromStackProp(error);
        let errorName = this.getErrorName(ex);
        let errorNameModified = errorName.split(',').join('<br/>');
        let browserUA = this.getParsedUA();
        this.logInfo = {
          uniqueId: uuid(),
          service: options.service,
          serviceVersion: options.serviceVersion,
          pagePath: this.getPagePath(location),
          category: ErrorsCategory.AJAX_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: this.getErrorUrl(input),
          message: errorName,
          collector: options.collector,
          //added this Type: FETCH to identify that this error is from direct fetch call
          stack: 'Type: FETCH ' + (input.type || error.name) + ':' + error.stack,
          timestamp: new Date().getTime(),
          environment: Environment.getEnvironment(),
          level: 'error',
          exception: ex,
          errorName: errorName,
          userAgent: navigator.userAgent,
          sdk: SdkInfo.getSdk(),
          userId: this.getUserId(),
          countryCode: this.getCountryCode(options.countryCodes),
          breadcrumbs: this.getBreadcrumbs(errorNameModified),
          os: browserUA.os,
          device: browserUA.device,
          browser: browserUA.browser,
          syntheticUser: this.synthCheck(),
        };
        this.logInfo['traceId'] = traceId;
        this.logInfo['timestamp'] = startTime;
        this.traceInfo();
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export default new AjaxFetchErrors();
