/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BANI_MERCHANT_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  // add any other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// TS-safe typing for BaniPopUp
interface BaniPopUpResponse {
  status: 'success' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
}

interface BaniPopUpType {
  (options: {
    amount: number | string;
    merchantKey: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    metadata?: Record<string, any>;
    callback: (response: BaniPopUpResponse) => void;
  }): void;
}

declare module 'bani-react' {
  export default function useCheckout(): { BaniPopUp: BaniPopUpType };
}
