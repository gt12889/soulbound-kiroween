/**
 * Tests for ExportDialog component
 * Requirements: 7.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportDialog } from '../../components/import-export/ExportDialog';
import type { Note, Task, AppSettings } from '../../types';

describe('ExportDialog', () => {
  const mockNotes: Note[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'Test Note',
      content: 'Test content',
      markdown: false,
      tags: ['test'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  const mockTasks: Task[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'Test Task',
      description: 'Test description',
      priority: 'medium',
      completed: false,
      archived: false,
      tags: ['test'],
      createdAt: new Date('2024-01-01'),
    },
  ];

  const mockSettings: AppSettings = {
    audioEnabled: true,
    audioVolume: 0.5,
    lastModule: 'graveyard-dashboard',
  };

  const mockOnClose = vi.fn();

  it('should not render when closed', () => {
    const { container } = render(
      <ExportDialog
        isOpen={false}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when open', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    expect(screen.getByRole('heading', { name: 'Export Data' })).toBeInTheDocument();
  });

  it('should display format options', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    expect(screen.getByText('Export Format')).toBeInTheDocument();
    expect(screen.getAllByText('JSON').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Markdown').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CSV').length).toBeGreaterThan(0);
  });

  it('should display data type checkboxes with counts', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    expect(screen.getByText('Data to Export')).toBeInTheDocument();
    expect(screen.getAllByText(/\(1\)/).length).toBe(2); // Note and task counts
  });

  it('should allow format selection', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    const markdownOption = screen.getByLabelText(/Markdown/i);
    fireEvent.click(markdownOption);

    expect(markdownOption).toBeChecked();
  });

  it('should show date range inputs when enabled', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    const dateRangeCheckbox = screen.getByLabelText(/Filter by Date Range/i);
    fireEvent.click(dateRangeCheckbox);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('should show encryption input when enabled', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    const encryptCheckbox = screen.getByLabelText(/Encrypt Export/i);
    fireEvent.click(encryptCheckbox);

    expect(screen.getByLabelText(/Encryption Password/i)).toBeInTheDocument();
  });

  it('should display total items count', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    expect(screen.getByText('Total Items:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 1 note + 1 task
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable export button when no items selected', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        notes={mockNotes}
        tasks={mockTasks}
        settings={mockSettings}
      />
    );

    // Uncheck all data types
    const notesCheckbox = screen.getByLabelText(/Notes/);
    const tasksCheckbox = screen.getByLabelText(/Tasks/);
    const settingsCheckbox = screen.getByLabelText(/Settings/);

    fireEvent.click(notesCheckbox);
    fireEvent.click(tasksCheckbox);
    fireEvent.click(settingsCheckbox);

    const exportButton = screen.getByRole('button', { name: /Export Data/i });
    expect(exportButton).toBeDisabled();
  });
});
