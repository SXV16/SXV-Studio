import { environment } from '../../environments/environment';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const ensureLeadingSlash = (value: string) => value.startsWith('/') ? value : `/${value}`;

export const buildApiUrl = (path: string): string => {
  const normalizedPath = ensureLeadingSlash(path);
  const baseUrl = trimTrailingSlash(environment.apiBaseUrl || '');

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};

export const buildAssetUrl = (path: string | null | undefined): string => {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  return buildApiUrl(path);
};
