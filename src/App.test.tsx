import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Smoke Test', () => {
  it('renders Joof Personal App header', () => {
    render(<App />);
    expect(screen.getByText(/Joof/i)).toBeInTheDocument();
  });
});
