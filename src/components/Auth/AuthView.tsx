import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Key, 
  Mail, 
  Lock, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  MoreVertical, 
  ExternalLink,
  Github, 
  Chrome, 
  Apple, 
  MessageSquare, 
  UserX,
  X,
  Send,
  Eye,
  FileCode
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { AuthUser } from '../../types';

export const AuthView: React.FC = () => {
  const { 
    authUsers, 
    authProviders, 
    createAuthUser, 
    toggleBanUser, 
    deleteAuthUser, 
    toggleAuthProvider,
    showNotification 
  } = useSupabase();

  const [activeTab, setActiveTab] = useState<'users' | 'providers' | 'templates' | 'policies'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUserForMeta, setSelectedUserForMeta] = useState<AuthUser | null>(null);

  const filteredUsers = authUsers.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github': return <Github className="w-3.5 h-3.5 text-[#333]" />;
      case 'google': return <Chrome className="w-3.5 h-3.5 text-red-500" />;
      case 'apple': return <Apple className="w-3.5 h-3.5 text-[#1a1a1a]" />;
      case 'discord': return <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />;
      default: return <Mail className="w-3.5 h-3.5 text-[#3ecf8e]" />;
    }
  };

  return (
    <div id="auth-management-view" className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#ececec] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#2563eb]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#1a1a1a]">Authentication & Identity</h1>
            <p className="text-xs text-[#666]">Manage user accounts, OAuth providers, MFA, and JWT session policies</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#f4f4f5] p-1 rounded-lg border border-[#ececec] text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'users' ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'}`}
          >
            Users ({authUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'providers' ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'}`}
          >
            Providers ({authProviders.filter(p => p.enabled).length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'templates' ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'}`}
          >
            Email Templates
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'policies' ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'}`}
          >
            Security & MFA
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#999]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email address or UUID..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#ececec] text-xs text-[#1a1a1a] placeholder-[#999] focus:outline-hidden focus:border-[#3ecf8e] font-mono shadow-2xs"
              />
            </div>

            <button
              id="btn-open-invite-user"
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#3ecf8e] hover:bg-[#34b27b] text-xs font-semibold text-white transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="rounded-xl border border-[#ececec] bg-white overflow-hidden shadow-xs">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f9f9f9] border-b border-[#ececec] text-[#666] font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Last Sign In</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] text-[#333]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#999] text-xs font-sans">
                      No users found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isBanned = !!user.bannedUntil;
                    return (
                      <tr key={user.id} className="hover:bg-[#fafafa] transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-sans font-medium text-[#1a1a1a]">{user.email}</div>
                          <div className="text-[10px] text-[#999] font-mono truncate max-w-xs">{user.id}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 capitalize text-[11px] font-sans text-[#333]">
                            {getProviderIcon(user.provider)}
                            <span>{user.provider}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-sans ${
                            user.role === 'admin' ? 'bg-[#faf5ff] text-[#9333ea] border border-[#e9d5ff]' : 'bg-[#f4f4f5] text-[#333]'
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#666] text-[11px]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-[#666] text-[11px]">
                          {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Never'}
                        </td>

                        <td className="py-3 px-4">
                          {isBanned ? (
                            <span className="px-2 py-0.5 rounded bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] text-[10px] font-sans">
                              Banned
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-[10px] font-sans">
                              Active
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => setSelectedUserForMeta(user)}
                              className="p-1 rounded text-[#666] hover:text-[#1a1a1a] hover:bg-[#f4f4f5]"
                              title="View Raw User Metadata"
                            >
                              <FileCode className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                showNotification(`Sent password reset magic link to ${user.email}`);
                              }}
                              className="p-1 rounded text-[#666] hover:text-[#2563eb] hover:bg-[#f4f4f5]"
                              title="Send Magic Link / Reset Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleBanUser(user.id)}
                              className={`p-1 rounded hover:bg-[#f4f4f5] ${isBanned ? 'text-[#3ecf8e]' : 'text-[#666] hover:text-amber-600'}`}
                              title={isBanned ? 'Unban User' : 'Ban User'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteAuthUser(user.id)}
                              className="p-1 rounded text-[#666] hover:text-red-600 hover:bg-[#f4f4f5]"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authProviders.map((prov) => (
            <div key={prov.id} className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getProviderIcon(prov.name.toLowerCase().includes('github') ? 'github' : prov.name.toLowerCase().includes('google') ? 'google' : 'email')}
                    <h3 className="text-xs font-semibold text-[#1a1a1a]">{prov.name}</h3>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${prov.enabled ? 'bg-[#3ecf8e]' : 'bg-[#ccc]'}`} />
                </div>
                {prov.clientId && (
                  <div className="mt-2 text-[11px] font-mono text-[#999] truncate">
                    Client ID: {prov.clientId}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#ececec] flex items-center justify-between">
                <span className="text-[11px] text-[#666]">
                  {prov.enabled ? 'Enabled in Sign-In API' : 'Disabled'}
                </span>
                <button
                  onClick={() => toggleAuthProvider(prov.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    prov.enabled
                      ? 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]'
                      : 'bg-[#f4f4f5] text-[#666] hover:text-[#1a1a1a]'
                  }`}
                >
                  {prov.enabled ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-[#1a1a1a]">Confirmation / Sign-Up Email</h3>
            <p className="text-xs text-[#666]">Sent when a new user signs up with email & password.</p>
            <div className="p-3 rounded bg-[#f9f9f9] text-[11px] font-mono text-[#333] border border-[#ececec] space-y-1">
              <div className="text-[#999]">Subject: Confirm Your Signup for {`{{ .SiteURL }}`}</div>
              <div className="text-[#15803d] mt-2">&lt;h2&gt;Confirm your signup&lt;/h2&gt;</div>
              <div>Follow this link to confirm your user:</div>
              <div className="text-[#2563eb]">&lt;a href="{`{{ .ConfirmationURL }}`}"&gt;Confirm your mail&lt;/a&gt;</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-[#1a1a1a]">Magic Link Login</h3>
            <p className="text-xs text-[#666]">Sent when a user requests passwordless authentication.</p>
            <div className="p-3 rounded bg-[#f9f9f9] text-[11px] font-mono text-[#333] border border-[#ececec] space-y-1">
              <div className="text-[#999]">Subject: Your Magic Link for {`{{ .SiteURL }}`}</div>
              <div className="text-[#15803d] mt-2">&lt;h2&gt;Log In with Magic Link&lt;/h2&gt;</div>
              <div>Click here to log into your account:</div>
              <div className="text-[#2563eb]">&lt;a href="{`{{ .ConfirmationURL }}`}"&gt;Log In&lt;/a&gt;</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-[#1a1a1a]">Password Recovery</h3>
            <p className="text-xs text-[#666]">Sent when a user requests password reset token.</p>
            <div className="p-3 rounded bg-[#f9f9f9] text-[11px] font-mono text-[#333] border border-[#ececec] space-y-1">
              <div className="text-[#999]">Subject: Reset Your Password</div>
              <div className="text-[#15803d] mt-2">&lt;h2&gt;Reset Password Request&lt;/h2&gt;</div>
              <div>Follow this link to choose a new password:</div>
              <div className="text-[#2563eb]">&lt;a href="{`{{ .ConfirmationURL }}`}"&gt;Reset Password&lt;/a&gt;</div>
            </div>
          </div>
        </div>
      )}

      {/* Security & MFA Tab */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-[#1a1a1a]">Multi-Factor Authentication (TOTP)</h3>
            <p className="text-xs text-[#666]">Enable users to enroll authenticator apps (Google Authenticator, 1Password).</p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#15803d] font-medium">TOTP MFA Enabled (Max 10 per user)</span>
              <span className="text-[10px] font-mono bg-[#f0fdf4] text-[#15803d] px-2 py-0.5 rounded border border-[#bbf7d0]">ACTIVE</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-[#1a1a1a]">Password Requirements & Hashing</h3>
            <p className="text-xs text-[#666]">Argon2id cryptographic verification with custom min-length constraints.</p>
            <div className="text-xs font-mono text-[#333] bg-[#f9f9f9] p-3 rounded border border-[#ececec] space-y-1">
              <div>Min Length: 8 characters</div>
              <div>Argon2id: m=65536, t=3, p=4</div>
              <div>Breached Password Check: ACTIVE (HaveIBeenPwned API)</div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <InviteUserModal
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={(email, role, provider) => {
            createAuthUser(email, role, provider);
            setIsInviteModalOpen(false);
          }}
        />
      )}

      {/* Metadata Viewer Modal */}
      {selectedUserForMeta && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#ececec] rounded-xl shadow-2xl overflow-hidden text-[#1a1a1a]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ececec] bg-[#fafafa]">
              <h3 className="text-sm font-semibold text-[#1a1a1a]">Metadata: {selectedUserForMeta.email}</h3>
              <button onClick={() => setSelectedUserForMeta(null)} className="text-[#999] hover:text-[#333]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <div className="text-[11px] font-medium text-[#666] mb-1">User Metadata</div>
                <pre className="p-3 rounded bg-[#f9f9f9] text-xs font-mono text-[#2563eb] border border-[#ececec] overflow-auto max-h-40">
                  {JSON.stringify(selectedUserForMeta.userMetadata, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#666] mb-1">App Metadata</div>
                <pre className="p-3 rounded bg-[#f9f9f9] text-xs font-mono text-[#15803d] border border-[#ececec] overflow-auto max-h-40">
                  {JSON.stringify(selectedUserForMeta.appMetadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Invite User Modal
const InviteUserModal: React.FC<{
  onClose: () => void;
  onInvite: (email: string, role: AuthUser['role'], provider: AuthUser['provider']) => void;
}> = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AuthUser['role']>('authenticated');
  const [provider, setProvider] = useState<AuthUser['provider']>('email');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onInvite(email.trim(), role, provider);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#ececec] rounded-xl shadow-2xl overflow-hidden text-[#1a1a1a]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ececec] bg-[#fafafa]">
          <h3 className="text-sm font-semibold text-[#1a1a1a]">Invite or Create User</h3>
          <button onClick={onClose} className="text-[#999] hover:text-[#333]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#333] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              className="w-full px-3 py-2 rounded-md bg-[#fafafa] border border-[#ececec] text-xs text-[#1a1a1a] focus:outline-hidden focus:border-[#3ecf8e] font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#333] mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md bg-[#fafafa] border border-[#ececec] text-xs text-[#333] focus:outline-hidden focus:border-[#3ecf8e]"
              >
                <option value="authenticated">authenticated</option>
                <option value="admin">admin</option>
                <option value="anon">anon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#333] mb-1">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md bg-[#fafafa] border border-[#ececec] text-xs text-[#333] focus:outline-hidden focus:border-[#3ecf8e]"
              >
                <option value="email">Email</option>
                <option value="github">GitHub</option>
                <option value="google">Google</option>
                <option value="discord">Discord</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#ececec]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-xs text-[#666] hover:bg-[#f9f9f9] border border-[#ececec]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-[#3ecf8e] hover:bg-[#34b27b] text-xs font-medium text-white shadow-xs"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
