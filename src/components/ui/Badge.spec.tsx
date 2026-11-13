import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Badge } from './Badge';

describe('Badge component', () => {
  it('renders badge content', () => {
    render(<Badge>Active Status</Badge>);
    expect(screen.getByText('Active Status')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Badge onClick={handleClick}>Clickable</Badge>);

    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes properly', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    expect(container.firstChild).toHaveClass('text-[#16A34A]');
  });
});
