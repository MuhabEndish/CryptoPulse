import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal Component', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnClose = vi.fn();

  it('should render modal with title and message', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Post"
        message="Are you sure you want to delete this post?"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Delete Post')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this post?')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        title="Delete Post"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Delete Post')).not.toBeInTheDocument();
  });

  it('should call onConfirm and onClose when confirm button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Post"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Post"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should render with custom button labels', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Post"
        message="Are you sure?"
        confirmText="Yes, Delete"
        cancelText="No, Keep it"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: 'Yes, Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No, Keep it' })).toBeInTheDocument();
  });
});
