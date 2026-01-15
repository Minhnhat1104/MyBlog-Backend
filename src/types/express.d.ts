import type { LangKey } from "@/i18n/langKey";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        first_name: string;
        last_name: string;
        avatar_id: string;
        admin: boolean;
        id: number;
      }; // Thêm dấu ? nếu user có thể undefined (chưa login)
      t?: (key: LangKey) => string;
    }
  }

}

export {};