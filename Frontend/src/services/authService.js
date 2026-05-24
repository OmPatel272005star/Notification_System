import { postRequest } from "./api.js";

/**
 * POST /auth/login
 * @param {{ email: string, password: string }} data
 */
export const loginUser = (data) => postRequest("/auth/login", data);

/**
 * POST /auth/signup
 * @param {{ display_name: string, email: string, password: string }} data
 */
export const signupUser = (data) => postRequest("/auth/signup", data);
