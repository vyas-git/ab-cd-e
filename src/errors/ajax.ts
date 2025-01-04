import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { computeStackTraceFromStackProp, Environment, SdkInfo } from '../customUtils';
// TODO: remove console

class AjaxErrors extends Base {
  // get http error info
  public handleError(options: {
    service: string | undefined;
    serviceVersion: string | undefined;
    pagePath: string | undefined;
    collector: string | undefined;
    countryCodes: string[] | undefined;
  }) {
    if (!window.XMLHttpRequest) {
      return;
    }
    const xhrSend = XMLHttpRequest.prototype.send;

    // Errors generated from collector will not used to create subsequent errors.
    const isEventNotFromCollector = (event: any) => {
      const targetUrl =
        event &&
        event.currentTarget &&
        event.currentTarget.getRequestConfig &&
        event.currentTarget.getRequestConfig.length > 1 &&
        event.currentTarget.getRequestConfig[1];
      const result = targetUrl ? !targetUrl.includes(options.collector) : true;
      return result;
    };
    const getErrorUrl = (event: any) => {
      return (
        event &&
        event.currentTarget &&
        event.currentTarget.getRequestConfig &&
        event.currentTarget.getRequestConfig.length > 1 &&
        event.currentTarget.getRequestConfig[1]
      );
    };

    const xhrEvent = (event: any) => {
      try {
        if (
          event &&
          event.currentTarget &&
          !event.currentTarget.isHandled &&
          isEventNotFromCollector(event) &&
          (event.currentTarget.status >= 400 || event.currentTarget.status === 0)
        ) {
          let ex = computeStackTraceFromStackProp(event);
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
            errorUrl: getErrorUrl(event),
            message: errorName,
            collector: options.collector,
            stack: event.type + ':' + Error().stack,
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
          this.logInfo['traceId'] = event.currentTarget.traceid;
          this.traceInfo();
          event.currentTarget.isHandled = true;
        }
      } catch (error) {
        console.error(error);
      }
    };

    XMLHttpRequest.prototype.send = function () {
      if (this.addEventListener) {
        this.addEventListener('error', xhrEvent);
        this.addEventListener('abort', xhrEvent);
        this.addEventListener('timeout', xhrEvent);
        this.addEventListener('loadend', xhrEvent);
        //Not required as not an error
        //this.addEventListener('load', xhrEvent);
      } else {
        const stateChange = this.onreadystatechange;
        this.onreadystatechange = function (event: any) {
          if (stateChange) {
            try {
              stateChange.apply(this, arguments);
            } catch (error) {}
          }
          if (this.readyState === 4) {
            xhrEvent(event);
          }
        };
      }
      return xhrSend.apply(this, arguments);
    };
  }
}

export default new AjaxErrors();
