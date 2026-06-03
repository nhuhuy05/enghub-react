import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Edit3, Loader2, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { adminUserService, getAdminUserErrorMessage } from '../services/adminUserService';
import { useAuthStore } from '@/features-user/auth/store/useAuthStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { AdminRole, AdminUser, AdminUserCreatePayload, AdminUserUpdatePayload, PageResponse } from '../types';

type ActiveFilter = 'all' | 'active' | 'inactive';
type UserFormMode = 'create' | 'edit';

interface UserFormState {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  active: boolean;
  roles: string[];
}

const emptyPage: PageResponse<AdminUser> = {
  content: [],
  page: 0,
  size: 20,
  total_elements: 0,
  total_pages: 0,
  first: true,
  last: true,
};

const defaultForm: UserFormState = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  avatarUrl: '',
  active: true,
  roles: ['STUDENT'],
};

const roleTone: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700 ring-red-100',
  TEACHER: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  STUDENT: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};

const getErrorText = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { code?: number; message?: string } } }).response;
    if (response?.data?.code === 9999) return '';
    return getAdminUserErrorMessage(response?.data?.code, response?.data?.message || fallback);
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

const formatDate = (value: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const toFormState = (user: AdminUser): UserFormState => ({
  email: user.email,
  password: '',
  fullName: user.full_name || '',
  phone: user.phone || '',
  avatarUrl: user.avatar_url || '',
  active: user.active,
  roles: user.roles.map((role) => role.name),
});

const cleanOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const buildCreatePayload = (form: UserFormState): AdminUserCreatePayload => ({
  email: form.email.trim(),
  password: form.password,
  full_name: cleanOptional(form.fullName),
  phone: cleanOptional(form.phone),
  avatar_url: cleanOptional(form.avatarUrl),
  active: form.active,
  roles: form.roles,
});

const buildUpdatePayload = (form: UserFormState): AdminUserUpdatePayload => ({
  email: form.email.trim(),
  password: form.password.trim() || undefined,
  full_name: cleanOptional(form.fullName),
  phone: cleanOptional(form.phone),
  avatar_url: cleanOptional(form.avatarUrl),
  active: form.active,
  roles: form.roles,
});

export const AdminUsersPage = () => {
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = Number(currentUser?.id);
  const [usersPage, setUsersPage] = useState<PageResponse<AdminUser>>(emptyPage);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState<UserFormMode>('create');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserFormState>(defaultForm);
  const [modalOpen, setModalOpen] = useState(false);

  const activeParam = activeFilter === 'all' ? undefined : activeFilter === 'active';

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminUserService.getUsers({
        keyword: debouncedKeyword.trim(),
        role: roleFilter,
        active: activeParam,
        page,
        size,
      });
      setUsersPage(data);
    } catch (err) {
      setError(getErrorText(err, 'Không thể tải danh sách người dùng.'));
    } finally {
      setLoading(false);
    }
  }, [activeParam, debouncedKeyword, page, roleFilter, size]);

  const loadRoles = useCallback(async () => {
    try {
      const data = await adminUserService.getRoles();
      setRoles(data);
    } catch (err) {
      setError(getErrorText(err, 'Không thể tải danh sách vai trò.'));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRoles(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRoles]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const roleOptions = useMemo(() => {
    const names = roles.map((role) => role.name);
    return names.length ? names : ['ADMIN', 'TEACHER', 'STUDENT'];
  }, [roles]);

  const openCreate = () => {
    setFormMode('create');
    setEditingUser(null);
    setForm({ ...defaultForm });
    setError('');
    setMessage('');
    setModalOpen(true);
  };

  const openEdit = async (user: AdminUser) => {
    try {
      setSaving(true);
      setError('');
      const detail = await adminUserService.getUser(user.id);
      setFormMode('edit');
      setEditingUser(detail);
      setForm(toFormState(detail));
      setMessage('');
      setModalOpen(true);
    } catch (err) {
      setError(getErrorText(err, 'Không thể tải chi tiết người dùng.'));
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (patch: Partial<UserFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.email.trim()) {
      setError('Email không được để trống.');
      return;
    }
    if (formMode === 'create' && form.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (!form.roles.length) {
      setError('Chọn ít nhất một vai trò.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');
      if (formMode === 'create') {
        await adminUserService.createUser(buildCreatePayload(form));
        setMessage('Đã tạo người dùng.');
      } else if (editingUser) {
        await adminUserService.updateUser(editingUser.id, buildUpdatePayload(form));
        setMessage('Đã cập nhật người dùng.');
      }
      setModalOpen(false);
      await loadUsers();
    } catch (err) {
      setError(getErrorText(err, formMode === 'create' ? 'Không thể tạo người dùng.' : 'Không thể cập nhật người dùng.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (roleName: string) => {
    setForm((current) => {
      const exists = current.roles.includes(roleName);
      const rolesNext = exists ? current.roles.filter((role) => role !== roleName) : [...current.roles, roleName];
      return { ...current, roles: rolesNext };
    });
  };

  const toggleStatus = async (user: AdminUser) => {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await adminUserService.updateStatus(user.id, !user.active);
      setMessage(user.active ? 'Đã khóa người dùng.' : 'Đã kích hoạt người dùng.');
      await loadUsers();
    } catch (err) {
      setError(getErrorText(err, 'Không thể cập nhật trạng thái người dùng.'));
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await adminUserService.deleteUser(user.id);
      setMessage('Đã xóa người dùng.');
      if (usersPage.content.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        await loadUsers();
      }
    } catch (err) {
      setError(getErrorText(err, 'Không thể xóa người dùng.'));
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setKeyword('');
    setDebouncedKeyword('');
    setRoleFilter('');
    setActiveFilter('all');
    setPage(0);
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0d4ecb]">Admin</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Quản lý người dùng</h1>
            <p className="mt-2 text-sm text-[#667085]">Tạo tài khoản, phân quyền và quản lý trạng thái truy cập.</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#003da3]"
          >
            <Plus className="h-4 w-4" />
            Tạo người dùng
          </button>
        </section>

        <section className="mt-6 rounded-xl border border-[#d8dced] bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm email, họ tên hoặc số điện thoại"
                className="h-11 w-full rounded-lg border border-[#d8dced] pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-[#004ac6]"
              />
            </label>

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(0);
              }}
              className="h-11 rounded-lg border border-[#d8dced] px-3 text-sm font-semibold text-[#344054] outline-none transition focus:border-[#004ac6]"
            >
              <option value="">Tất cả vai trò</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <select
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value as ActiveFilter);
                setPage(0);
              }}
              className="h-11 rounded-lg border border-[#d8dced] px-3 text-sm font-semibold text-[#344054] outline-none transition focus:border-[#004ac6]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>

            <button
              type="button"
              onClick={() => void loadUsers()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#d8dced] px-4 text-sm font-bold text-[#344054] transition hover:border-[#004ac6] hover:text-[#004ac6]"
            >
              <RefreshCcw className="h-4 w-4" />
              Tải lại
            </button>
          </div>

          {(keyword || roleFilter || activeFilter !== 'all') && (
            <button type="button" onClick={resetFilters} className="mt-3 text-sm font-bold text-[#004ac6] hover:underline">
              Xóa bộ lọc
            </button>
          )}
        </section>

        {message && (
          <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
        )}

        <section className="mt-6 overflow-hidden rounded-xl border border-[#d8dced] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#eef1f6]">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-[#667085]">Người dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-[#667085]">Vai trò</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-[#667085]">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-[#667085]">Ngày tạo</th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-[#667085]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f6]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-sm font-semibold text-[#667085]">
                      <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#004ac6]" />
                      Đang tải người dùng...
                    </td>
                  </tr>
                ) : usersPage.content.length ? (
                  usersPage.content.map((user) => {
                    const isSelf = Number.isFinite(currentUserId) && user.id === currentUserId;
                    return (
                      <tr key={user.id} className="hover:bg-[#fbfcff]">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.email} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf0ff] text-sm font-black text-[#004ac6]">
                                {(user.full_name || user.email).slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-[#111827]">{user.full_name || 'Chưa có tên'}</p>
                              <p className="truncate text-sm text-[#667085]">{user.email}</p>
                              {user.phone && <p className="truncate text-xs text-[#98a2b3]">{user.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles.map((role) => (
                              <span key={role.name} className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${roleTone[role.name] || 'bg-slate-50 text-slate-700 ring-slate-100'}`}>
                                {role.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => void toggleStatus(user)}
                            disabled={saving || isSelf}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ring-1 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.active
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                                : 'bg-slate-100 text-slate-600 ring-slate-200'
                            }`}
                          >
                            {user.active ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {user.active ? 'Hoạt động' : 'Đã khóa'}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-[#505f76]">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void openEdit(user)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8dced] text-[#505f76] transition hover:border-[#004ac6] hover:text-[#004ac6]"
                              aria-label="Sửa người dùng"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              disabled={saving || isSelf}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Xóa người dùng"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-sm font-semibold text-[#667085]">
                      Không có người dùng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#eef1f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-[#667085]">
              Tổng {usersPage.total_elements} người dùng • Trang {usersPage.total_pages ? usersPage.page + 1 : 0}/{usersPage.total_pages}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={size}
                onChange={(event) => {
                  setSize(Number(event.target.value));
                  setPage(0);
                }}
                className="h-9 rounded-lg border border-[#d8dced] px-2 text-sm font-semibold outline-none"
              >
                {[10, 20, 50, 100].map((item) => (
                  <option key={item} value={item}>{item}/trang</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={usersPage.first || loading}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8dced] text-[#505f76] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={usersPage.last || loading}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8dced] text-[#505f76] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-8">
          <form onSubmit={(event) => void submitForm(event)} className="max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#eef1f6] px-5 py-4">
              <div>
                <h2 className="text-xl font-black text-[#111827]">{formMode === 'create' ? 'Tạo người dùng' : 'Cập nhật người dùng'}</h2>
                <p className="mt-1 text-sm text-[#667085]">Vai trò sẽ được thay thế bằng danh sách đang chọn.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7]" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-bold text-[#344054]">Email</span>
                <input
                  value={form.email}
                  onChange={(event) => updateForm({ email: event.target.value })}
                  type="email"
                  className="mt-1 h-11 w-full rounded-lg border border-[#d8dced] px-3 text-sm font-semibold outline-none focus:border-[#004ac6]"
                  required
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-bold text-[#344054]">Mật khẩu {formMode === 'edit' && <span className="font-medium text-[#98a2b3]">(để trống nếu giữ nguyên)</span>}</span>
                <input
                  value={form.password}
                  onChange={(event) => updateForm({ password: event.target.value })}
                  type="password"
                  minLength={formMode === 'create' ? 8 : undefined}
                  className="mt-1 h-11 w-full rounded-lg border border-[#d8dced] px-3 text-sm font-semibold outline-none focus:border-[#004ac6]"
                  required={formMode === 'create'}
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-[#344054]">Họ tên</span>
                <input
                  value={form.fullName}
                  onChange={(event) => updateForm({ fullName: event.target.value })}
                  className="mt-1 h-11 w-full rounded-lg border border-[#d8dced] px-3 text-sm font-semibold outline-none focus:border-[#004ac6]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-[#344054]">Số điện thoại</span>
                <input
                  value={form.phone}
                  onChange={(event) => updateForm({ phone: event.target.value })}
                  className="mt-1 h-11 w-full rounded-lg border border-[#d8dced] px-3 text-sm font-semibold outline-none focus:border-[#004ac6]"
                />
              </label>
          
              <label className="inline-flex items-center gap-3 rounded-lg border border-[#d8dced] px-3 py-3 text-sm font-bold text-[#344054]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => updateForm({ active: event.target.checked })}
                  className="h-4 w-4"
                />
                Tài khoản hoạt động
              </label>
              <div className="sm:col-span-2">
                <p className="text-sm font-bold text-[#344054]">Vai trò</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {roleOptions.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`rounded-full px-3 py-2 text-sm font-black ring-1 transition ${
                        form.roles.includes(role)
                          ? roleTone[role] || 'bg-[#eaf0ff] text-[#004ac6] ring-[#c9d8ff]'
                          : 'bg-white text-[#667085] ring-[#d8dced] hover:text-[#004ac6]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#eef1f6] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-[#d8dced] px-4 py-2.5 text-sm font-bold text-[#344054] transition hover:bg-[#f8fafc]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#003da3] disabled:cursor-wait disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {formMode === 'create' ? 'Tạo người dùng' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xóa người dùng?"
        message={deleteTarget ? `Xóa người dùng ${deleteTarget.email}?` : ''}
        confirmLabel="Xóa"
        loading={saving}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          void deleteUser(target);
        }}
      />
    </main>
  );
};
