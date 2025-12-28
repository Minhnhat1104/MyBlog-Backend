declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        admin: boolean;
      }; // Thêm dấu ? nếu user có thể undefined (chưa login)
    }
  }
}

export {};
