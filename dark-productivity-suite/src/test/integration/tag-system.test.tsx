import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagManager } from '../../components/common/TagManager';
import { TagFilter } from '../../components/common/TagFilter';
import { TagCloud } from '../../components/common/TagCloud';

describe('Tag System', () => {
  describe('TagManager', () => {
    it('should render tag input', () => {
      const mockOnChange = () => {};
      render(
        <TagManager
          tags={[]}
          allTags={[]}
          onTagsChange={mockOnChange}
        />
      );
      
      const input = screen.getByPlaceholderText('Add tag...');
      expect(input).toBeDefined();
    });

    it('should display existing tags', () => {
      const mockOnChange = () => {};
      render(
        <TagManager
          tags={['work', 'urgent']}
          allTags={['work', 'urgent', 'personal']}
          onTagsChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('work')).toBeDefined();
      expect(screen.getByText('urgent')).toBeDefined();
    });
  });

  describe('TagFilter', () => {
    it('should render filter toggle button', () => {
      const mockOnChange = () => {};
      const mockOnModeChange = () => {};
      render(
        <TagFilter
          availableTags={['work', 'personal']}
          selectedTags={[]}
          onTagsChange={mockOnChange}
          filterMode="OR"
          onFilterModeChange={mockOnModeChange}
        />
      );
      
      expect(screen.getByText('Filter by Tags')).toBeDefined();
    });

    it('should expand when toggle is clicked', () => {
      const mockOnChange = () => {};
      const mockOnModeChange = () => {};
      render(
        <TagFilter
          availableTags={['work', 'personal']}
          selectedTags={[]}
          onTagsChange={mockOnChange}
          filterMode="OR"
          onFilterModeChange={mockOnModeChange}
        />
      );
      
      const toggleButton = screen.getByText('Filter by Tags');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('AND')).toBeDefined();
      expect(screen.getByText('OR')).toBeDefined();
    });
  });

  describe('TagCloud', () => {
    it('should render all tags', () => {
      const mockOnClick = () => {};
      const items = [
        { tags: ['work', 'urgent'] },
        { tags: ['work', 'personal'] },
        { tags: ['personal'] }
      ];
      
      render(
        <TagCloud
          tags={['work', 'urgent', 'personal']}
          items={items}
          onTagClick={mockOnClick}
        />
      );
      
      expect(screen.getByText('work')).toBeDefined();
      expect(screen.getByText('urgent')).toBeDefined();
      expect(screen.getByText('personal')).toBeDefined();
    });

    it('should display usage counts', () => {
      const mockOnClick = () => {};
      const items = [
        { tags: ['work'] },
        { tags: ['work'] },
        { tags: ['personal'] }
      ];
      
      render(
        <TagCloud
          tags={['work', 'personal']}
          items={items}
          onTagClick={mockOnClick}
        />
      );
      
      // Work appears twice, personal once
      expect(screen.getByText('2')).toBeDefined();
      expect(screen.getByText('1')).toBeDefined();
    });

    it('should show empty message when no tags', () => {
      const mockOnClick = () => {};
      
      render(
        <TagCloud
          tags={[]}
          items={[]}
          onTagClick={mockOnClick}
        />
      );
      
      expect(screen.getByText(/No tags yet/)).toBeDefined();
    });
  });
});
