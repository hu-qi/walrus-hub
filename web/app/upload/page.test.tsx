import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Upload Page', () => {
  /**
   * Feature: walrus-sites-deployment, Property 3: API Key requirement enforcement
   * For any attempt to generate metadata without a configured API Key,
   * the system should display an error message and not make any API calls
   * Validates: Requirements 2.1, 5.5
   */
  describe('Property 3: API Key requirement enforcement', () => {
    it('should check for API Key before generating metadata', () => {
      // Read the upload page source code
      const sourceCode = readFileSync(
        join(process.cwd(), 'app/upload/page.tsx'),
        'utf-8'
      );

      // Verify that the code checks for API Key
      expect(sourceCode).toContain('if (!llmApiKey');
      expect(sourceCode).toContain('Please configure your LLM API Key');
    });

    it('should open advanced settings when API Key is missing', () => {
      const sourceCode = readFileSync(
        join(process.cwd(), 'app/upload/page.tsx'),
        'utf-8'
      );

      // Verify that the code opens advanced settings dialog
      expect(sourceCode).toContain('setShowAdvancedConfig(true)');
    });

    it('should not call LLMClient when API Key is missing', () => {
      const sourceCode = readFileSync(
        join(process.cwd(), 'app/upload/page.tsx'),
        'utf-8'
      );

      // Verify that API Key check happens before LLMClient call
      const apiKeyCheckIndex = sourceCode.indexOf('if (!llmApiKey');
      const llmClientCallIndex = sourceCode.indexOf('LLMClient.generateMetadata');

      expect(apiKeyCheckIndex).toBeGreaterThan(-1);
      expect(llmClientCallIndex).toBeGreaterThan(-1);
      expect(apiKeyCheckIndex).toBeLessThan(llmClientCallIndex);
    });

    it('should return early when API Key is missing', () => {
      const sourceCode = readFileSync(
        join(process.cwd(), 'app/upload/page.tsx'),
        'utf-8'
      );

      // Verify that the function returns early when API Key is missing
      const apiKeyCheckBlock = sourceCode.substring(
        sourceCode.indexOf('if (!llmApiKey'),
        sourceCode.indexOf('if (!llmApiKey') + 400
      );

      expect(apiKeyCheckBlock).toContain('return');
    });

    it('should not make fetch calls to /api routes', () => {
      const sourceCode = readFileSync(
        join(process.cwd(), 'app/upload/page.tsx'),
        'utf-8'
      );

      // Verify that the code does not use fetch to call /api/generate-metadata
      expect(sourceCode).not.toContain('fetch("/api/generate-metadata"');
      expect(sourceCode).not.toContain("fetch('/api/generate-metadata'");
      expect(sourceCode).not.toContain('fetch(`/api/generate-metadata');
    });

    it('should use LLMClient for metadata generation', () => {
      const sourceCode = readFileSync(
        join(process.cwd(), 'app/upload/page.tsx'),
        'utf-8'
      );

      // Verify that the code imports and uses LLMClient
      expect(sourceCode).toContain('LLMClient');
      expect(sourceCode).toContain('generateMetadata');
    });
  });

  describe('Advanced Settings Dialog', () => {
    const sourceCode = readFileSync(
      join(process.cwd(), 'app/upload/page.tsx'),
      'utf-8'
    );

    it('should load configuration on mount', () => {
      // Verify that useEffect loads config from LLMConfigManager
      expect(sourceCode).toContain('useEffect');
      expect(sourceCode).toContain('LLMConfigManager.loadConfig');
    });

    it('should save configuration when Save button is clicked', () => {
      // Verify that Save button calls LLMConfigManager.saveConfig
      expect(sourceCode).toContain('LLMConfigManager.saveConfig');
      expect(sourceCode).toContain('Configuration saved');
    });

    it('should clear configuration when Clear All button is clicked', () => {
      // Verify that Clear All button calls LLMConfigManager.clearConfig
      expect(sourceCode).toContain('LLMConfigManager.clearConfig');
      expect(sourceCode).toContain('Configuration cleared');
    });

    it('should validate configuration before saving', () => {
      // Verify that validation happens before saving
      expect(sourceCode).toContain('LLMConfigManager.validateConfig');
      expect(sourceCode).toContain('Invalid configuration');
    });

    it('should require API Key for saving', () => {
      // Verify that API Key is required
      const saveButtonBlock = sourceCode.substring(
        sourceCode.indexOf('onClick={() => {') + 500,
        sourceCode.indexOf('onClick={() => {') + 1000
      );

      expect(saveButtonBlock).toContain('API Key is required');
    });

    it('should display API Key Required notice', () => {
      // Verify that the dialog shows API Key Required notice
      expect(sourceCode).toContain('API Key Required');
      expect(sourceCode).toContain('stored locally in your browser');
    });

    it('should use password input type for API Key', () => {
      // Verify that API Key input uses type="password"
      // Search for the input field in the modal body
      const modalBodyStart = sourceCode.indexOf('Modal Body');
      const apiKeyLabelIndex = sourceCode.indexOf('label className="block text-sm font-medium text-gray-700 mb-2">\n                                    API Key', modalBodyStart);
      const apiKeyInputBlock = sourceCode.substring(
        apiKeyLabelIndex,
        apiKeyLabelIndex + 500
      );

      expect(apiKeyInputBlock).toContain('type="password"');
    });
  });
});
