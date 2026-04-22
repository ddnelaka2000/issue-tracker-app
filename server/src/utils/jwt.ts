import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';
import { env } from '@/config/env';
import { ApiError } from './ApiError';

export interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
}

type TokenKind = 'access' | 'refresh';

const secrets: Record<TokenKind, string> = {
  access: env.JWT_ACCESS_SECRET,
  refresh: env.JWT_REFRESH_SECRET,
};

const expirations: Record<TokenKind, string> = {
  access: env.JWT_ACCESS_EXPIRES_IN,
  refresh: env.JWT_REFRESH_EXPIRES_IN,
};

export function signToken(
  kind: TokenKind,
  payload: Pick<TokenPayload, 'sub' | 'email'>,
): string {
  const options: SignOptions = {
    expiresIn: expirations[kind] as SignOptions['expiresIn'],
    issuer: 'issue-tracker',
    audience: 'issue-tracker-client',
  };
  return jwt.sign(payload, secrets[kind], options);
}

export function verifyToken(kind: TokenKind, token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, secrets[kind], {
      issuer: 'issue-tracker',
      audience: 'issue-tracker-client',
    });
    if (typeof decoded === 'string') throw ApiError.unauthorized('Invalid token payload');
    return decoded as TokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw ApiError.unauthorized('Token expired');
    if (err instanceof jwt.JsonWebTokenError) throw ApiError.unauthorized('Invalid token');
    throw err;
  }
}

export function issueTokenPair(payload: Pick<TokenPayload, 'sub' | 'email'>) {
  return {
    accessToken: signToken('access', payload),
    refreshToken: signToken('refresh', payload),
  };
}
