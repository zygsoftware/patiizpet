import { NextRequest, NextResponse } from "next/server";
import { createCustomer, listCustomers } from "@/lib/customers";
import { isAdminRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  return NextResponse.json({ customers: await listCustomers() });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const customer = await createCustomer(body);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Müşteri kaydedilemedi." },
      { status: 400 }
    );
  }
}
