import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, LogOut, Trash2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function Account() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setError(null);
    if (deleteConfirm !== 'DELETE') {
      setError('Type DELETE to confirm.');
      return;
    }

    // Delete profile row, then sign out. Auth user deletion requires service role.
    if (!user?.id) {
      setError('Could not delete profile. Please try again.');
      return;
    }

    const { data: deleted, error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)
      .select('id');

    if (profileError || !deleted || deleted.length === 0) {
      setError('Could not delete profile. Please try again.');
      return;
    }

    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Nav />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="font-display text-3xl tracking-wide text-ink-900">ACCOUNT</h1>

        <div className="mt-6 space-y-4">
          {/* Profile info */}
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Mail className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-ink-400">Email</p>
                <p className="font-semibold text-ink-900">{profile?.email ?? user?.email}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-ink-400">Age Confirmation</p>
                <p className="font-semibold text-ink-900">
                  {profile?.age_confirmed ? 'Confirmed 18+' : 'Not confirmed'}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-ink-100 pt-4">
              <p className="text-sm text-ink-400">Member since</p>
              <p className="mono font-semibold text-ink-900">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-ink-50"
            >
              <LogOut className="h-5 w-5 text-ink-500" />
              <div>
                <p className="font-semibold text-ink-900">Sign out</p>
                <p className="text-sm text-ink-400">Log out of your account</p>
              </div>
            </button>

            <div className="mt-2 border-t border-ink-100 pt-2">
              <button
                onClick={() => setShowDelete(!showDelete)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-semibold text-red-600">Delete account</p>
                  <p className="text-sm text-ink-400">Permanently remove your account</p>
                </div>
              </button>

              {showDelete && (
                <div className="animate-slideDown mt-3 rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    This will permanently delete your profile. This action cannot be undone.
                  </p>
                  <p className="mt-3 text-sm font-medium text-ink-700">
                    Type <span className="mono font-bold">DELETE</span> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="input-field mt-2"
                    placeholder="DELETE"
                  />
                  {error && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <button
                    onClick={handleDeleteAccount}
                    className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Permanently delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
