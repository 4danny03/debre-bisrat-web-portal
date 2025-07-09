import { describe, it, expect, vi } from "vitest";
import { dataSyncService } from "../services/DataSyncService";

describe("CoreDataSyncService", () => {
  it("should initialize and return status", () => {
    dataSyncService.initialize();
    const status = dataSyncService.getStatus();
    expect(status).toHaveProperty("isActive", true);
    expect(status).toHaveProperty("lastSync");
  });

  it("should add a subscription", () => {
    // Mock supabase.channel
    const mockSubscribe = vi.fn();
    const mockOn = vi.fn().mockReturnThis();
    const mockChannel = vi.fn(() => ({ on: mockOn, subscribe: mockSubscribe }));
    // Patch supabase global for this test
    const originalSupabase = (globalThis as any).supabase;
    (globalThis as any).supabase = { channel: mockChannel };

    dataSyncService.initialize();
    dataSyncService.addSubscription("test_table", () => {});
    const status = dataSyncService.getStatus();
    expect(status).toHaveProperty("isActive", true);
    expect(mockChannel).toHaveBeenCalledWith("test_table_changes");
    expect(mockOn).toHaveBeenCalled();
    expect(mockSubscribe).toHaveBeenCalled();

    // Restore
    (globalThis as any).supabase = originalSupabase;
  });

  it("should process a sync queue and update lastSync", async () => {
    dataSyncService.initialize();
    dataSyncService.queueSync("test_table", "insert", { id: 1 });
    // Wait for queue to process
    await new Promise((resolve) => setTimeout(resolve, 10));
    const status = dataSyncService.getStatus();
    expect(status.lastSync).not.toBeNull();
  });
});
