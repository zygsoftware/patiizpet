import { NextRequest, NextResponse } from "next/server";
import { createGalleryRecord, deleteGalleryRecord, listGalleryRecords } from "@/lib/galleryAdmin";
import { isAdminRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  return NextResponse.json({ gallery: await listGalleryRecords() });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const body = await request.json();
    return NextResponse.json({ record: await createGalleryRecord(body) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Galeri kaydı oluşturulamadı." },
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
  if (!id) return NextResponse.json({ message: "Galeri kaydı id zorunludur." }, { status: 400 });

  await deleteGalleryRecord(id);
  return NextResponse.json({ ok: true });
}
