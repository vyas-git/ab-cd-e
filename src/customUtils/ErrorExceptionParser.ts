import { ExceptionParser } from './ExceptionParser';

const UNKNOWN_FUNCTION = '?';

// Chromium based browsers: Chrome, Brave, new Opera, new Edge
const chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
// gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
// generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
// We need this specific case for now because we want no other regex to match.
const gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension|capacitor).*?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
const winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
const geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
const chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
// Based on our own mapping pattern - https://github.com/getsentry/sentry/blob/9f08305e09866c8bd6d0c24f5b0aabdd7dd6c59c/src/sentry/lang/javascript/errormapping.py#L83-L108
const reactMinifiedRegexp = /Minified React error #\d+;/i;

// TODO: remove console

class ErrorExceptionParser<Error> implements ExceptionParser<Error> {
  parse(exception: Error) {
    let exceptionData: any = exception;

    // global reference to slice

    if (!exceptionData || !exceptionData.stack) {
      // verifying its an error
      return null;
    }
    const stack = [];
    const lines = exceptionData.stack.split('\n');
    let isEval;
    let submatch;
    let parts;
    let element;

    for (let i = 0; i < lines.length; ++i) {
      if ((parts = chrome.exec(lines[i]))) {
        const isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
        isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
        if (isEval && (submatch = chromeEval.exec(parts[2]))) {
          // throw out eval line/colno and use top-most line/column number
          parts[2] = submatch[1]; // filename
          parts[3] = submatch[2]; // line
          parts[4] = submatch[3]; // column
        }
        element = {
          // working with the regexp above is super painful. it is quite a hack, but just stripping the `address at `
          // prefix here seems like the quickest solution for now.
          filename:
            parts[2] && parts[2].indexOf('address at ') === 0 ? parts[2].substr('address at '.length) : parts[2],
          function: parts[1] || UNKNOWN_FUNCTION,
          lineno: parts[3] ? +parts[3] : null,
          colno: parts[4] ? +parts[4] : null,
        };
      } else if ((parts = winjs.exec(lines[i]))) {
        element = {
          filename: parts[2],
          function: parts[1] || UNKNOWN_FUNCTION,
          lineno: +parts[3],
          colno: parts[4] ? +parts[4] : null,
        };
      } else if ((parts = gecko.exec(lines[i]))) {
        isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
        if (isEval && (submatch = geckoEval.exec(parts[3]))) {
          // throw out eval line/column and use top-most line number
          parts[1] = parts[1] || `eval`;
          parts[3] = submatch[1];
          parts[4] = submatch[2];
          parts[5] = ''; // no column when eval
        } else if (i === 0 && !parts[5] && exceptionData.colnoNumber !== void 0) {
          // FireFox uses this awesome colnoNumber property for its top frame
          // Also note, Firefox's colno number is 0-based and everything else expects 1-based,
          // so adding 1
          // NOTE: this hack doesn't work if top-most frame is eval
          stack[0].colno = (exceptionData.columnNumber as number) + 1;
        }
        element = {
          filename: parts[3],
          function: parts[1] || UNKNOWN_FUNCTION,
          lineno: parts[4] ? +parts[4] : null,
          colno: parts[5] ? +parts[5] : null,
        };
      } else {
        continue;
      }

      if (!element.function && element.lineno) {
        element.function = UNKNOWN_FUNCTION;
      }

      stack.push(element);
    }

    if (!stack.length) {
      return null;
    }
    return {
      type: exceptionData && exceptionData.name,
      value: exceptionData.message,
      module: '',
      thread_id: 0,
      message: this.extractMessage(exceptionData),
      stacktrace: {
        frames: stack,
      },
    };
  }

  /**
   * There are cases where stacktrace.message is an Event object
   * https://github.com/getsentry/sentry-javascript/issues/1949
   * In this specific case we try to extract stacktrace.message.error.message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractMessage(ex: any): string {
    const message = ex && ex.message;
    if (!message) {
      return 'No error message';
    }
    if (message.error && typeof message.error.message === 'string') {
      return message.error.message;
    }
    return message;
  }
}

export { ErrorExceptionParser };
