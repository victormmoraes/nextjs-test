export interface AuthUser {
  userId: number;
  tenantId: number;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    tenantId: number;
    roles: string[];
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
