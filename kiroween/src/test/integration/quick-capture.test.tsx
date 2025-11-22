import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import QuickCapture from '../../components/common/QuickCapture';

/**
 * Integration tests for QuickCapture component
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

describe('QuickCapture Component', () => {
  it('should not render when isOpen is false', () => {
    const onClose = vi.fn();
    renderWithProviders(<QuickCapture isOpen={false} onClose={onClose} />);
    
    expect(screen.queryByText('Quick Capture')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    const onClose = vi.fn();
    renderWithProviders(<QuickCapture isOpen={true} onClose={onClose} />);
    
    expect(screen.getByText('Quick Capture')).toBeInTheDocument();
  });

  it('should have note type selected by default', () => {
    const onClose = vi.fn();
    renderWithProviders(<QuickCapture isOpen={true} onClose={onClose} />);
    
    const noteButtons = screen.getAllByRole('button', { name: /note/i });
    const noteTypeButton = noteButtons.find(btn => btn.textContent?.includes('📝'));
    expect(noteTypeButton?.className).toMatch(/active/);
  });

  it('should switch between note and task types', () => {
    const onClose = vi.fn();
    renderWithProviders(<QuickCapture isOpen={true} onClose={onClose} />);
    
    const taskButtons = screen.getAllByRole('button', { name: /task/i });
    const taskTypeButton = taskButtons.find(btn => btn.textContent?.includes('⚰️'));
    fireEvent.click(taskTypeButton!);
    
    expect(taskTypeButton?.className).toMatch(/active/);
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
  });

  it('should close when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<QuickCapture isOpen={true} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should close when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = renderWithProviders(<QuickCapture isOpen={true} onClose={onClose} />);
    
    const backdrop = container.querySelector('[class*="backdrop"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('should create a note when form is submitted', async () => {
    const onClose = vi.fn();
    renderWithProviders(<QuickCapture isOpen={true} onClose={onClose} />);
    
    const titleInput = screen.getByLabelText(/note title/i);
    const contentInput = screen.getByLabelText(/content/i);
    const submitButton = screen.getByRole('button', { name: /capture note/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Note' } });
    fireEvent.change(contentInput, { target: { value: 'Test content' } });
    fireEvent.click(submitButton);
    
    // Should show confirmation
    await waitFor(() => {
      expect(screen.getByText(/note captured/i)).toBeInTheDocument();
    });
    
    // Should close after confirmation
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should create a task when task type is selected and form is submitted', async () => {
    const onClose = vi.fn();
    renderWithProviders(<QuickCapture isOpen={true} onClose={onClose} />);
    
    // Switch to task type
    const taskButton = screen.getByRole('button', { name: /task/i });
    fireEvent.click(taskButton);
    
    const titleInput = screen.getByLabelText(/task title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /capture task/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    fireEvent.click(submitButton);
    
    // Should show confirmation
    await waitFor(() => {
      expect(screen.getByText(/task captured/i)).toBeInTheDocument();
    });
    
    // Should close after confirmation
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should not submit when title is empty', () => {
    const onClose = vi.fn();
    renderWithProviders(<QuickCapture isOpen={true} onClose={onClose} />);
    
    const submitButton = screen.getByRole('button', { name: /capture note/i });
    fireEvent.click(submitButton);
    
    // Should not close
    expect(onClose).not.toHaveBeenCalled();
  });
});
