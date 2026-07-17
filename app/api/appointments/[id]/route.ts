import { NextRequest, NextResponse } from "next/server";
import { deleteAppointment, updateAppointment } from "@/lib/appointments";
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
    const appointment = await updateAppointment(id, body);
    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Randevu güncellenemedi." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const { id } = await params;
  await deleteAppointment(id);
  return NextResponse.json({ ok: true });
}
