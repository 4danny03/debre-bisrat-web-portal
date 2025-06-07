
class DataSyncServiceClass {
  private listeners: Map<string, Set<Function>> = new Map();
  private isProcessing = false;

  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  unsubscribe(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emitEvent(event: string, data?: any): void {
    if (this.isProcessing) {
      console.log('DataSyncService: Already processing, skipping emit');
      return;
    }

    const eventListeners = this.listeners.get(event);
    if (eventListeners && eventListeners.size > 0) {
      this.isProcessing = true;
      
      try {
        eventListeners.forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            console.error('DataSyncService: Error in event listener:', error);
          }
        });
      } finally {
        this.isProcessing = false;
      }
    }
  }

  forceRefresh(): void {
    console.log('DataSyncService: Force refresh requested');
    this.emitEvent('forceRefresh');
  }

  clearAll(): void {
    this.listeners.clear();
    this.isProcessing = false;
  }
}

export const DataSyncService = new DataSyncServiceClass();
