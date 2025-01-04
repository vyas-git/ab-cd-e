import { encode } from 'js-base64';
import xhrInterceptor from '../interceptors/xhr';
import uuid from '../services/uuid';
import Report from '../services/report';
import { SegmentFeilds, SpanFeilds } from './type';
import { SpanLayer, SpanType, ReadyStatus, ComponentId, ServiceTag, ReportTypes } from '../services/constant';
import { CustomOptionsType } from '../types';
import windowFetch from '../interceptors/fetch';

let segments = [] as SegmentFeilds[];
export function buildHeader(
  requestUrl: string,
  options: CustomOptionsType,
  segment: SegmentFeilds,
  traceId: string,
  traceSegmentId: string,
) {
  let url = {} as URL;
  let config = requestUrl;
  if (config.startsWith('http://') || config.startsWith('https://') || config.startsWith('//')) {
    url = new URL(config);
  } else {
    url = new URL(window.location.href);
    url.pathname = config;
  }
  if (
    ([ReportTypes.ERROR, ReportTypes.PERF, ReportTypes.SEGMENTS] as string[]).includes(url.pathname) &&
    !options.traceSDKInternal
  ) {
    return null;
  }

  if (!options.enableDistributedTracing && !options.distributedTracingSkipUrls.includes(requestUrl)) {
    return null;
  }

  const traceIdStr = String(encode(traceId));
  const segmentId = String(encode(traceSegmentId));
  const service = String(encode(segment.service));
  const instance = String(encode(segment.serviceInstance));
  const endpoint = options.pagePath != null && options.pagePath.length != 0 ? String(encode(options.pagePath)) : '';
  const peer = String(encode(url.host));
  const index = segment.spans.length;
  const values = `${1}-${traceIdStr}-${segmentId}-${index}-${service}-${instance}-${endpoint}-${peer}`;

  return values;
}

export function buildSpan(
  options: CustomOptionsType,
  startTime: number,
  endTime: number,
  segment: SegmentFeilds,
  status: number,
  url: URL,
  method: string,
  requestUrl: string,
) {
  // build span, return object or null
  const exitSpan: SpanFeilds = {
    operationName: options.pagePath != null && options.pagePath.length != 0 ? String(encode(options.pagePath)) : '',
    startTime: startTime,
    endTime,
    spanId: segment.spans.length,
    spanLayer: SpanLayer,
    spanType: SpanType,
    isError: status === 0 || status >= 400 ? true : false,
    parentSpanId: segment.spans.length - 1,
    componentId: ComponentId,
    peer: url.host,
    tags: options.detailMode
      ? [
          {
            key: 'http.method',
            value: method,
          },
          {
            key: 'url',
            value: requestUrl,
          },
        ]
      : undefined,
  };
  return exitSpan;
}

export default function traceSegment(options: CustomOptionsType) {
  const segCollector: { event: XMLHttpRequest; startTime: number; traceId: string; traceSegmentId: string }[] = [];
  // inject interceptor
  xhrInterceptor();
  windowFetch(options);
  window.addEventListener('xhrReadyStateChange', (event: CustomEvent<XMLHttpRequest & { getRequestConfig: any[] }>) => {
    let segment = {
      traceId: '',
      service: options.service + ServiceTag,
      spans: [],
      serviceInstance: options.serviceVersion,
      traceSegmentId: '',
    } as SegmentFeilds;
    const xhrState = event.detail.readyState;

    // The values of xhrState are from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
    if (xhrState === ReadyStatus.OPENED) {
      const traceId = uuid();
      const traceSegmentId = uuid();
      event.detail['traceid'] = traceId;
      segCollector.push({
        event: event.detail,
        startTime: new Date().getTime(),
        traceId,
        traceSegmentId,
      });
      const requestUrl = event.detail.getRequestConfig[1];
      const header = buildHeader(requestUrl, options, segment, traceId, traceSegmentId);
      if (header) {
        event.detail.setRequestHeader('sw8', header);
      }
    }
    if (xhrState === ReadyStatus.DONE) {
      const endTime = new Date().getTime();
      for (let i = 0; i < segCollector.length; i++) {
        if (segCollector[i].event.readyState === ReadyStatus.DONE) {
          const traceId = segCollector[i].traceId;
          const traceSegmentId = segCollector[i].traceSegmentId;
          const startTime = segCollector[i].startTime;
          const status = segCollector[i].event.status;
          const requestUrl = segCollector[i].event.responseURL;
          const method = event.detail.getRequestConfig[0];
          let url = {} as URL;
          if (segCollector[i].event.status) {
            url = new URL(segCollector[i].event.responseURL);
          }
          // build span, return object or null
          const exitSpan = buildSpan(options, startTime, endTime, segment, status, url, method, requestUrl);
          segment.spans.push(exitSpan);
          segment = {
            ...segment,
            traceId: traceId,
            traceSegmentId: traceSegmentId,
          };
          segCollector.splice(i, 1);
        }
      }
      segments.push(segment);
    }
  });
  window.onbeforeunload = function () {
    if (!options.enableDistributedTracing || !segments.length) {
      return null;
    }
    new Report('SEGMENTS', options.collector, options.authorization, options.teamId).sendByXhr(segments);
  };
  //report per 5min
  setInterval(() => {
    if (!options.enableDistributedTracing || !segments.length) {
      return;
    }
    new Report('SEGMENTS', options.collector, options.authorization, options.teamId).sendByXhr(segments);
    segments = [];
  }, 300000);
}

export function addSegments(segment: SegmentFeilds) {
  segments.push(segment);
}
