import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Input } from './Input';

describe('Input component', () => {
  it('renders input with label', () => {
    render(<Input label="Email Address" placeholder="you@example.com" />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Search" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'TypeScript' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message when provided', () => {
    render(<Input label="Email" error="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });
});
