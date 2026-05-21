import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { User } from '@/types/apiTypes';
import { profileService } from '../services/profileService';
import type { UpdateProfileRequest } from '../types';

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }

  if (err instanceof Error) {
    return err.message || fallback;
  }

  return fallback;
};

export const useProfile = () => {
  const { user: storedUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(storedUser);
  const [isLoading, setIsLoading] = useState(!storedUser);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileService.getMyInfo();
      setProfile(response.result);
      updateUser(response.result);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải thông tin người dùng.'));
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  // Sync profile when storedUser changes
  const [prevStoredUser, setPrevStoredUser] = useState<User | null>(storedUser);
  if (storedUser !== prevStoredUser) {
    setPrevStoredUser(storedUser);
    setProfile(storedUser);
  }

  useEffect(() => {
    if (!storedUser) {
      const fetchProfile = async () => {
        try {
          const response = await profileService.getMyInfo();
          setProfile(response.result);
          updateUser(response.result);
        } catch (err) {
          setError(getErrorMessage(err, 'Không thể tải thông tin người dùng.'));
        } finally {
          setIsLoading(false);
        }
      };
      void fetchProfile();
    }
  }, [storedUser, updateUser]);

  const saveProfile = async (data: UpdateProfileRequest) => {
    if (!profile?.id) {
      setError('Không tìm thấy mã người dùng.');
      return { success: false };
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: UpdateProfileRequest = {
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || undefined,
        avatarUrl: data.avatarUrl?.trim() || undefined,
      };

      if (data.password?.trim()) {
        payload.password = data.password.trim();
      }

      const response = await profileService.updateProfile(profile.id, payload);
      setProfile(response.result);
      updateUser(response.result);
      setSuccessMessage('Đã cập nhật thông tin cá nhân.');
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể cập nhật thông tin người dùng.');
      setError(message);
      return { success: false, message };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    error,
    successMessage,
    refreshProfile,
    saveProfile,
    clearSuccessMessage: () => setSuccessMessage(null),
  };
};
