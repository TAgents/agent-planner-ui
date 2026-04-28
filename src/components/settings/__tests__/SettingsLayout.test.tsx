import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SettingsLayout from '../SettingsLayout';

// useTokens hits the API; stub it.
jest.mock('../../../hooks/useTokens', () => ({
  useTokens: () => ({ tokens: [], loading: false, error: null }),
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/settings" element={<SettingsLayout />}>
          <Route path="profile" element={<div>profile-content</div>} />
          <Route path="organization" element={<div>org-content</div>} />
          <Route path="agents" element={<div>agents-content</div>} />
          <Route path="tokens" element={<div>tokens-content</div>} />
          <Route path="notifications" element={<div>notifications-content</div>} />
          <Route path="billing" element={<div>billing-content</div>} />
          <Route path="danger" element={<div>danger-content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('SettingsLayout', () => {
  const sectionPaths = [
    '/app/settings/profile',
    '/app/settings/organization',
    '/app/settings/agents',
    '/app/settings/tokens',
    '/app/settings/notifications',
    '/app/settings/billing',
    '/app/settings/danger',
  ];

  it('renders a nav link for every section', () => {
    renderAt('/app/settings/profile');
    const nav = screen.getByRole('navigation', { name: /settings sections/i });
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    for (const path of sectionPaths) {
      expect(hrefs).toContain(path);
    }
  });

  it('renders the active route content via Outlet', () => {
    renderAt('/app/settings/notifications');
    expect(screen.getByText('notifications-content')).toBeInTheDocument();
  });

  it.each([
    ['/app/settings/profile', '/app/settings/profile'],
    ['/app/settings/organization', '/app/settings/organization'],
    ['/app/settings/agents', '/app/settings/agents'],
    ['/app/settings/tokens', '/app/settings/tokens'],
  ])('renders correct nav item link for %s', (path, expectedHref) => {
    renderAt(path);
    // Each section nav is a link — find them all and ensure expected href is present.
    const allLinks = screen.getAllByRole('link');
    const hrefs = allLinks.map((a) => a.getAttribute('href'));
    expect(hrefs).toContain(expectedHref);
  });
});
