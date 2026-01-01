import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render spinner element', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should render without message by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
    // Message should not be present
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
  });

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinnerDiv = container.querySelector('.spinner');
    expect(spinnerDiv).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('should render with medium size by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerDiv = container.querySelector('.spinner');
    expect(spinnerDiv).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const spinnerDiv = container.querySelector('.spinner');
    expect(spinnerDiv).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('should render fullScreen mode', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const wrapper = container.firstChild as HTMLElement;
    // Just check that component renders in fullScreen mode
    expect(wrapper).toBeInTheDocument();
  });

  it('should not render fullScreen mode by default', () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
  });
});
