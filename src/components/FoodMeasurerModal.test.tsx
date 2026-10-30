import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FoodMeasurerModal from './FoodMeasurerModal';

describe('FoodMeasurerModal Component', () => {
  it('renders modal with search and default portion controls', () => {
    render(
      <FoodMeasurerModal
        isOpen={true}
        initialMeal="breakfast"
        onClose={() => {}}
        onAddFood={() => {}}
        remainingCalories={800}
      />
    );

    expect(screen.getByText(/Measure & Log Food/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search food/i)).toBeInTheDocument();
  });

  it('calculates and updates calories when gram input changes', () => {
    render(
      <FoodMeasurerModal
        isOpen={true}
        initialMeal="breakfast"
        onClose={() => {}}
        onAddFood={() => {}}
        remainingCalories={800}
      />
    );

    const gramInput = screen.getByLabelText(/Gram Weight/i) as HTMLInputElement;
    fireEvent.change(gramInput, { target: { value: '200' } });

    // With default selection (Grilled Chicken Breast 165 kcal / 100g), 200g should be 330 kcal
    expect(screen.getByTestId('computed-calories')).toHaveTextContent(/330/);
  });

  it('triggers onAddFood with calculated portion and meal slot on submit', () => {
    const onAdd = vi.fn();
    render(
      <FoodMeasurerModal
        isOpen={true}
        initialMeal="lunch"
        onClose={() => {}}
        onAddFood={onAdd}
        remainingCalories={800}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /\+ Add to Lunch/i }));
    expect(onAdd).toHaveBeenCalledWith(
      'lunch',
      expect.objectContaining({
        foodName: expect.any(String),
        grams: expect.any(Number),
        nutrition: expect.objectContaining({
          calories: expect.any(Number),
          protein: expect.any(Number),
        }),
      })
    );
  });

  it('allows quick preset portion selection like 100g or 150g', () => {
    render(
      <FoodMeasurerModal
        isOpen={true}
        initialMeal="breakfast"
        onClose={() => {}}
        onAddFood={() => {}}
        remainingCalories={800}
      />
    );

    const preset150 = screen.getByRole('button', { name: /150g/i });
    fireEvent.click(preset150);

    const gramInput = screen.getByLabelText(/Gram Weight/i) as HTMLInputElement;
    expect(gramInput.value).toBe('150');
  });
});
