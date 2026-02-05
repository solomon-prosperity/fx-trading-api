export interface IJwtPayload {
  user_id: string;
  user_type: string;
  jti: string;
  env: string;
  iat: number;
}

export interface IValidatePasswordResetToken {
  is_token_valid: boolean;
  user_id: string;
}
