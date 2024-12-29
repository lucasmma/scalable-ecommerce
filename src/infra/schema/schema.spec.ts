import { SchemaAdapter } from './schema-adapter';
import { z } from 'zod';

describe('SchemaAdapter', () => {
  let sut: SchemaAdapter;

  // Define the schema for the object expected in the JSON string
  const schema = z.object({
    name: z.string().min(3),
    age: z.number().positive()
  });

  // Create valid and invalid JSON strings for testing
  const validJsonString = {name: "John Doe", age: 30};
  const invalidJsonStringMissingName = {age: 30};  // Invalid because name is missing
  const invalidJsonStringShortName = {name: "Jo", age: 30};  // Invalid because name is too short
  const invalidJsonStringInvalidJson = '{name: "John"';  // Invalid JSON due to syntax error

  beforeEach(() => {
    sut = new SchemaAdapter(schema); // Create a new instance of SchemaAdapter with the defined schema
  });

  describe('when validating a JSON string', () => {
    test('should return success for a valid JSON string', () => {
      const result = sut.validate(validJsonString);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined(); // No error should be returned for valid JSON
    });

    test('should return error for a JSON string with missing name', () => {
      const result = sut.validate(invalidJsonStringMissingName);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('name');
    });

    test('should return error for a JSON string with short name', () => {
      const result = sut.validate(invalidJsonStringShortName);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('name');
    });

    test('should return error for an invalid JSON string', () => {
      const result = sut.validate(invalidJsonStringInvalidJson);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid JSON string');
    });
  });
});
