import { CustomOptionsType, UserContext, CustomReportOptions } from './types';
import { JSErrors, PromiseErrors, AjaxErrors, ResourceErrors, VueErrors, FrameErrors } from './errors/index';
import tracePerf from './performance/index';
import traceSegment from './trace/segment';
import { Environment } from './customUtils';
import { UserService } from './services/userService';
import Raven from './raven-js';
import jwt_decode from 'jwt-decode';

//TODO: remove console log
const ClientMonitor = {
  customOptions: {
    collector: location.origin, // report serve
    jsErrors: true, // vue, js and promise errors
    apiErrors: true,
    resourceErrors: true,
    autoTracePerf: true, // trace performance detail
    useFmp: false, // use first meaningful paint
    enableSPA: false,
    traceSDKInternal: false,
    detailMode: true,
    distributedTracingSkipUrls: [],
    environment: 'production',
    countryCodes: ['JP'],
    enableDistributedTracing: false,
    enableDirectFetchPatching: false, //it will make fetch call internally instead of xhr
  } as CustomOptionsType,
  initConfig(configs: CustomOptionsType) {
    try {
      if (configs.authorization) {
        const decodedToken: any = jwt_decode(configs.authorization);
        configs.teamId = decodedToken['teamId'];
      } else {
        // If authorization is mandatory than this can be uncommented
        // throw "Authorization token not found"
      }
      const serviceName = {
        name: configs.service,
        teamID: configs.teamId,
        type: 'B',
      };
      const serviceString = JSON.stringify(serviceName);
      const newServiceName = serviceString.replace(/"/g, "'");
      configs.service = newServiceName;
    } catch (error) {
      throw error;
    }
  },

  register(configs: CustomOptionsType) {
    this.customOptions = {
      ...this.customOptions,
      ...configs,
    };

    try {
      this.initConfig(this.customOptions);
    } catch (error) {
      // console.error("Error occured in initializing config : ",error);
      return;
    }

    Raven.config(this.customOptions.collector).install();

    Environment.setEnvironment(this.customOptions.environment);
    this.catchErrors(this.customOptions);
    if (!this.customOptions.enableSPA) {
      this.performance(this.customOptions);
    }
    traceSegment(this.customOptions);
  },
  performance(configs: any) {
    // trace and report perf data and pv to serve when page loaded
    if (document.readyState === 'complete') {
      tracePerf.recordPerf(configs);
    } else {
      window.onload = () => {
        tracePerf.recordPerf(configs);
      };
    }
    if (this.customOptions.enableSPA) {
      // hash router
      window.addEventListener(
        'hashchange',
        () => {
          tracePerf.recordPerf(configs);
        },
        false,
      );
    }
  },
  catchErrors(options: CustomOptionsType) {
    const { service, pagePath, serviceVersion, collector, countryCodes } = options;

    if (options.jsErrors) {
      JSErrors.handleErrors({ service, pagePath, serviceVersion, collector, countryCodes });
      PromiseErrors.handleErrors({ service, pagePath, serviceVersion, collector, countryCodes });
      if (options.vue) {
        VueErrors.handleErrors({ service, pagePath, serviceVersion, collector, countryCodes }, options.vue);
      }
    }
    if (options.apiErrors) {
      AjaxErrors.handleError({ service, pagePath, serviceVersion, collector, countryCodes });
    }
    if (options.resourceErrors) {
      ResourceErrors.handleErrors({ service, pagePath, serviceVersion, collector, countryCodes });
    }
  },
  setPerformance(configs: CustomOptionsType) {
    // history router
    this.customOptions = {
      ...this.customOptions,
      ...configs,
    };

    try {
      this.initConfig(this.customOptions);
    } catch (error) {
      // console.error("Error occured in initializing config : ",error);
      return;
    }

    this.performance(this.customOptions);
  },
  setUser(userContext: UserContext) {
    UserService.setUserContext(userContext);
  },

  reportFrameErrors(configs: CustomReportOptions, error: Error) {
    this.initConfig(configs);
    FrameErrors.handleErrors(configs, error);
  },
};

export default ClientMonitor;
