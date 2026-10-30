import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('Joof Personal App Full Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Dashboard by default with Joof greeting and metric tiles', () => {
    render(<App />);
    expect(screen.getByText(/Good morning, Joof/i)).toBeInTheDocument();
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Burned')).toBeInTheDocument();
  });

  it('switches tabs between Dashboard, Analytics, and Profile Settings', () => {
    render(<App />);

    // Switch to Analytics tab
    const analyticsTabBtn = screen.getByRole('button', { name: /Analytics/i });
    fireEvent.click(analyticsTabBtn);
    expect(screen.getByText(/Activities & Analytics/i)).toBeInTheDocument();

    // Switch to Profile tab
    const profileTabBtn = screen.getByRole('button', { name: /Profile/i });
    fireEvent.click(profileTabBtn);
    expect(screen.getByText(/Profile & BMI Calibration/i)).toBeInTheDocument();

    // Switch back to Home / Dashboard
    const homeTabBtn = screen.getByRole('button', { name: /Home/i });
    fireEvent.click(homeTabBtn);
    expect(screen.getByText(/Good morning, Joof/i)).toBeInTheDocument();
  });

  it('opens Food Measurer modal, logs a food portion, and reflects in dashboard', () => {
    render(<App />);

    // Click the center + Measure button
    const measureBtn = screen.getByLabelText(/Measure Food/i);
    fireEvent.click(measureBtn);

    expect(screen.getByRole('heading', { name: /Measure & Log Food/i })).toBeInTheDocument();

    // Submit adding food to Lunch
    const addFoodBtn = screen.getByRole('button', { name: /\+ Add to Lunch/i });
    fireEvent.click(addFoodBtn);

    // Modal closes
    expect(screen.queryByRole('heading', { name: /Measure & Log Food/i })).not.toBeInTheDocument();

    // Item shows in Today's Meals section
    expect(screen.getByText(/Grilled Chicken Breast/i)).toBeInTheDocument();
  });
});
