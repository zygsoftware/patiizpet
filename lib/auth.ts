import { NextRequest } from "next/server";

export function hasAdminHeader(request: NextRequest) {
  return request.headers.has("x-admin-password");
}

export function isAdminRequest(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD || "patiizpet-admin";
  return request.headers.get("x-admin-password") === password;
}
