'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Rocket,
  Users,
  Globe,
  BarChart3,
  Shield,
  Trash2,
  Ban,
  CheckCircle,
  HardDrive,
  Eye,
  Loader2,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalSites: number;
  totalDeployments: number;
  totalStorage: number;
  totalViews: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

interface Site {
  id: string;
  name: string;
  storage_bytes: number;
  total_views: number;
  is_published: boolean;
  users: { username: string; email: string };
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sites'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, sitesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/sites'),
      ]);

      if (!statsRes.ok || !usersRes.ok || !sitesRes.ok) {
        router.push('/dashboard');
        return;
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const sitesData = await sitesRes.json();

      setStats(statsData.stats);
      setUsers(usersData.users);
      setSites(sitesData.sites);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, banned: boolean) => {
    if (!confirm(`Are you sure you want to ${banned ? 'ban' : 'unban'} this user?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned, reason: 'Admin action' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      fetchData();
    } catch (error) {
      console.error('Ban user error:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;

    try {
      const response = await fetch('/api/admin/sites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, reason: 'Admin action' }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete site');
      }

      fetchData();
    } catch (error) {
      console.error('Delete site error:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                KENIME Admin
              </span>
            </Link>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, sites, and platform statistics</p>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'sites'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Sites
          </button>
        </div>

        {activeTab === 'overview' && stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={<Users className="w-8 h-8 text-blue-600" />}
              title="Total Users"
              value={stats.totalUsers.toString()}
              bg="bg-blue-50"
            />
            <StatCard
              icon={<Globe className="w-8 h-8 text-green-600" />}
              title="Total Sites"
              value={stats.totalSites.toString()}
              bg="bg-green-50"
            />
            <StatCard
              icon={<BarChart3 className="w-8 h-8 text-purple-600" />}
              title="Deployments"
              value={stats.totalDeployments.toString()}
              bg="bg-purple-50"
            />
            <StatCard
              icon={<HardDrive className="w-8 h-8 text-orange-600" />}
              title="Total Storage"
              value={formatBytes(stats.totalStorage)}
              bg="bg-orange-50"
            />
            <StatCard
              icon={<Eye className="w-8 h-8 text-pink-600" />}
              title="Total Views"
              value={stats.totalViews.toString()}
              bg="bg-pink-50"
            />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          {user.is_admin && (
                            <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_banned ? (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            Banned
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!user.is_admin && (
                          <button
                            onClick={() => handleBanUser(user.id, !user.is_banned)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded ${
                              user.is_banned
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            {user.is_banned ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Unban</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4" />
                                <span>Ban</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sites' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Site Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Storage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sites.map((site) => (
                    <tr key={site.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {site.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {site.users?.username || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatBytes(site.storage_bytes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {site.total_views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {site.is_published ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteSite(site.id)}
                          className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, bg }: { icon: React.ReactNode; title: string; value: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-6 border border-gray-200`}>
      <div className="flex items-center space-x-4">
        <div>{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
