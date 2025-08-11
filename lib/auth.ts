export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export const authenticateUser = async (
  email: string,
  password: string
): Promise<AuthUser | null> => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.user) {
      return data.user;
    }

    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
};

export const logoutUser = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success && data.user) {
      return data.user;
    }

    return null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("auth_user");
  return stored ? JSON.parse(stored) : null;
};

export const storeUser = (user: AuthUser): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const clearStoredUser = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth_user");
};
