import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConnectIndex from '../ConnectIndex';
import { CLIENT_CONFIGS, CLIENT_ORDER } from '../../onboarding/clientConfigs';

const renderPage = () =>
  render(
    <MemoryRouter>
      <ConnectIndex />
    </MemoryRouter>,
  );

describe('ConnectIndex', () => {
  it('renders a tile for every client in CLIENT_ORDER', () => {
    renderPage();
    for (const id of CLIENT_ORDER) {
      const c = CLIENT_CONFIGS[id];
      expect(screen.getByText(c.name)).toBeInTheDocument();
    }
  });

  it('each tile deep-links to /connect/<client>', () => {
    renderPage();
    for (const id of CLIENT_ORDER) {
      const c = CLIENT_CONFIGS[id];
      const link = screen.getByText(c.name).closest('a');
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute('href', `/connect/${id}`);
    }
  });

  it('exposes a guided-wizard link to /onboarding', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /open the guided wizard/i });
    expect(link).toHaveAttribute('href', '/onboarding');
  });

  it('renders a sign-in deep-link in the header', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});
