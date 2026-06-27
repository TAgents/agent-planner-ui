import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../services/api';
import { UI_VERSION } from '../../generated/version';

/**
 * Small build-version line for the settings rail footer. Shows the UI bundle
 * version (generated at build time from package.json) and the live backend
 * version (fetched from the API's public /version endpoint) so it's obvious
 * which builds are actually running.
 */
const VersionBadge: React.FC = () => {
  const [apiVersion, setApiVersion] = useState<string>('…');

  useEffect(() => {
    let alive = true;
    axiosInstance
      .get('/version')
      .then((res: { data?: { version?: string } }) => {
        if (alive) setApiVersion(res?.data?.version || 'unknown');
      })
      .catch(() => {
        if (alive) setApiVersion('unreachable');
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div
      className="mt-3 px-3 py-2 text-[10px] leading-relaxed text-text-sec font-mono"
      title="UI build version · live backend API version"
    >
      <div>UI v{UI_VERSION}</div>
      <div>API v{apiVersion}</div>
    </div>
  );
};

export default VersionBadge;
