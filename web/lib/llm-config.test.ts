import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { LLMConfigManager, LLMConfig, DEFAULT_LLM_CONFIG } from './llm-config';

describe('LLMConfigManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Property 1: Configuration persistence', () => {
    /**
     * Feature: walrus-sites-deployment, Property 1: Configuration persistence
     * For any valid LLM configuration, when saved to localStorage and then loaded,
     * the loaded configuration should be equal to the original configuration
     * Validates: Requirements 3.3
     */
    it('should persist and retrieve any valid configuration', () => {
      fc.assert(
        fc.property(
          fc.record({
            apiKey: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            baseURL: fc.webUrl(),
            model: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          }),
          (config: LLMConfig) => {
            // Save the configuration
            LLMConfigManager.saveConfig(config);

            // Load it back
            const loadedConfig = LLMConfigManager.loadConfig();

            // Should be equal to original
            expect(loadedConfig).toEqual(config);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null when no configuration exists', () => {
      const config = LLMConfigManager.loadConfig();
      expect(config).toBeNull();
    });

    it('should handle multiple save/load cycles', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              apiKey: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
              baseURL: fc.webUrl(),
              model: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (configs: LLMConfig[]) => {
            // Save and load each config in sequence
            for (const config of configs) {
              LLMConfigManager.saveConfig(config);
              const loaded = LLMConfigManager.loadConfig();
              expect(loaded).toEqual(config);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 2: Configuration validation', () => {
    /**
     * Feature: walrus-sites-deployment, Property 2: Configuration validation
     * For any LLM configuration object, if it is missing the apiKey field,
     * the validation function should return false
     * Validates: Requirements 3.2
     */
    it('should reject configurations without apiKey', () => {
      fc.assert(
        fc.property(
          fc.record({
            baseURL: fc.webUrl(),
            model: fc.string({ minLength: 1 }),
          }),
          (partialConfig) => {
            const result = LLMConfigManager.validateConfig(partialConfig);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject configurations with empty apiKey', () => {
      fc.assert(
        fc.property(
          fc.record({
            apiKey: fc.constantFrom('', '   ', '\t', '\n'),
            baseURL: fc.webUrl(),
            model: fc.string({ minLength: 1 }),
          }),
          (config) => {
            const result = LLMConfigManager.validateConfig(config);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject configurations without baseURL', () => {
      fc.assert(
        fc.property(
          fc.record({
            apiKey: fc.string({ minLength: 1 }),
            model: fc.string({ minLength: 1 }),
          }),
          (partialConfig) => {
            const result = LLMConfigManager.validateConfig(partialConfig);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject configurations with invalid baseURL', () => {
      fc.assert(
        fc.property(
          fc.record({
            apiKey: fc.string({ minLength: 1 }),
            baseURL: fc.string().filter(s => {
              try {
                new URL(s);
                return false;
              } catch {
                return true;
              }
            }),
            model: fc.string({ minLength: 1 }),
          }),
          (config) => {
            const result = LLMConfigManager.validateConfig(config);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject configurations without model', () => {
      fc.assert(
        fc.property(
          fc.record({
            apiKey: fc.string({ minLength: 1 }),
            baseURL: fc.webUrl(),
          }),
          (partialConfig) => {
            const result = LLMConfigManager.validateConfig(partialConfig);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid configurations', () => {
      fc.assert(
        fc.property(
          fc.record({
            apiKey: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            baseURL: fc.webUrl(),
            model: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          }),
          (config: LLMConfig) => {
            const result = LLMConfigManager.validateConfig(config);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('clearConfig', () => {
    it('should remove configuration from localStorage', () => {
      const config: LLMConfig = {
        apiKey: 'test-key',
        baseURL: 'https://api.example.com',
        model: 'test-model',
      };

      LLMConfigManager.saveConfig(config);
      expect(LLMConfigManager.loadConfig()).toEqual(config);

      LLMConfigManager.clearConfig();
      expect(LLMConfigManager.loadConfig()).toBeNull();
    });
  });

  describe('hasValidConfig', () => {
    it('should return false when no config exists', () => {
      expect(LLMConfigManager.hasValidConfig()).toBe(false);
    });

    it('should return true when valid config exists', () => {
      const config: LLMConfig = {
        apiKey: 'test-key',
        baseURL: 'https://api.example.com',
        model: 'test-model',
      };

      LLMConfigManager.saveConfig(config);
      expect(LLMConfigManager.hasValidConfig()).toBe(true);
    });
  });

  describe('DEFAULT_LLM_CONFIG', () => {
    it('should not contain apiKey', () => {
      expect(DEFAULT_LLM_CONFIG.apiKey).toBeUndefined();
    });

    it('should contain baseURL and model', () => {
      expect(DEFAULT_LLM_CONFIG.baseURL).toBeDefined();
      expect(DEFAULT_LLM_CONFIG.model).toBeDefined();
    });
  });
});
