(function (_window, _document, _script, _onerror, _onunhandledrejection) {
  var SENTRY_SDK = _window.SENTRY_SDK;

  // Create a namespace and attach function that will store captured exception
  // Because functions are also objects, we can attach the queue itself straight to it and save some bytes
  var queue = function (exception) {
    queue.data.push(exception);
  };
  queue.data = [];

  // Store reference to the old `onerror` handler and override it with our own function
  // that will just push exceptions to the queue and call through old handler if we found one
  var _oldOnerror = _window[_onerror];
  _window[_onerror] = function (message, source, lineno, colno, exception) {
    // Use keys as "data type" to save some characters"
    queue({
      e: [].slice.call(arguments),
    });

    if (_oldOnerror) _oldOnerror.apply(_window, arguments);
  };

  // Do the same store/queue/call operations for `onunhandledrejection` event
  var _oldOnunhandledrejection = _window[_onunhandledrejection];
  _window[_onunhandledrejection] = function (exception) {
    queue({
      p: exception.reason,
    });
    if (_oldOnunhandledrejection) _oldOnunhandledrejection.apply(_window, arguments);
  };

  // Create a `script` tag with provided SDK `url` and attach it just before the first, already existing `script` tag
  // Scripts that are dynamically created and added to the document are async by default,
  // they don't block rendering and execute as soon as they download, meaning they could
  // come out in the wrong order. Because of that we don't need async=1 as GA does.
  // it was probably(?) a legacy behavior that they left to not modify few years old snippet
  // https://www.html5rocks.com/en/tutorials/speed/script-loading/
  var _currentScriptTag = _document.getElementsByTagName(_script)[0];
  var _newScriptTag = _document.createElement(_script);
  _newScriptTag.src = SENTRY_SDK.url;
  _newScriptTag.crossorigin = 'anonymous';

  // Once our SDK is loaded
  _newScriptTag.addEventListener('load', function () {
    try {
      // Restore onerror/onunhandledrejection handlers
      _window[_onerror] = _oldOnerror;
      _window[_onunhandledrejection] = _oldOnunhandledrejection;

      var data = queue.data;
      var SDK = _window.Raven;
      // Configure it using provided DSN and config object
      SDK.config(SENTRY_SDK.dsn, SENTRY_SDK.options).install();
      // Because we installed the SDK, at this point we have an access to TraceKit's handler,
      // which can take care of browser differences (eg. missing exception argument in onerror)
      var tracekitErrorHandler = _window[_onerror];

      // And capture all previously caught exceptions
      if (data.length) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].e) {
            tracekitErrorHandler.apply(SDK.TraceKit, data[i].e);
          } else if (data[i].p) {
            SDK.captureException(data[i].p);
          }
        }
      }
    } catch (o_O) {
      console.log(o_O);
    }
  });

  // Markers used to remove setTimeout (used for testing) from prod build, DO NOT REMOVE
  // build_marker
  setTimeout(function () {
    _currentScriptTag.parentNode.insertBefore(_newScriptTag, _currentScriptTag);
    // build_marker
  }, 500);
})(window, document, 'script', 'onerror', 'onunhandledrejection');
