/**
 * In this class we can define environment specific varibles
 *
 */

class Environment {
  private static environment: string;

  private constructor() {}

  public static setEnvironment(env: string) {
    if (!Environment.environment) {
      Environment.environment = env;
    }
  }

  public static getEnvironment(): string {
    return Environment.environment;
  }
}

export { Environment };
