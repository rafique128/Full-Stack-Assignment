import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NexusPulse AI brand header', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/NexusPulse/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
