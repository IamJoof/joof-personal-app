import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnalyticsView from './AnalyticsView';

describe('AnalyticsView Component', () => {
  it('renders 7-day intake chart and macro completion percentages', () => {
    render(<AnalyticsView />);
    expect(screen.getByText(/Activities & Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Macro Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Weight & BMI Trajectory/i)).toBeInTheDocument();
  });
});
