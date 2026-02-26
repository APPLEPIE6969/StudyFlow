import { test, describe } from "node:test";
import assert from "node:assert";
import { translate } from "./i18n-utils.ts";

describe("translate", () => {
    const mockTranslations = {
        English: {
            "hello": "Hello",
            "welcome": "Welcome {0}!",
            "items": "You have {0} items in your {1}.",
            "only_english": "Only in English"
        },
        Spanish: {
            "hello": "Hola",
            "welcome": "¡Bienvenido {0}!",
            "items": "Tienes {0} artículos en tu {1}.",
        }
    };

    test("should return translation for existing key in target language", () => {
        const result = translate(mockTranslations, "Spanish", "hello");
        assert.strictEqual(result, "Hola");
    });

    test("should return key if key is missing in target language", () => {
        const result = translate(mockTranslations, "Spanish", "only_english");
        assert.strictEqual(result, "only_english");
    });

    test("should return key if key is missing in both target and English dictionaries", () => {
        const result = translate(mockTranslations, "Spanish", "missing_key");
        assert.strictEqual(result, "missing_key");
    });

    test("should return key if target language is unknown and key is missing in English", () => {
        const result = translate(mockTranslations, "French", "missing_key");
        assert.strictEqual(result, "missing_key");
    });

    test("should return English translation if target language is unknown but key exists in English", () => {
        const result = translate(mockTranslations, "French", "hello");
        assert.strictEqual(result, "Hello");
    });

    test("should interpolate a single argument", () => {
        const result = translate(mockTranslations, "English", "welcome", "User");
        assert.strictEqual(result, "Welcome User!");
    });

    test("should interpolate multiple arguments", () => {
        const result = translate(mockTranslations, "English", "items", 5, "cart");
        assert.strictEqual(result, "You have 5 items in your cart.");
    });

    test("should interpolate arguments in target language", () => {
        const result = translate(mockTranslations, "Spanish", "items", 5, "carrito");
        assert.strictEqual(result, "Tienes 5 artículos en tu carrito.");
    });

    test("should handle missing arguments by leaving placeholders", () => {
        const result = translate(mockTranslations, "English", "items", 5);
        assert.strictEqual(result, "You have 5 items in your {1}.");
    });

    test("should handle extra arguments gracefully", () => {
        const result = translate(mockTranslations, "English", "hello", "Extra");
        assert.strictEqual(result, "Hello");
    });

    test("should handle numeric arguments 0 correctly", () => {
        const result = translate(mockTranslations, "English", "items", 0, "cart");
        assert.strictEqual(result, "You have 0 items in your cart.");
    });
});
