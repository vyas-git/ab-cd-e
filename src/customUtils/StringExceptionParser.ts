import { Exception, StackFrame } from '../services/types';
import { ExceptionParser } from './ExceptionParser';
// TODO: remove console

class StringExceptionParser implements ExceptionParser<string> {
  parse(exception: string) {
    let errorEx: Exception;
    return (errorEx = {
      type: 'Error',
      value: exception ? exception : '',
      module: '',
      thread_id: 0,
      stacktrace: {
        frames: [] as StackFrame[],
      },
    });
  }
}

export { StringExceptionParser };
