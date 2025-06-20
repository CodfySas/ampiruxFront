import { Header } from "../../interfaces/base.interface";

export function buildWhere(global: string, headers: Header[]): string {
  const parts: string[] = [];

  if (global && global.trim() !== '') {
    parts.push(`global:${global.trim()}`);
  }

  headers
    .filter(header => header.canFilter && header.filter && header.filter.trim() !== '')
    .forEach(header => parts.push(`${header.key}:${header.filter.trim()}`));

  return parts.length === 0 ? '-' : parts.join(',');
}
