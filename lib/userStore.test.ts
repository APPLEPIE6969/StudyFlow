import { describe, test, beforeEach } from "node:test";
import assert from "node:assert";
import { setupTests, resetStorage } from "./setupTests.ts";
import {
  getUserProfile,
  saveUserProfile,
  clearUserProfile,
  isOnboardingComplete,
  updateUserStats,
  isTutorialComplete,
  markTutorialComplete,
  addXP,
  recordActivity
} from "./userStore.ts";

// Initialize mocks
setupTests();

describe("User Store", () => {
  beforeEach(() => {
    resetStorage();
  });

  test("getUserProfile should return null when no profile exists", () => {
    const profile = getUserProfile();
    assert.strictEqual(profile, null);
  });

  test("saveUserProfile should save and return a new profile", () => {
    const email = "test@example.com";
    const profileData = { email, name: "Test User" };

    const savedProfile = saveUserProfile(profileData);

    assert.strictEqual(savedProfile.email, email);
    assert.strictEqual(savedProfile.name, "Test User");
    assert.strictEqual(savedProfile.stats.currentLevel, 1);

    const retrievedProfile = getUserProfile();
    const expectedProfile = JSON.parse(JSON.stringify(savedProfile));
    assert.deepStrictEqual(retrievedProfile, expectedProfile);
  });

  test("saveUserProfile should merge with existing profile", () => {
    const initialProfile = saveUserProfile({ email: "test@example.com", name: "Initial" });
    const updatedProfile = saveUserProfile({ email: "test@example.com", name: "Updated" });

    assert.strictEqual(updatedProfile.name, "Updated");
    assert.strictEqual(updatedProfile.createdAt, initialProfile.createdAt);
  });

  test("clearUserProfile should remove the profile", () => {
    saveUserProfile({ email: "test@example.com" });
    assert.notStrictEqual(getUserProfile(), null);

    clearUserProfile();
    assert.strictEqual(getUserProfile(), null);
  });

  test("isOnboardingComplete logic", () => {
    assert.strictEqual(isOnboardingComplete("test@example.com"), false);

    saveUserProfile({ email: "test@example.com", onboardingComplete: true, agreedToTerms: true });
    assert.strictEqual(isOnboardingComplete("test@example.com"), true);

    assert.strictEqual(isOnboardingComplete("other@example.com"), false);
  });

  test("updateUserStats should update partial stats", () => {
    saveUserProfile({ email: "test@example.com" });
    updateUserStats({ totalQuizzes: 5, accuracyScore: 80 });

    const profile = getUserProfile();
    assert.strictEqual(profile?.stats.totalQuizzes, 5);
    assert.strictEqual(profile?.stats.accuracyScore, 80);
    assert.strictEqual(profile?.stats.currentLevel, 1);
  });

  test("tutorial completion logic", () => {
    const email = "test@example.com";
    saveUserProfile({ email });
    assert.strictEqual(isTutorialComplete(email), false);

    markTutorialComplete(email);
    assert.strictEqual(isTutorialComplete(email), true);
  });

  test("addXP should increment XP and handle level ups", () => {
    saveUserProfile({ email: "test@example.com" });

    // Add 50 XP (Level 1, XP 50)
    addXP(50);
    let profile = getUserProfile();
    assert.strictEqual(profile?.stats.xpEarned, 50);
    assert.strictEqual(profile?.stats.currentLevel, 1);

    // Add 60 XP (Level 1 -> 2, XP 110-100=10)
    addXP(60);
    profile = getUserProfile();
    assert.strictEqual(profile?.stats.currentLevel, 2);
    assert.strictEqual(profile?.stats.xpEarned, 10);
    assert.strictEqual(profile?.stats.xpToNextLevel, 200);

    // Add 500 XP (Level 2 -> 3 (300 req) -> 4 (400 req))
    // Start: L2, XP 10. Target 200.
    // +500 = 510.
    // 510 >= 200 -> L3. XP 310. Target 300.
    // 310 >= 300 -> L4. XP 10. Target 400.
    addXP(500);
    profile = getUserProfile();
    assert.strictEqual(profile?.stats.currentLevel, 4);
    assert.strictEqual(profile?.stats.xpEarned, 10);
    assert.strictEqual(profile?.stats.xpToNextLevel, 400);
  });

  test("recordActivity should track daily streak correctly", (t) => {
    t.mock.timers.enable({ apis: ["Date"] });

    // Start at a fixed time
    const start = new Date("2023-01-01T12:00:00Z");
    t.mock.timers.setTime(start.getTime());

    saveUserProfile({ email: "test@example.com" });
    recordActivity();

    let profile = getUserProfile();
    assert.strictEqual(profile?.lastActivityDate, "2023-01-01");
    assert.strictEqual(profile?.stats.dailyStreak, 1);

    // Same day: streak stays 1
    t.mock.timers.tick(1000 * 60 * 60); // +1 hour
    recordActivity();
    profile = getUserProfile();
    assert.strictEqual(profile?.stats.dailyStreak, 1);

    // Next day: streak becomes 2
    // Advance to next day same time
    t.mock.timers.setTime(new Date("2023-01-02T12:00:00Z").getTime());
    recordActivity();
    profile = getUserProfile();
    assert.strictEqual(profile?.lastActivityDate, "2023-01-02");
    assert.strictEqual(profile?.stats.dailyStreak, 2);

    // Skip a day (to 2023-01-04): streak resets to 1
    t.mock.timers.setTime(new Date("2023-01-04T12:00:00Z").getTime());
    recordActivity();
    profile = getUserProfile();
    assert.strictEqual(profile?.lastActivityDate, "2023-01-04");
    assert.strictEqual(profile?.stats.dailyStreak, 1);
  });
});
