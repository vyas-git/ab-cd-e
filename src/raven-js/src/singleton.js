// Import RavenConstructor using ESM syntax
import RavenConstructor from './raven';

// This is to be defensive in environments where `window` does not exist
const _window =
  typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : typeof window.self !== 'undefined'
    ? window.self
    : {};

// Preserve the previous global Raven instance if it exists
const _Raven = _window.Raven;

// Create a new instance of Raven using RavenConstructor
const Raven = new RavenConstructor();

/*
 * Allow multiple versions of Raven to be installed.
 * Remove Raven from the global context and return the current instance.
 */
Raven.noConflict = function () {
  _window.Raven = _Raven;
  return Raven;
};

// Call afterLoad on Raven instance
Raven.afterLoad();

/*
 * Export Raven as the default export
 * Export the RavenConstructor as Client for cases where users need to track multiple instances
 */
export default Raven;
export const Client = RavenConstructor;
