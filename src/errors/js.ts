import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { computeStackTraceFromStackProp, Environment, SdkInfo } from '../customUtils';

// TODO: remove console

class JSErrors extends Base {
  public handleErrors(options: {
    service: string | undefined;
    serviceVersion: string | undefined;
    pagePath: string | undefined;
    collector: string | undefined;
    countryCodes: string[] | undefined;
  }) {
    window.addEventListener('error', (event: any) => {
      try {
        if (!event.target.isHandled) {
          let ex = computeStackTraceFromStackProp(event);
          let errorName = this.getErrorName(ex);
          let browserUA = this.getParsedUA();

          this.logInfo = {
            uniqueId: uuid(),
            service: options.service,
            serviceVersion: options.serviceVersion,
            pagePath: this.getPagePath(location),
            category: ErrorsCategory.JS_ERROR,
            grade: GradeTypeEnum.ERROR,
            errorUrl: event.filename,
            line: event.lineno,
            col: event.colno,
            message: event.message,
            collector: options.collector,
            stack: event.error ? event.error.stack : Error().stack,
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
          event.target.isHandled = true;
          this.traceInfo();
        } else {
          event.target.isHandled = false;
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
}
export default new JSErrors();
