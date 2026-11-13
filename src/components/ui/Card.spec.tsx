import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Card } from './Card';

describe('Card component', () => {
  it('renders card with content and custom class', () => {
    render(
      <Card className="custom-test-class" data-testid="test-card">
        Card Content
      </Card>,
    );
    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('custom-test-class');
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });
});
