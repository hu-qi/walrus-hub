/**
 * LLM Configuration Management Module
 * Handles storage and retrieval of LLM API configuration in browser localStorage
 */

export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export const DEFAULT_LLM_CONFIG: Partial<LLMConfig> = {
  baseURL: "https://api.openai.com/v1",
  model: "gpt-3.5-turbo",
};

export class LLMConfigManager {
  private static readonly STORAGE_KEY = 'walrus-hub-llm-config';

  /**
   * Save LLM configuration to localStorage
   */
  static saveConfig(config: LLMConfig): void {
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available in server-side context');
    }
    
    try {
      const configJson = JSON.stringify(config);
      localStorage.setItem(this.STORAGE_KEY, configJson);
    } catch (error) {
      console.error('Failed to save LLM config:', error);
      throw new Error('Failed to save configuration');
    }
  }

  /**
   * Load LLM configuration from localStorage
   * Returns null if no configuration is found
   */
  static loadConfig(): LLMConfig | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const configJson = localStorage.getItem(this.STORAGE_KEY);
      if (!configJson) {
        return null;
      }

      const config = JSON.parse(configJson) as LLMConfig;
      
      // Validate loaded config
      if (!this.validateConfig(config)) {
        console.warn('Invalid config found in localStorage, clearing it');
        this.clearConfig();
        return null;
      }

      return config;
    } catch (error) {
      console.error('Failed to load LLM config:', error);
      return null;
    }
  }

  /**
   * Clear LLM configuration from localStorage
   */
  static clearConfig(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear LLM config:', error);
    }
  }

  /**
   * Validate LLM configuration
   * Returns true if config has all required fields
   */
  static validateConfig(config: Partial<LLMConfig>): boolean {
    if (!config) {
      return false;
    }

    // API Key is required
    if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim() === '') {
      return false;
    }

    // Base URL is required
    if (!config.baseURL || typeof config.baseURL !== 'string' || config.baseURL.trim() === '') {
      return false;
    }

    // Model is required
    if (!config.model || typeof config.model !== 'string' || config.model.trim() === '') {
      return false;
    }

    // Basic URL validation for baseURL
    try {
      new URL(config.baseURL);
    } catch {
      return false;
    }

    return true;
  }

  /**
   * Check if a valid configuration exists
   */
  static hasValidConfig(): boolean {
    const config = this.loadConfig();
    return config !== null && this.validateConfig(config);
  }
}
