import * as dotenv from 'dotenv';
import * as fs from 'fs';

/**
 * Configuratin provider to externalize environment and provider params
 */
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  /**
   * Init with specific env params
   * @param filePath path to env file
   */
  constructor(filePath: string) {
    this.envConfig = dotenv.parse(fs.readFileSync(filePath));
  }

  /**
   * Get param
   * @param key key value
   */
  get(key: string): string {
    return this.envConfig[key];
  }
}
