export interface SegmentFeilds {
  traceId: string;
  service: string;
  spans: SpanFeilds[];
  serviceInstance: string;
  traceSegmentId: string;
}

export interface SpanFeilds {
  operationName: string;
  startTime: number;
  endTime: number;
  spanId: number;
  spanLayer: string;
  spanType: string;
  isError: boolean;
  parentSpanId: number;
  componentId: number;
  peer: string;
  tags?: any;
}
