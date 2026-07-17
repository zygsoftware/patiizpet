import { NextRequest, NextResponse } from "next/server";
import { addPet } from "@/lib/customers";
import { isAdminRequest } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const customer = await addPet(id, body);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Evcil hayvan kaydedilemedi." },
      { status: 400 }
    );
  }
}
