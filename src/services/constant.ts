import Report from './report';


export enum ErrorsCategory {
  AJAX_ERROR = 'ajax',
  RESOURCE_ERROR = 'resource',
  VUE_ERROR = 'vue',
  PROMISE_ERROR = 'promise',
  JS_ERROR = 'js',
  UNKNOWN_ERROR = 'unknown',
}
export enum GradeTypeEnum {
  INFO = 'Info',
  WARNING = 'Warning',
  ERROR = 'Error',
}
export enum ReportTypes {
  ERROR = '/browser/errorLog',
  ERRORS = '/browser/errorLogs',
  PERF = '/browser/perfData',
  SEGMENT = '/v3/segment',
  SEGMENTS = '/v3/segments',
}

export const SpanLayer = 'Http';
export const SpanType = 'Exit';
export enum ReadyStatus {
  OPENED = 1,
  DONE = 4,
}
export const ComponentId = 10001; // ajax
export const ServiceTag = '';

export const Prefix = 'ss:js:';
export const RetryAttempts = 3;
