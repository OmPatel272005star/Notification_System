import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const MOCK_USER = {
  id: "1",
  name: "Om Patel",
  email: "om@mailflow.io",
  role: "Admin",
  initials: "OP",
  gender: "Male",
  birthDate: "04/02/1995",
  country: "India",
  state: "Gujarat",
  city: "Ahmedabad",
  mobile: "+91 9624477493",
  language: "English",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mf_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email, password) => {
    // Mock login
    const u = { ...MOCK_USER, email };
    setUser(u);
    localStorage.setItem("mf_user", JSON.stringify(u));
    return true;
  };

  const signup = (data) => {
    const u = { ...MOCK_USER, name: data.fullName, email: data.email };
    setUser(u);
    localStorage.setItem("mf_user", JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mf_user");
  };

  const updateUser = (data) => {
    const u = { ...user, ...data };
    setUser(u);
    localStorage.setItem("mf_user", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);