import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE = "libraria_session";

function getSecret() {
  // Try AUTH_SECRET first, fallback to NEXTAUTH_SECRET
  let value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  
  // For development, allow a fallback secret
  if (!value && process.env.NODE_ENV === 'development') {
    console.warn("⚠️ No auth secret set in environment. Using development fallback secret.");
    console.warn("⚠️ This is NOT secure for production!");
    value = "development-secret-do-not-use-in-production-1234567890";
  }
  
  if (!value) {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required for authentication");
  }
  
  return new TextEncoder().encode(value);
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
};

export async function createSessionToken(user: AuthUser) {
  return new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function readSessionToken(token?: string): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: typeof payload.role === "string" ? payload.role : "Librarian",
      avatar: typeof payload.avatar === "string" ? payload.avatar : "LU",
    };
  } catch {
    return null;
  }
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "LU";
}