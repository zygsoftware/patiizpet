import { NextRequest, NextResponse } from "next/server";
import { createAppointment, listAppointments, listPublicAppointments } from "@/lib/appointments";
import { hasAdminHeader, isAdminRequest } from "@/lib/auth";
import { upsertCustomerFromAppointment } from "@/lib/customers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || undefined;

  if (hasAdminHeader(request) && !isAdminRequest(request)) {
    return NextResponse.json({ message: "Admin şifresi hatalı." }, { status: 401 });
  }

  if (isAdminRequest(request)) {
    return NextResponse.json({ appointments: await listAppointments() });
  }

  return NextResponse.json({ appointments: await listPublicAppointments(date) });
}

export async function POST(request: NextRequest) {
  try {
    if (hasAdminHeader(request) && !isAdminRequest(request)) {
      return NextResponse.json({ message: "Admin şifresi hatalı." }, { status: 401 });
    }

    const body = await request.json();
    const appointment = await createAppointment({
      ...body,
      source: isAdminRequest(request) ? "admin" : "customer",
      status: isAdminRequest(request) ? body.status || "confirmed" : "pending"
    });

    await upsertCustomerFromAppointment({
      name: appointment.customerName,
      phone: appointment.phone,
      pet: {
        name: appointment.petName,
        type: appointment.petType,
        breed: appointment.petType,
        notes: appointment.notes
      }
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Randevu kaydedilemedi." },
      { status: 400 }
    );
  }
}
