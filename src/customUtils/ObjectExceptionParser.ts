import { Exception, StackFrame } from '../services/types';
import { ExceptionParser } from './ExceptionParser';
import { ProgressEventParser, PromiseRejectEventParser, DefaultEventParser } from './index';

// TODO: remove console
class ObjectExceptionParser implements ExceptionParser<object> {
  parse(exception: object) {
    if (exception instanceof ProgressEvent) {
      return new ProgressEventParser().parse(exception);
    }

    if (exception instanceof PromiseRejectionEvent) {
      return new PromiseRejectEventParser().parse(exception);
    }
    return new DefaultEventParser().parse(exception);
  }
}

export { ObjectExceptionParser };
