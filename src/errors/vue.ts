import uuid from '../services/uuid'
import Base from '../services/base'
import { GradeTypeEnum, ErrorsCategory } from '../services/constant'
import { computeStackTraceFromStackProp, Environment, SdkInfo } from '../customUtils'
// TODO: remove console
class VueErrors extends Base {
    public handleErrors(
        options: {
          service: string | undefined;
          serviceVersion: string | undefined;
          pagePath: string | undefined;
          collector: string | undefined;
          countryCodes: string[] | undefined;
        },
        Vue: any
    ) {
        Vue.config.errorHandler = (error: Error, _vm: any, info: string) => {
            try {
                let ex = computeStackTraceFromStackProp(error)
                let errorName = this.getErrorName(ex)
                let browserUA = this.getParsedUA()

                this.logInfo = {
                    uniqueId: uuid(),
                    service: options.service,
                    serviceVersion: options.serviceVersion,
                    pagePath: this.getPagePath(location),
                    category: ErrorsCategory.VUE_ERROR,
                    grade: GradeTypeEnum.ERROR,
                    errorUrl: location.href,
                    message: info,
                    collector: options.collector,
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
                }
                this.traceInfo()
            } catch (err) {
                throw err
            }
        }
    }
}

export default new VueErrors()
