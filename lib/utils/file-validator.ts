import { normalize, isAbsolute, join, relative } from 'path';

const ALLOWED_EXTENSIONS = [
  '.html', '.htm', '.css', '.js', '.json',
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.pdf', '.txt', '.md', '.xml', '.map',
];

const DISALLOWED_EXTENSIONS = [
  '.php', '.exe', '.py', '.sh', '.bat', '.cmd', '.dll',
  '.so', '.dylib', '.app', '.jar', '.war', '.ear',
  '.rb', '.pl', '.cgi', '.asp', '.aspx', '.jsp',
  '.sql', '.db', '.sqlite', '.mdb',
];

const DANGEROUS_PATTERNS = [
  /<?php/i,
  /<%.*%>/,
  /<script[^>]*src=[^>]*http/i,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /system\s*\(/i,
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  hasIndexHtml: boolean;
  fileCount: number;
  totalSize: number;
}

export function validateFileName(fileName: string): boolean {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (DISALLOWED_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  if (fileName.includes('..') || fileName.includes('\\')) {
    return false;
  }
  
  return true;
}

export function validateFileContent(fileName: string, content: string): { valid: boolean; reason?: string } {
  const lowerContent = content.toLowerCase();
  
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(content)) {
      return {
        valid: false,
        reason: `Potentially dangerous content detected in ${fileName}`,
      };
    }
  }
  
  if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    if (lowerContent.includes('<?php')) {
      return { valid: false, reason: 'PHP code not allowed in HTML files' };
    }
  }
  
  return { valid: true };
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._/-]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/-{2,}/g, '-');
}

export function getFileExtension(fileName: string): string {
  return fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
}

export function isAllowedFileType(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function sanitizeZipPath(entryName: string, targetDir: string): string | null {
  if (isAbsolute(entryName)) {
    return null;
  }

  const normalizedPath = normalize(entryName).replace(/^(\.\.(\/|\\|$))+/, '');
  
  if (normalizedPath.startsWith('..') || normalizedPath.includes('/../') || normalizedPath.includes('\\..\\')) {
    return null;
  }

  const fullPath = normalize(join(targetDir, normalizedPath));
  const normalizedTargetDir = normalize(targetDir);
  
  if (!fullPath.startsWith(normalizedTargetDir + '/') && fullPath !== normalizedTargetDir) {
    return null;
  }

  return normalizedPath;
}

export function validateZipStructure(files: { name: string; size: number; content: Buffer }[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let hasIndexHtml = false;
  let totalSize = 0;

  if (files.length === 0) {
    errors.push('ZIP file is empty');
    return { valid: false, errors, warnings, hasIndexHtml, fileCount: 0, totalSize: 0 };
  }

  for (const file of files) {
    totalSize += file.size;

    if (!validateFileName(file.name)) {
      errors.push(`Invalid or disallowed file: ${file.name}`);
      continue;
    }

    if (file.name.toLowerCase() === 'index.html' || file.name.toLowerCase().endsWith('/index.html')) {
      hasIndexHtml = true;
    }

    if (file.size > 50 * 1024 * 1024) {
      errors.push(`File too large: ${file.name} (max 50MB per file)`);
    }
  }

  if (!hasIndexHtml) {
    warnings.push('No index.html found - users will see a directory listing or 404');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    hasIndexHtml,
    fileCount: files.length,
    totalSize,
  };
}
