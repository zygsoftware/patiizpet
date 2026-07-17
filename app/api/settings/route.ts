import { NextRequest, NextResponse } from "next/server";
import { addClosedBlock, getBusinessSettings, removeClosedBlock, updateBusinessSettings } from "@/lib/business";
import { isAdminRequest } from "@/lib/auth";
import { storageStatus } from "@/lib/storage";

function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  return NextResponse.json(data, { ...init, headers });
}

export async function GET() {
  return json({ settings: await getBusinessSettings(), storage: storageStatus() });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const body = await request.json();
    return json({ settings: await updateBusinessSettings(body), storage: storageStatus() });
  } catch (error) {
    return json(
      { message: error instanceof Error ? error.message : "Ayarlar güncellenemedi." },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const body = await request.json();
    return json({ settings: await addClosedBlock(body), storage: storageStatus() }, { status: 201 });
  } catch (error) {
    return json(
      { message: error instanceof Error ? error.message : "Kapalı saat eklenemedi." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return json({ message: "Kayıt id zorunludur." }, { status: 400 });

  return json({ settings: await removeClosedBlock(id), storage: storageStatus() });
}
