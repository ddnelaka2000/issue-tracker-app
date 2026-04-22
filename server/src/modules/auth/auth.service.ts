import { User } from '@/modules/users/user.model';
import { hashPassword, verifyPassword } from '@/utils/password';
import { issueTokenPair, verifyToken } from '@/utils/jwt';
import { ApiError } from '@/utils/ApiError';
import type { RegisterInput, LoginInput } from './auth.schema';

// Auth service: business logic only
export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email }).lean();
  if (existing) throw ApiError.conflict('Email already registered');

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: passwordHash,
  });

  const tokens = issueTokenPair({ sub: user.id, email: user.email });
  return { user: user.toJSON(), ...tokens };
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const ok = await verifyPassword(input.password, user.password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  const tokens = issueTokenPair({ sub: user.id, email: user.email });
  return { user: user.toJSON(), ...tokens };
}

export async function refreshTokens(refreshToken: string | undefined) {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');

  const payload = verifyToken('refresh', refreshToken);

  const user = await User.findById(payload.sub).lean();
  if (!user) throw ApiError.unauthorized('User no longer exists');

  return issueTokenPair({ sub: payload.sub, email: payload.email });
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) throw ApiError.notFound('User not found');
  // .lean() skips the toJSON transform
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
