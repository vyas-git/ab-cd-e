import { SDK } from '../services/types';
import { version, name } from '../../package.json';

class SdkInfo {
  private static instance: SDK;

  private constructor() {}

  public static getSdk(): SDK {
    if (!SdkInfo.instance) {
      SdkInfo.instance = {
        name: name,
        version: version,
      };
    }
    return SdkInfo.instance;
  }
}

export { SdkInfo };
