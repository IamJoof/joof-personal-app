import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all 4 pastel metric tiles with proper labels', () => {
    render(<Dashboard onOpenMeasurer={vi.fn()} />);
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Burned')).toBeInTheDocument();
  });

  it('renders BMI status banner with calculated category and target allowance', () => {
    render(<Dashboard onOpenMeasurer={vi.fn()} />);
    expect(screen.getByText(/BMI CALIBRATED TARGET/i)).toBeInTheDocument();
  });

  it('increments water intake on +250ml button click', () => {
    render(<Dashboard onOpenMeasurer={vi.fn()} />);
    const addWaterBtn = screen.getByLabelText(/Add 250ml water/i);
    fireEvent.click(addWaterBtn);
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('launches Food Measurer modal when + Add Food is clicked for a meal', () => {
    const onOpen = vi.fn();
    render(<Dashboard onOpenMeasurer={onOpen} />);
    const addFoodBtns = screen.getAllByRole('button', { name: /\+ Add/i });
    fireEvent.click(addFoodBtns[0]);
    expect(onOpen).toHaveBeenCalled();
  });
});
