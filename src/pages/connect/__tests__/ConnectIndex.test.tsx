import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConnectIndex from '../ConnectIndex';
import { CLIENT_CONFIGS, TOKEN_CLIENT_ORDER } from '../../onboarding/clientConfigs';

const renderPage = () =>
  render(
    <MemoryRouter>
      <ConnectIndex />
    </MemoryRouter>,
  );

describe('ConnectIndex', () => {
  it('renders a token-setup tile for every token client', () => {
    renderPage();
    for (const id of TOKEN_CLIENT_ORDER) {
      const c = CLIENT_CONFIGS[id];
      expect(screen.getByText(c.name)).toBeInTheDocument();
    }
  });

  it('each tile deep-links to /connect/<client>', () => {
    renderPage();
    for (const id of TOKEN_CLIENT_ORDER) {
      const c = CLIENT_CONFIGS[id];
      const link = screen.getByText(c.name).closest('a');
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute('href', `/connect/${id}`);
    }
  });

  it('exposes a guided-wizard link to /onboarding', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /guided wizard/i });
    expect(link).toHaveAttribute('href', '/onboarding');
  });

  it('renders a sign-in deep-link in the header', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});
