// lib/global.d.ts
import mongoose from "mongoose";

declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      };
    }
  }
}

export interface IDataResponse<T> {
  items: T[];
  pagination?: IPagination;
}

export interface IErrorResponse {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
