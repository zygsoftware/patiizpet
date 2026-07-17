import { NextRequest, NextResponse } from "next/server";
import { deleteCustomer, updateCustomer } from "@/lib/customers";
import { isAdminRequest } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json({ customer: await updateCustomer(id, body) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Müşteri güncellenemedi." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const { id } = await params;
  await deleteCustomer(id);
  return NextResponse.json({ ok: true });
}
