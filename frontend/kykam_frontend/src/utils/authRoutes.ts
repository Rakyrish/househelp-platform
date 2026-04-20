export const EMPLOYER_LOGIN_PATH = "/login";
export const EMPLOYER_LOGIN_ROUTE = "/login/employer";
export const WORKER_LOGIN_PATH = "/login/worker";

export const getDashboardPath = (role: "worker" | "employer" | "admin") => {
  if (role === "admin") return "/admin";
  if (role === "employer") return "/employer/dashboard";
  return "/worker/dashboard";
};

export const getLoginPath = (role?: "worker" | "employer" | "admin") => {
  if (role === "admin") return "/admin/login";
  if (role === "worker") return WORKER_LOGIN_PATH;
  return EMPLOYER_LOGIN_PATH;
};
