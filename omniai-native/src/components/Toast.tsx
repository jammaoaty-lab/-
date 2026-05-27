import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function ToastView({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onRemove(item.id));
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const bgColor =
    item.type === 'success'
      ? 'bg-success'
      : item.type === 'error'
        ? 'bg-danger'
        : 'bg-primary';

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className={`${bgColor} px-4 py-2.5 rounded-xl mx-4 mb-2 shadow-lg`}
    >
      <Text className="text-white text-sm font-medium">{item.message}</Text>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View className="absolute top-12 left-0 right-0 z-50 items-center" pointerEvents="box-none">
        {toasts.map((t) => (
          <ToastView key={t.id} item={t} onRemove={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}
