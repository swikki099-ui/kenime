'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Rocket,
  Upload,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Eye,
  Trash2,
  Globe,
  HardDrive,
  Calendar,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface Site {
  id: string;
  name: string;
  description: string | null;
  is_published: boolean;
  storage_bytes: number;
  total_views: number;
  last_deployed_at: string | null;
  created_at: string;
}

interface User {
  username: string;
  display_name: string | null;
  email: string;
  is_admin: boolean;
  max_sites: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    fetchUser();
    fetchSites();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      router.push('/login');
    }
  };

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites');
      if (!response.ok) {
        throw new Error('Failed to fetch sites');
      }
      const data = await response.json();
      setSites(data.sites);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleUpload = async (isPreview: boolean = false) => {
    if (!uploadFile) return;

    setUploading(true);
    setUploadProgress(isPreview ? 'Creating preview...' : 'Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('siteName', 'default');
      formData.append('isPreview', String(isPreview));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Upload failed');
        setUploading(false);
        return;
      }

      if (isPreview) {
        window.open(data.deployment.previewUrl, '_blank');
      } else {
        alert('Site uploaded successfully!');
        fetchSites();
      }

      setUploadFile(null);
      setUploadProgress('');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;

    try {
      const response = await fetch('/api/sites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete site');
      }

      fetchSites();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete site');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Rocket className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KENIME
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.display_name || user?.username}
              </span>
              {user?.is_admin && (
                <Link
                  href="/admin"
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Manage your static sites and deployments
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Upload className="w-6 h-6 text-blue-600" />
            <span>Upload New Site</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload ZIP File
              </label>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a ZIP containing your HTML, CSS, and JavaScript files
              </p>
            </div>

            {uploadFile && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpload(true)}
                  disabled={uploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleUpload(false)}
                  disabled={uploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish</span>
                </button>
              </div>
            )}

            {uploading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadProgress}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <span>Your Sites</span>
          </h2>

          {sites.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No sites yet</p>
              <p className="text-sm text-gray-400">
                Upload a ZIP file to create your first site
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {site.name}
                      </h3>
                      {site.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {site.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <HardDrive className="w-4 h-4" />
                          <span>{formatBytes(site.storage_bytes)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{site.total_views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Updated {formatDate(site.last_deployed_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {site.is_published && (
                        <a
                          href={`/${user?.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(site.id)}
                        className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
