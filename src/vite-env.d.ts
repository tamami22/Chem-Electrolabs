/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEACHER_CODE_HASH?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react-katex' {
  import * as React from 'react';
  export interface MathProps {
    math?: string;
    children?: React.ReactNode;
    renderError?: (error: Error | TypeError) => React.ReactNode;
    as?: string;
    errorColor?: string;
  }
  export const InlineMath: React.ComponentType<MathProps>;
  export const BlockMath: React.ComponentType<MathProps>;
}
