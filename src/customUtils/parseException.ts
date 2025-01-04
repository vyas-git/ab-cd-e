import { ErrorExceptionParser } from './ErrorExceptionParser';
import { ExceptionParser } from './ExceptionParser';
import { isError } from './is';
import { ObjectExceptionParser } from './ObjectExceptionParser';
import { StringExceptionParser } from './StringExceptionParser';

// TODO: remove console

export function computeStackTraceFromStackProp(exception: any) {
  let exceptionParser: ExceptionParser<any>;

  let errorType = determineErrorType(exception);
  switch (errorType) {
    case 'error':
      exceptionParser = new ErrorExceptionParser();
      break;
    case 'string':
      exceptionParser = new StringExceptionParser();
      break;
    case 'object':
      exceptionParser = new ObjectExceptionParser();
      break;
    default:
      exceptionParser = new ErrorExceptionParser();
  }

  return exceptionParser.parse(exception);
}

function determineErrorType(error: any) {
  if (isError(error) || (error && error.stack)) {
    return 'error';
  }
  return typeof error;
}
