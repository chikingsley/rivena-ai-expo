import * as React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';

const Input = React.forwardRef<
  React.ElementRef<typeof TextInput>,
  TextInputProps & { className?: string }
>(({ className, ...props }, ref) => {
  const { theme } = useThemeStore();
  
  return (
    <TextInput
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm',
        'bg-background text-foreground',
        'placeholder:text-muted-foreground',
        'disabled:opacity-50',
        'web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        className
      )}
      placeholderTextColor={Colors[theme].muted}
      style={{
        color: Colors[theme].foreground,
        borderColor: `${Colors[theme].border}`,
      }}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
