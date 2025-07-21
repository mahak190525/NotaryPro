import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuthStatus, signOut, setUser } from '../store/slices/authSlice';
import { User } from '../store/types';


export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, []);

  const login = (userData: User) => {
    dispatch(setUser(userData));
  };

  const logout = async () => {
    return dispatch(signOut());
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      dispatch(setUser({ ...user, ...updates }));
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser
  };
}