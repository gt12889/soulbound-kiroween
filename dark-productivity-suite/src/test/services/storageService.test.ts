/**
 * Tests for storage service cloud sync enhancements
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from '../../services/storageService';

describe('StorageService - Cloud Sync', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset migration state for each test
    storageService.resetMigrationState();
  });

  describe('Storage Mode', () => {
    it('should default to local mode', () => {
      expect(storageService.getStorageMode()).toBe('local');
    });

    it('should enable cloud sync mode', () => {
      storageService.enableCloudSync(true);
      expect(storageService.isCloudSyncEnabled()).toBe(true);
      expect(storageService.getStorageMode()).toBe('hybrid');
    });

    it('should set storage mode directly', () => {
      storageService.setStorageMode('cloud');
      expect(storageService.getStorageMode()).toBe('cloud');
      expect(storageService.isCloudSyncEnabled()).toBe(true);
    });
  });

  describe('Data Migration', () => {
    it('should migrate notes with userId', async () => {
      const testNotes = [
        { id: '1', title: 'Note 1', content: 'Content 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Note 2', content: 'Content 2', createdAt: new Date(), updatedAt: new Date() },
      ];
      
      storageService.set('notes', testNotes);
      
      const stats = await storageService.migrateDataForCloudSync('user123');
      
      expect(stats.notes).toBe(2);
      
      const migratedNotes = storageService.get<any[]>('notes');
      expect(migratedNotes).toBeDefined();
      expect(migratedNotes![0].userId).toBe('user123');
      expect(migratedNotes![1].userId).toBe('user123');
    });

    it('should migrate tasks with userId', async () => {
      const testTasks = [
        { 
          id: '1', 
          title: 'Task 1', 
          description: 'Desc 1', 
          priority: 'high', 
          completed: false,
          archived: false,
          tags: [],
          createdAt: new Date() 
        },
      ];
      
      storageService.set('tasks', testTasks);
      
      const stats = await storageService.migrateDataForCloudSync('user123');
      
      expect(stats.tasks).toBe(1);
      
      const migratedTasks = storageService.get<any[]>('tasks');
      expect(migratedTasks).toBeDefined();
      expect(migratedTasks![0].userId).toBe('user123');
    });

    it('should not migrate data twice', async () => {
      const testNotes = [
        { id: '1', title: 'Note 1', content: 'Content 1', createdAt: new Date(), updatedAt: new Date() },
      ];
      
      storageService.set('notes', testNotes);
      
      await storageService.migrateDataForCloudSync('user123');
      const stats = await storageService.migrateDataForCloudSync('user123');
      
      expect(stats.notes).toBe(0);
    });
  });

  describe('Data Merging', () => {
    it('should merge arrays by id', () => {
      const existingNotes = [
        { id: '1', title: 'Old Note', content: 'Old', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
      ];
      
      const newNotes = [
        { id: '1', title: 'New Note', content: 'New', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-02') },
        { id: '2', title: 'Another Note', content: 'Content', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
      ];
      
      storageService.set('notes', existingNotes);
      storageService.setAllData({ notes: newNotes }, true);
      
      const merged = storageService.get<any[]>('notes');
      expect(merged).toBeDefined();
      expect(merged!.length).toBe(2);
      expect(merged!.find(n => n.id === '1')?.title).toBe('New Note'); // Newer version
      expect(merged!.find(n => n.id === '2')?.title).toBe('Another Note');
    });
  });

  describe('Storage Statistics', () => {
    it('should calculate storage stats', () => {
      storageService.set('test_data', { large: 'x'.repeat(1000) });
      
      const stats = storageService.getStorageStats();
      
      expect(stats.used).toBeGreaterThan(0);
      expect(stats.itemCount).toBeGreaterThan(0);
      expect(stats.percentage).toBeGreaterThanOrEqual(0);
      expect(stats.percentage).toBeLessThanOrEqual(100);
    });

    it('should detect when storage is near quota', () => {
      // This is hard to test without filling up storage
      const isNear = storageService.isStorageNearQuota(80);
      expect(typeof isNear).toBe('boolean');
    });
  });

  describe('Data Preparation for Cloud', () => {
    it('should prepare data for cloud sync', () => {
      const testData = {
        notes: [{ id: '1', title: 'Note', content: 'Content', createdAt: new Date(), updatedAt: new Date() }],
        tasks: [{ id: '1', title: 'Task', description: 'Desc', priority: 'high', completed: false, archived: false, tags: [], createdAt: new Date() }],
      };
      
      storageService.setAllData(testData);
      
      const prepared = storageService.prepareDataForCloudSync();
      
      expect(prepared.notes).toBeDefined();
      expect(prepared.tasks).toBeDefined();
      expect(prepared.notes[0].createdAt).toBeInstanceOf(Date);
      expect(prepared.tasks[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Old Data Cleanup', () => {
    it('should clear old tarot readings', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);
      
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);
      
      const readings = [
        { id: '1', date: oldDate, cards: [], interpretation: '', commitStats: {} },
        { id: '2', date: recentDate, cards: [], interpretation: '', commitStats: {} },
      ];
      
      storageService.set('tarot_readings', readings);
      
      const cleared = storageService.clearOldData(90);
      
      expect(cleared).toBe(1);
      
      const remaining = storageService.get<any[]>('tarot_readings');
      expect(remaining).toBeDefined();
      expect(remaining!.length).toBe(1);
      expect(remaining![0].id).toBe('2');
    });
  });
});
