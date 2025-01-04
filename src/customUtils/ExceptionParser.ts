export interface ExceptionParser<T> {
  parse(exception: T): any;
}
