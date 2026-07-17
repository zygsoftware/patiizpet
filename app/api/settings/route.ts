import { NextRequest, NextResponse } from "next/server";
import { addClosedBlock, getBusinessSettings, removeClosedBlock, updateBusinessSettings } from "@/lib/business";
import { isAdminRequest } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ settings: await getBusinessSettings() });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const body = await request.json();
    return NextResponse.json({ settings: await updateBusinessSettings(body) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Ayarlar güncellenemedi." },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const body = await request.json();
    return NextResponse.json({ settings: await addClosedBlock(body) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Kapalı saat eklenemedi." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Kayıt id zorunludur." }, { status: 400 });

  return NextResponse.json({ settings: await removeClosedBlock(id) });
}
