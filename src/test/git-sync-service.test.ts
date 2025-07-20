import { describe, it, expect } from "vitest";
import GitSyncService from "../services/GitSyncService";

describe("GitSyncService", () => {
  it("should be a singleton", () => {
    const a = GitSyncService.getInstance();
    const b = GitSyncService.getInstance();
    expect(a).toBe(b);
  });

  it("should have isGitSyncAvailable return a boolean", () => {
    const service = GitSyncService.getInstance();
    expect(typeof service.isGitSyncAvailable()).toBe("boolean");
  });

  it("should have getGitStatus return default values if not available", async () => {
    const service = GitSyncService.getInstance();
    const status = await service.getGitStatus();
    expect(status).toHaveProperty("hasChanges");
    expect(status).toHaveProperty("changedFiles");
    expect(status).toHaveProperty("branch");
    expect(status).toHaveProperty("lastCommit");
  });
});
