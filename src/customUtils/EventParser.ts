import { Exception, StackFrame } from '../services/types';

export interface EventParser {
  parse(event: any): Exception;
}

export class ProgressEventParser implements EventParser {
  parse(event: any): Exception {
    function getValue() {
      let parseMethod = 'method invalid';
      let parseURL = 'url invalid';
      if (
        event &&
        event.currentTarget &&
        event.currentTarget.getRequestConfig &&
        event.currentTarget.getRequestConfig.length > 1
      ) {
        parseMethod = event.currentTarget.getRequestConfig[0];
        parseURL = event.currentTarget.getRequestConfig[1];
      } else if (event && event.target && event.target.__raven_xhr) {
        parseMethod = event.target.__raven_xhr.method;
        parseURL = event.target.__raven_xhr.url;
      }
      return `method:${parseMethod}, url: ${parseURL},
      status: ${trimString(event.currentTarget.status)}`;
    }
    let ex: Exception;
    return (ex = {
      type: 'Error: XMLHttpRequest',
      value: getValue(),
      module: '',
      thread_id: 0,
      stacktrace: {
        frames: [] as StackFrame[],
      },
    });
  }
}

export class PromiseRejectEventParser implements EventParser {
  parse(event: any): Exception {
    let ex: Exception;
    return (ex = {
      type: `PromiseRejectionEvent: ${event.type} `,
      value: `: ${event.reason ? event.reason.message : ''}, trusted: ${event.isTrusted}`,
      module: '',
      thread_id: 0,
      stacktrace: {
        frames: [] as StackFrame[],
      },
    });
  }
}

export class DefaultEventParser implements EventParser {
  parse(event: any): Exception {
    let errorEx: Exception;
    return (errorEx = {
      type: 'Error ',
      value: event ? JSON.stringify(event?.message ? event.message : event) : '',
      module: '',
      thread_id: 0,
      stacktrace: {
        frames: [] as StackFrame[],
      },
    });
  }
}

function trimString(data: string) {
  if (!data || !(typeof data == 'string')) return data;
  return data.trim();
}
