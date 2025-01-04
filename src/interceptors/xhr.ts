

 export default function xhrInterceptor() {
  const originalXHR = window.XMLHttpRequest as any;
  const xhrOpen = originalXHR.prototype.open;
  originalXHR.getRequestConfig = [];

  function ajaxEventTrigger(event: string) {
    const ajaxEvent = new CustomEvent(event, { detail: this });

    window.dispatchEvent(ajaxEvent);
  }

  originalXHR.prototype.open = function (_method: string, _url: string) {
    try {
      this.getRequestConfig = arguments;
      return xhrOpen.apply(this, arguments);      
    } catch (error) {
    }
  };
  function customizedXHR() {
    const liveXHR = new originalXHR();

    liveXHR.addEventListener(
      'readystatechange',
      function () {
        ajaxEventTrigger.call(this, 'xhrReadyStateChange');
      },
      false,
    );
    return liveXHR;
  }
  (window as any).XMLHttpRequest = customizedXHR;
}
