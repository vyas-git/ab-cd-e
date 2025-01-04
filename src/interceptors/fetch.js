/* Removed fetch from whatwg-fetch and created our own implementing the fetch from whatwg-fetch and patching it with our changes with retaining original Request, Response, Headers*/
import { fetch, Request, Headers, Response, directFetchPatched, setDefaultConfig } from './patched-fetch/fetch';
export default function windowFetch(options) {
  setDefaultConfig(options);
  // directfetchpatch is added because supoort for reading body as readable stream was not provided
  if (options.enableDirectFetchPatching) {
    window.fetch = directFetchPatched;
  } else {
    window.fetch = fetch;
    window.Request = Request;
    window.Headers = Headers;
    window.Response = Response;
  }
}
