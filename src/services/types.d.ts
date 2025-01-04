export interface ErrorInfoFeilds {
  uniqueId: string;
  category: string;
  grade: string;
  message: any;
  errorUrl: string;
  line?: number;
  col?: number;
  stack?: string;
  firstReportedError?: boolean;
  // new fields
  timestamp: number;
  environment: string;
  level: string;
  errorName: string;
}

export interface ReportFields {
  service: string;
  serviceVersion: string;
  pagePath: string;
}

export interface StackFrame {
  colno?: number;
  filename?: string;
  function?: string;
  in_app?: boolean;
  lineno?: number;
}

export interface StackTrace {
  frames?: StackFrame[];
}

export interface ExtFields {
  exception?: Exception;
  sdk?: SDK;
  userId: string;
  countryCode: string;
  breadcrumbs?: Breadcrumb[];
  os: string;
  device: string;
  browser: string;
}

export interface Breadcrumb {
  type: string;
  category: string;
  message?: string;
  data?: KeyValue[];
  level: string;
  timestamp: number;
}

interface KeyValue {
  key: string;
  value: any;
}

export interface Exception {
  type: string;
  value?: string;
  module?: string;
  thread_id?: number;
  stacktrace: StackTrace;
}

export interface Context {
  [key: string]: any;
}

export interface SDK {
  name?: string;
  version?: string;
}

export interface BrowserUA {
  os?: string;
  device?: string;
  browser?: string;
}

export enum BreadcrumbType {
  DEBUG = 'Debug',
  NAVIGATION = 'Navigation',
  USER_ACTION = 'User Action',
  ERROR = 'Error',
  HTTP = 'HTTP',
}
export enum BreadcrumbLevel {
  WARNING = 'Warning',
  INFO = 'Info',
  ERROR = 'Error',
}
