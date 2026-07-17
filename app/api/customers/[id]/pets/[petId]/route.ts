import { NextRequest, NextResponse } from "next/server";
import { deletePet, updatePet } from "@/lib/customers";
import { isAdminRequest } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string; petId: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const { id, petId } = await params;
    const body = await request.json();
    return NextResponse.json({ customer: await updatePet(id, petId, body) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Pet güncellenemedi." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const { id, petId } = await params;
    return NextResponse.json({ customer: await deletePet(id, petId) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Pet silinemedi." },
      { status: 400 }
    );
  }
}
