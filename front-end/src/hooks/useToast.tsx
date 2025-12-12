// src/hooks/useToast.tsx
import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

export const useToast = () => {
  const showToast = (type: ToastType, title: string, message?: string) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
    });
  };

  return {
    success: (title: string, message?: string) => showToast('success', title, message),
    error: (title: string, message?: string) => showToast('error', title, message),
    info: (title: string, message?: string) => showToast('info', title, message),
  };
};
