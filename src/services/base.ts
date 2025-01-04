import Task from './task'
import { ErrorsCategory, GradeTypeEnum } from './constant'
import { Breadcrumb, BrowserUA, ErrorInfoFeilds, Exception, ExtFields, ReportFields } from './types'
import { SdkInfo, UAParser } from '../customUtils'
import { UserService } from './userService'
import { isNotEmpty } from '../customUtils/is'
import Raven from '../raven-js'
import { BreadcrumbLevel, BreadcrumbType } from '../raven-js/src/breadcrumbType'

// TODO: remove console

let jsErrorPv = false
export default class Base {
    public logInfo: ErrorInfoFeilds &
        ReportFields & { collector: string } & ExtFields & { userAgent: string; syntheticUser: boolean } = {
        uniqueId: '',
        service: '',
        serviceVersion: '',
        pagePath: '',
        category: ErrorsCategory.UNKNOWN_ERROR,
        grade: GradeTypeEnum.INFO,
        errorUrl: '',
        line: 0,
        col: 0,
        message: '',
        errorName: '',
        firstReportedError: false,
        collector: '',
        timestamp: new Date().getTime(),
        environment: 'production',
        level: 'error',
        exception: {
            type: 'string',
            value: 'string',
            module: 'string',
            thread_id: 5,
            stacktrace: {
                frames: [
                    {
                        colno: 5,
                        filename: 'string',
                        function: 'string',
                        in_app: true,
                        lineno: 6,
                    },
                ],
            },
        },
        userAgent: navigator.userAgent,
        sdk: SdkInfo.getSdk(),
        userId: this.getUserId(),
        countryCode: this.getCountryCode(),
        os: this.getParsedUA().os,
        device: this.getParsedUA().device,
        browser: this.getParsedUA().browser,
        syntheticUser: this.synthCheck(),
    }

    public synthCheck() {
        if (!(window && window.navigator && window.navigator.webdriver)) return false
        return true
    }

    public traceInfo(exception?: Exception) {
        // mark js error pv
        if (!jsErrorPv && this.logInfo.category === ErrorsCategory.JS_ERROR) {
            jsErrorPv = true
            this.logInfo.firstReportedError = true
        }
        this.handleRecordError(exception)
        setTimeout(() => {
            Task.fireTasks()
        }, 100)
    }

    public getPagePath(location: Location) {
        if (location.hash && location.hash.length > 0) {
            return location.hash
        }
        return location.pathname
    }

    public getBreadcrumbs(errorName?: string) {
        const breadcrumbs: any[] = Raven._getBreadcrumbs()
        breadcrumbs.push(this.addErrorBreadcrumb(errorName))
        return breadcrumbs
    }

    private addErrorBreadcrumb(error: string) {
        const crumb: Breadcrumb = {
            type: BreadcrumbType.ERROR,
            category: 'exception',
            level: BreadcrumbLevel.ERROR,
            message: error,
            timestamp: +new Date(),
        }

        return crumb
    }

    public getUserId() {
        return UserService.getUserId()
    }

    public getCountryCode(_defaultCountry?: string[]): string {
        let countryCode = UserService.getCountryCode()
        if (!countryCode) countryCode = ''
        return countryCode
    }

    public getErrorName(exception: Exception) {
        if (!exception || !exception.type) return null

        if (isNotEmpty(exception.value)) {
            return exception.type === 'Error: XMLHttpRequest'
                ? exception.type
                      .concat(' ', exception.value.split('\n')[0])
                      .concat(' ', exception.value.split('\n')[1].trim())
                : exception.type.concat(' ', exception.value.split('\n')[0])
        }
        const frame = exception.stacktrace.frames.find((fr) => isNotEmpty(fr.function) || isNotEmpty(fr.filename))
        if (frame) {
            return exception.type.concat(' ', frame.function, ' ', frame.filename)
        }
        return exception.type
    }

    private handleRecordError(exception?: Exception) {
        try {
            if (!this.logInfo.message) {
                return
            }
            const errorInfo = this.handleErrorInfo(exception)

            Task.addTask(errorInfo)
        } catch (error) {
            throw error
        }
    }

    public getParsedUA(): BrowserUA {
        const { browser, os, platform } = UAParser.getParsedUA()
        const browserUA: BrowserUA = {}
        browserUA.browser = browser.name.concat(' ', browser.version)
        browserUA.os = os.name.concat(' ', os.version)
        browserUA.device = platform.type
        return browserUA
    }

    private handleErrorInfo(exception?: Exception) {
        const errorName = this.logInfo.errorName ? this.logInfo.errorName : this.logInfo.message
        let message = `error category:${this.logInfo.category}\r\n log info:${this.logInfo.message}\r\n
       error url: ${this.logInfo.errorUrl}\r\n `

        switch (this.logInfo.category) {
            case ErrorsCategory.JS_ERROR:
                if (this.logInfo.line && this.logInfo.col) {
                    message += `error line number: ${this.logInfo.line}\r\n error col number:${this.logInfo.col}\r\n`
                } else if (exception) {
                    const frame = exception.stacktrace.frames.find(
                        (fr) => isNotEmpty(fr.function) || isNotEmpty(fr.filename)
                    )
                    if (frame && frame.lineno && frame.colno) {
                        message += `error line number: ${frame.lineno}\r\n error col number:${frame.colno}\r\n`
                    }
                }
                break
            case ErrorsCategory.AJAX_ERROR:
                message = `error category:${this.logInfo.category}\r\n${this.logInfo.message}\r\n`
            default:
                message
                break
        }
        const recordInfo = {
            ...this.logInfo,
            message,
            errorName,
        }
        return recordInfo
    }
}
