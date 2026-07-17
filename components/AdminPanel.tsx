"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  CalendarX2,
  CheckCircle2,
  Clock,
  Loader2,
  LockKeyhole,
  LogOut,
  MessageCircle,
  PawPrint,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users
} from "lucide-react";
import { todayInTurkey } from "@/lib/date";
import type { Appointment, AppointmentStatus, BusinessSettings, CustomerRecord, DayKey } from "@/lib/types";

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal"
};

const dayLabels: Record<DayKey, string> = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar"
};

const dayOrder = Object.keys(dayLabels) as DayKey[];

function normalizePhone(value: string) {
  const digits = (value || "").replace(/\D/g, "");
  return digits || (value || "").trim().toLowerCase();
}

function addDays(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function toCalendarMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToCalendarTime(value: number) {
  const hours = Math.floor(value / 60).toString().padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function overlapsCalendar(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return toCalendarMinutes(aStart) < toCalendarMinutes(bEnd) && toCalendarMinutes(bStart) < toCalendarMinutes(aEnd);
}

function dayKeyForCalendar(date: string): DayKey {
  const index = new Date(`${date}T12:00:00`).getDay();
  return dayOrder[(index + 6) % 7];
}

function whatsappAppointmentUrl(item: Appointment, mode: "confirmed" | "completed" | "reminder" = "confirmed") {
  const phone = item.phone.replace(/\D/g, "");
  const normalizedPhone = phone.startsWith("90") ? phone : phone.startsWith("0") ? `9${phone}` : `90${phone}`;
  const messages = {
    confirmed: `Merhaba ${item.customerName}, Patiizpet randevunuz onaylandı. ${item.date} tarihinde ${item.startTime}-${item.endTime} arası ${item.petName} için sizi bekliyoruz. Görüşmek üzere.`,
    completed: `Merhaba ${item.customerName}, bugün ${item.petName} için bakım randevunuzu tamamladık. Patiizpet'i tercih ettiğiniz için teşekkür ederiz.`,
    reminder: `Merhaba ${item.customerName}, Patiizpet randevunuzu hatırlatmak isteriz: ${item.date} ${item.startTime}-${item.endTime}. Uygun değilseniz bize WhatsApp'tan yazabilirsiniz.`
  };
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(messages[mode])}`;
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [storageMode, setStorageMode] = useState<"kv" | "memory">("memory");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [tab, setTab] = useState<"appointments" | "customers" | "business">("appointments");
  const [calendarDate, setCalendarDate] = useState(todayInTurkey());
  const [manualCustomerId, setManualCustomerId] = useState("");
  const [manualPetId, setManualPetId] = useState("");
  const [manualCustomerName, setManualCustomerName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualPetName, setManualPetName] = useState("");
  const [manualPetType, setManualPetType] = useState("");

  const isLoggedIn = Boolean(sessionPassword);
  const today = todayInTurkey();
  const weekEnd = addDays(today, 6);
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || customers[0];
  const manualCustomer = customers.find((customer) => customer.id === manualCustomerId) || null;

  const stats = useMemo(() => {
    const active = appointments.filter((item) => item.status !== "cancelled");
    return {
      total: appointments.length,
      pending: appointments.filter((item) => item.status === "pending").length,
      today: active.filter((item) => item.date === today).length,
      week: active.filter((item) => item.date >= today && item.date <= weekEnd).length,
      customers: customers.length,
      pets: customers.reduce((sum, customer) => sum + customer.pets.length, 0),
      closedBlocks: settings?.closedBlocks.length || 0
    };
  }, [appointments, customers, settings, today, weekEnd]);

  const visibleAppointments = useMemo(() => {
    const q = query.toLowerCase();
    return appointments.filter((item) => {
      const text = `${item.customerName} ${item.phone} ${item.petName} ${item.petType} ${item.service}`.toLowerCase();
      const matchesQuery = text.includes(q);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [appointments, query, statusFilter]);

  const grouped = useMemo(() => {
    return visibleAppointments.reduce<Record<string, Appointment[]>>((acc, item) => {
      acc[item.date] ||= [];
      acc[item.date].push(item);
      return acc;
    }, {});
  }, [visibleAppointments]);

  const visibleCustomers = useMemo(() => {
    const q = query.toLowerCase();
    return customers
      .filter((customer) =>
        `${customer.name} ${customer.phone} ${customer.email} ${customer.pets.map((pet) => `${pet.name} ${pet.type} ${pet.breed}`).join(" ")}`
          .toLowerCase()
          .includes(q)
      )
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [customers, query]);

  const selectedHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    const phone = normalizePhone(selectedCustomer.phone);
    return appointments.filter((item) => normalizePhone(item.phone) === phone);
  }, [appointments, selectedCustomer]);

  const pendingAppointments = useMemo(() => {
    return appointments
      .filter((item) => item.status === "pending")
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }, [appointments]);

  const todayAppointments = useMemo(() => {
    return appointments
      .filter((item) => item.date === today && item.status !== "cancelled")
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, today]);

  const manualPetOptions = useMemo(() => {
    return manualCustomer?.pets || [];
  }, [manualCustomer]);

  const calendarDayAppointments = useMemo(() => {
    return appointments
      .filter((item) => item.date === calendarDate && item.status !== "cancelled")
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, calendarDate]);

  const calendarSlots = useMemo(() => {
    if (!settings) return [];
    const dayKey = dayKeyForCalendar(calendarDate);
    const hours = settings.workingHours[dayKey];
    if (!hours || hours.closed) return [];

    const slots: { time: string; state: "available" | "busy" | "closed"; label: string; appointment?: Appointment }[] = [];
    const step = settings.slotMinutes || 60;
    for (let cursor = toCalendarMinutes(hours.open); cursor < toCalendarMinutes(hours.close); cursor += step) {
      const start = minutesToCalendarTime(cursor);
      const end = minutesToCalendarTime(Math.min(cursor + step, toCalendarMinutes(hours.close)));
      const appointment = calendarDayAppointments.find((item) => overlapsCalendar(start, end, item.startTime, item.endTime));
      const closedBlock = settings.closedBlocks.find(
        (block) => block.date === calendarDate && overlapsCalendar(start, end, block.startTime, block.endTime)
      );
      slots.push({
        time: `${start} - ${end}`,
        state: appointment ? "busy" : closedBlock ? "closed" : "available",
        label: appointment ? `${appointment.petName} / ${appointment.customerName}` : closedBlock ? closedBlock.reason : "Müsait",
        appointment
      });
    }
    return slots;
  }, [settings, calendarDate, calendarDayAppointments]);

  async function loadAll(activePassword = sessionPassword) {
    if (!activePassword) return false;
    setLoading(true);
    const [appointmentResponse, customerResponse, settingsResponse] = await Promise.all([
      fetch("/api/appointments", { cache: "no-store", headers: { "x-admin-password": activePassword } }),
      fetch("/api/customers", { cache: "no-store", headers: { "x-admin-password": activePassword } }),
      fetch("/api/settings", { cache: "no-store", headers: { "x-admin-password": activePassword } })
    ]);
    const appointmentData = await appointmentResponse.json();
    const customerData = await customerResponse.json();
    const settingsData = await settingsResponse.json();
    setLoading(false);

    if (!appointmentResponse.ok || !customerResponse.ok || !settingsResponse.ok) {
      setMessage(appointmentData.message || customerData.message || settingsData.message || "Admin girişi başarısız.");
      return false;
    }

    setAppointments(appointmentData.appointments || []);
    const loadedCustomers = customerData.customers || [];
    setCustomers(loadedCustomers);
    setSettings(settingsData.settings || null);
    setStorageMode(settingsData.storage?.mode || "memory");
    if (!selectedCustomerId && loadedCustomers[0]) setSelectedCustomerId(loadedCustomers[0].id);
    return true;
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const ok = await loadAll(password);
    if (ok) {
      setSessionPassword(password);
      setPassword("");
      setMessage("");
    }
  }

  function logout() {
    setSessionPassword("");
    setAppointments([]);
    setCustomers([]);
    setSelectedCustomerId("");
    setMessage("");
  }

  async function createManualAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword
      },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "Randevu eklenemedi.");
      return;
    }

    setMessage("Randevu eklendi.");
    form.reset();
    setManualCustomerId("");
    setManualPetId("");
    setManualCustomerName("");
    setManualPhone("");
    setManualPetName("");
    setManualPetType("");
    await loadAll();
  }

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword
      },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "Müşteri kaydedilemedi.");
      return;
    }

    setMessage("Müşteri kaydedildi.");
    form.reset();
    setSelectedCustomerId(result.customer.id);
    await loadAll();
  }

  async function addPet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCustomer) return;
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch(`/api/customers/${selectedCustomer.id}/pets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword
      },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "Evcil hayvan kaydedilemedi.");
      return;
    }

    setMessage("Evcil hayvan kaydedildi.");
    form.reset();
    await loadAll();
  }

  async function saveWorkingHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const workingHours = { ...settings.workingHours };

    dayOrder.forEach((day) => {
      workingHours[day] = {
        open: String(formData.get(`${day}-open`) || "09:00"),
        close: String(formData.get(`${day}-close`) || "19:00"),
        closed: formData.get(`${day}-closed`) === "on"
      };
    });

    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword
      },
      body: JSON.stringify({
        slotMinutes: Number(formData.get("slotMinutes") || settings.slotMinutes),
        workingHours
      })
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "İşletme ayarları güncellenemedi.");
      return;
    }

    setMessage("İşletme ayarları güncellendi.");
    setSettings(result.settings);
    setStorageMode(result.storage?.mode || storageMode);
  }

  async function addClosedBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword
      },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "Kapalı saat eklenemedi.");
      return;
    }

    setMessage("Saat aralığı randevuya kapatıldı.");
    setSettings(result.settings);
    setStorageMode(result.storage?.mode || storageMode);
    form.reset();
  }

  async function removeClosedBlock(id: string) {
    const response = await fetch(`/api/settings?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": sessionPassword }
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "Kapalı saat silinemedi.");
      return;
    }

    setMessage("Kapalı saat kaldırıldı.");
    setSettings(result.settings);
    setStorageMode(result.storage?.mode || storageMode);
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword
      },
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.message || "Randevu güncellenemedi.");
      return;
    }
    setMessage(status === "confirmed" ? "Randevu onaylandı." : "Randevu durumu güncellendi.");
    await loadAll();
  }

  async function removeAppointment(id: string) {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": sessionPassword }
    });
    if (!response.ok) {
      setMessage("Randevu silinemedi.");
      return;
    }
    setMessage("Randevu silindi.");
    await loadAll();
  }

  function viewCustomer(customer: CustomerRecord) {
    setSelectedCustomerId(customer.id);
    setQuery(customer.phone);
    setStatusFilter("all");
    setTab("appointments");
  }

  function selectManualCustomer(customerId: string) {
    setManualCustomerId(customerId);
    setManualPetId("");

    const customer = customers.find((item) => item.id === customerId);
    if (!customer) {
      setManualCustomerName("");
      setManualPhone("");
      setManualPetName("");
      setManualPetType("");
      return;
    }

    setManualCustomerName(customer.name);
    setManualPhone(customer.phone);

    const firstPet = customer.pets[0];
    setManualPetId(firstPet?.id || "");
    setManualPetName(firstPet?.name || "");
    setManualPetType(firstPet ? firstPet.breed || firstPet.type : "");
  }

  function selectManualPet(petId: string) {
    setManualPetId(petId);
    const pet = manualPetOptions.find((item) => item.id === petId);
    if (!pet) {
      setManualPetName("");
      setManualPetType("");
      return;
    }

    setManualPetName(pet.name);
    setManualPetType(pet.breed || pet.type);
  }

  if (!isLoggedIn) {
    return (
      <section className="loginShell">
        <form className="loginPanel" onSubmit={handleLogin}>
          <div className="loginIcon">
            <LockKeyhole size={26} />
          </div>
          <span className="sectionLabel">Patiizpet admin</span>
          <h1>Önce giriş yapın</h1>
          <p>Randevu takvimi, müşteri listesi ve evcil hayvan kayıtları için admin şifresi gerekir.</p>
          <label>
            <span>Admin şifresi</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="ADMIN_PASSWORD"
              autoFocus
            />
          </label>
          <button className="submitButton" disabled={!password || loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <LockKeyhole size={18} />}
            Giriş Yap
          </button>
          {message && <p className="formMessage errorText">{message}</p>}
        </form>
      </section>
    );
  }

  return (
    <div className="adminShell">
      <div className="adminDecor decorOne" aria-hidden="true">
        <Image src="/heroes/hero-3.png" alt="" fill sizes="260px" />
      </div>
      <div className="adminDecor decorTwo" aria-hidden="true">
        <Image src="/heroes/hero-2.png" alt="" fill sizes="380px" />
      </div>
      <section className="adminHero premiumAdminHero">
        <div>
          <span className="sectionLabel">Patiizpet admin</span>
          <h1>Günlük salon yönetimi</h1>
          <p>Online talepleri onaylayın, manuel randevu girin, müşteri ve evcil hayvan geçmişini tek yerden takip edin.</p>
        </div>
        <div className="adminHeroActions">
          <button className="iconTextButton ghostButton" onClick={() => loadAll()} disabled={loading}>
            {loading ? <Loader2 size={17} className="spin" /> : <RefreshCw size={17} />} Yenile
          </button>
          <button className="iconTextButton ghostButton" onClick={logout}>
            <LogOut size={17} /> Çıkış
          </button>
        </div>
      </section>

      <div className={`storageNotice ${storageMode === "kv" ? "isPersistent" : "isTemporary"}`}>
        <ShieldCheck size={18} />
        <span>
          {storageMode === "kv"
            ? "Kalıcı kayıt aktif: randevu, müşteri ve işletme ayarları KV veritabanında saklanıyor."
            : "Geçici kayıt modu: KV bağlantısı yoksa Vercel yeniden başlatmalarında randevu ve ayarlar kaybolabilir."}
        </span>
      </div>

      <div className="statRow">
        <div className="statCard">
          <strong>{stats.total}</strong>
          <span>Toplam randevu</span>
        </div>
        <div className="statCard accent">
          <strong>{stats.pending}</strong>
          <span>Bekleyen</span>
        </div>
        <div className="statCard">
          <strong>{stats.today}</strong>
          <span>Bugün</span>
        </div>
        <div className="statCard">
          <strong>{stats.customers}</strong>
          <span>Müşteri</span>
        </div>
        <div className="statCard">
          <strong>{stats.pets}</strong>
          <span>Pet kaydı</span>
        </div>
        <div className="statCard warm">
          <strong>{stats.closedBlocks}</strong>
          <span>Kapalı saat</span>
        </div>
      </div>

      <section className="adminOpsGrid">
        <div className="opsPanel pendingPanel">
          <div className="opsHeader">
            <div>
              <span className="sectionLabel">Onay bekleyenler</span>
              <h2>Yeni randevu talepleri</h2>
            </div>
            <span className={pendingAppointments.length ? "opsBadge hot" : "opsBadge"}>
              {pendingAppointments.length}
            </span>
          </div>
          {pendingAppointments.length === 0 ? (
            <div className="opsEmpty">
              <ShieldCheck size={22} />
              <span>Bekleyen online talep yok.</span>
            </div>
          ) : (
            <div className="requestQueue">
              {pendingAppointments.slice(0, 4).map((item) => (
                <article className="requestCard" key={item.id}>
                  <div>
                    <strong>{item.customerName}</strong>
                    <span>{item.date} · {item.startTime} - {item.endTime}</span>
                    <small>{item.petName} / {item.petType} · {item.service}</small>
                  </div>
                  <div className="requestActions">
                    <button className="quickApprove" type="button" onClick={() => updateStatus(item.id, "confirmed")}>
                      <CheckCircle2 size={16} /> Onayla
                    </button>
                    <button className="quickCancel" type="button" onClick={() => updateStatus(item.id, "cancelled")}>
                      İptal
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="opsPanel todayPanel">
          <div className="opsHeader">
            <div>
              <span className="sectionLabel">Bugün</span>
              <h2>Salon akışı</h2>
            </div>
            <span className="opsBadge">{todayAppointments.length}</span>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="opsEmpty">
              <AlertCircle size={22} />
              <span>Bugün için aktif randevu görünmüyor.</span>
            </div>
          ) : (
            <div className="todayTimeline">
              {todayAppointments.map((item) => (
                <button className="timelineItem" type="button" key={item.id} onClick={() => setQuery(item.phone)}>
                  <span>{item.startTime}</span>
                  <strong>{item.petName}</strong>
                  <small>{item.customerName} · {statusLabels[item.status]}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="adminToolbar">
        <div className="adminTabs">
          <button className={tab === "appointments" ? "adminTab active" : "adminTab"} onClick={() => setTab("appointments")}>
            <CalendarDays size={17} /> Randevular
          </button>
          <button className={tab === "customers" ? "adminTab active" : "adminTab"} onClick={() => setTab("customers")}>
            <Users size={17} /> Müşteriler <span className="tabCount">{customers.length}</span>
          </button>
          <button className={tab === "business" ? "adminTab active" : "adminTab"} onClick={() => setTab("business")}>
            <Settings size={17} /> İşletme
          </button>
        </div>
        {tab !== "business" && (
          <div className="adminFilters">
            <label className="searchBox">
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Müşteri, pet, telefon veya hizmet ara" />
            </label>
            {tab === "appointments" && (
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | AppointmentStatus)}>
                <option value="all">Tüm durumlar</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
            <button className="iconButton" onClick={() => loadAll()} disabled={loading} title="Yenile">
              {loading ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
            </button>
          </div>
        )}
      </div>

      {message && <p className="formMessage adminMessage">{message}</p>}

      {tab === "appointments" ? (
        <section className="adminGrid">
          <form className="adminForm" onSubmit={createManualAppointment}>
            <div className="formHeader">
              <CalendarPlus size={22} />
              <div>
                <h2>Manuel randevu</h2>
                <p>Telefon veya sosyal medyadan gelen talepler için hızlı kayıt.</p>
              </div>
            </div>
            <div className="manualCustomerPicker">
              <label>
                <span>Kayıtlı müşteri</span>
                <select value={manualCustomerId} onChange={(event) => selectManualCustomer(event.target.value)}>
                  <option value="">Yeni müşteri / serbest giriş</option>
                  {customers.map((customer) => (
                    <option value={customer.id} key={customer.id}>
                      {customer.name} · {customer.phone}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Kayıtlı pet</span>
                <select value={manualPetId} onChange={(event) => selectManualPet(event.target.value)} disabled={!manualCustomerId || manualPetOptions.length === 0}>
                  <option value="">{manualCustomerId ? "Pet seç veya elle yaz" : "Önce müşteri seç"}</option>
                  {manualPetOptions.map((pet) => (
                    <option value={pet.id} key={pet.id}>
                      {pet.name} {pet.breed ? `· ${pet.breed}` : pet.type ? `· ${pet.type}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="formGrid">
              <input name="date" type="date" required defaultValue={today} />
              <input name="startTime" type="time" required defaultValue="12:00" />
              <input name="endTime" type="time" required defaultValue="13:00" />
              <input name="customerName" required placeholder="Müşteri adı" value={manualCustomerName} onChange={(event) => setManualCustomerName(event.target.value)} />
              <input name="phone" required placeholder="Telefon" value={manualPhone} onChange={(event) => setManualPhone(event.target.value)} />
              <input name="petName" required placeholder="Pet adı" value={manualPetName} onChange={(event) => setManualPetName(event.target.value)} />
              <input name="petType" required placeholder="Tür / ırk" value={manualPetType} onChange={(event) => setManualPetType(event.target.value)} />
              <select name="service" required defaultValue="Komple bakım">
                <option>Komple bakım</option>
                <option>Banyo ve kurutma</option>
                <option>Makas tıraşı</option>
                <option>Tırnak ve pati bakımı</option>
              </select>
            </div>
            <textarea name="notes" rows={3} placeholder="Özel not, hassasiyet veya bakım detayı" />
            <input name="status" type="hidden" value="confirmed" />
            <button className="submitButton">
              <CheckCircle2 size={18} /> Randevu Ekle
            </button>
          </form>

          <div className="calendarPanel">
            <div className="panelHeader">
              <div>
                <h2>Randevular</h2>
                <p>{visibleAppointments.length} kayıt görüntüleniyor</p>
              </div>
            </div>

            <div className="dailyPlanner">
              <div className="dailyPlannerHead">
                <div>
                  <span className="sectionLabel">Günlük takvim</span>
                  <h3>{calendarDate === today ? "Bugünün akışı" : "Seçili gün akışı"}</h3>
                </div>
                <div className="calendarDateControls">
                  <button type="button" className="ghostButton smallButton" onClick={() => setCalendarDate(addDays(calendarDate, -1))}>
                    Önceki
                  </button>
                  <input type="date" value={calendarDate} onChange={(event) => setCalendarDate(event.target.value)} />
                  <button type="button" className="ghostButton smallButton" onClick={() => setCalendarDate(addDays(calendarDate, 1))}>
                    Sonraki
                  </button>
                </div>
              </div>
              <div className="slotLegend">
                <span><i className="available" /> Müsait</span>
                <span><i className="busy" /> Randevu</span>
                <span><i className="closed" /> Kapalı</span>
              </div>
              {calendarSlots.length === 0 ? (
                <p className="emptyState">Bu gün çalışma planında kapalı görünüyor.</p>
              ) : (
                <div className="dailySlotGrid">
                  {calendarSlots.map((slot) => (
                    <article className={`dailySlot ${slot.state}`} key={slot.time}>
                      <strong>{slot.time}</strong>
                      <span>{slot.label}</span>
                      {slot.appointment && (
                        <a
                          className="whatsappMini"
                          href={whatsappAppointmentUrl(slot.appointment, "reminder")}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle size={14} /> Hatırlat
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>

            {visibleAppointments.length === 0 ? (
              <p className="emptyState">Bu filtrelerle görüntülenecek randevu yok.</p>
            ) : (
              <div className="appointmentList">
                {Object.entries(grouped).map(([date, items]) => (
                  <div className="dayGroup" key={date}>
                    <h3>
                      {date}
                      {date === today && <span className="tag tagTeal">Bugün</span>}
                    </h3>
                    {items.map((item) => (
                      <article className={`appointmentCard${item.date === today ? " isToday" : ""}`} key={item.id}>
                        <div className="appointmentMain">
                          <div className="appointmentTop">
                            <strong>
                              <Clock size={15} /> {item.startTime} - {item.endTime}
                            </strong>
                            <span className={`statusPill ${item.status}`}>{statusLabels[item.status]}</span>
                          </div>
                          <span className="appointmentName">
                            {item.customerName} / {item.petName} ({item.petType})
                          </span>
                          <div className="appointmentMeta">
                            <small>{item.phone}</small>
                            <small>{item.service}</small>
                            <small>{item.source === "admin" ? "Manuel" : "Online"}</small>
                          </div>
                          {item.notes && <p>{item.notes}</p>}
                        </div>
                        <div className="cardActions">
                          {item.status === "pending" && (
                            <button className="quickApprove" type="button" onClick={() => updateStatus(item.id, "confirmed")}>
                              <CheckCircle2 size={16} /> Onayla
                            </button>
                          )}
                          {item.status === "confirmed" && (
                            <button className="quickDone" type="button" onClick={() => updateStatus(item.id, "completed")}>
                              Tamamlandı
                            </button>
                          )}
                          {(item.status === "confirmed" || item.status === "pending") && (
                            <a
                              className="whatsappAction"
                              href={whatsappAppointmentUrl(item, "confirmed")}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <MessageCircle size={16} /> WhatsApp
                            </a>
                          )}
                          {item.status === "completed" && (
                            <a
                              className="whatsappAction"
                              href={whatsappAppointmentUrl(item, "completed")}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <MessageCircle size={16} /> Teşekkür
                            </a>
                          )}
                          {item.status !== "cancelled" && item.status !== "completed" && (
                            <button className="quickCancel" type="button" onClick={() => updateStatus(item.id, "cancelled")}>
                              İptal
                            </button>
                          )}
                          <select
                            value={item.status}
                            onChange={(event) => updateStatus(item.id, event.target.value as AppointmentStatus)}
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option value={value} key={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button
                            className="iconButton danger"
                            type="button"
                            onClick={() => removeAppointment(item.id)}
                            title="Sil"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : tab === "customers" ? (
        <section className="customerAdminGrid">
          <div className="customerForms">
            <form className="adminForm" onSubmit={createCustomer}>
              <div className="formHeader">
                <UserPlus size={22} />
                <div>
                  <h2>Müşteri ekle</h2>
                  <p>Telefon numarası aynıysa kayıt güncellenir.</p>
                </div>
              </div>
              <div className="formGrid">
                <input name="name" required placeholder="Müşteri adı" />
                <input name="phone" required placeholder="Telefon" />
                <input name="email" type="email" placeholder="E-posta" />
                <input name="notes" placeholder="Müşteri notu" />
              </div>
              <button className="submitButton">
                <Plus size={18} /> Müşteri Kaydet
              </button>
            </form>

            <form className="adminForm" onSubmit={addPet}>
              <div className="formHeader">
                <PawPrint size={22} />
                <div>
                  <h2>Pet tanımla</h2>
                  <p>{selectedCustomer ? `${selectedCustomer.name} için kayıt` : "Önce müşteri seçin."}</p>
                </div>
              </div>
              <select value={selectedCustomer?.id || ""} onChange={(event) => setSelectedCustomerId(event.target.value)}>
                {customers.map((customer) => (
                  <option value={customer.id} key={customer.id}>
                    {customer.name} · {customer.phone}
                  </option>
                ))}
              </select>
              <div className="formGrid">
                <input name="name" required placeholder="Pet adı" />
                <input name="type" placeholder="Tür: Köpek, kedi..." />
                <input name="breed" placeholder="Irk" />
                <input name="age" placeholder="Yaş" />
              </div>
              <textarea name="notes" rows={3} placeholder="Hassasiyet, tüy durumu, davranış notu" />
              <button className="submitButton" disabled={!selectedCustomer}>
                <PawPrint size={18} /> Pet Kaydet
              </button>
            </form>
          </div>

          <div className="calendarPanel customerPanel">
            <div className="panelHeader">
              <div>
                <h2>Müşteri listesi</h2>
                <p>{visibleCustomers.length} müşteri · {stats.pets} pet kaydı</p>
              </div>
            </div>

            {visibleCustomers.length === 0 ? (
              <p className="emptyState">Henüz kayıtlı müşteri yok.</p>
            ) : (
              <div className="customerList">
                {visibleCustomers.map((customer) => {
                  const history = appointments.filter((item) => normalizePhone(item.phone) === normalizePhone(customer.phone));
                  const next = history.find((item) => item.date >= today && item.status !== "cancelled");
                  return (
                    <article className={selectedCustomer?.id === customer.id ? "customerCard active" : "customerCard"} key={customer.id}>
                      <button className="customerSelect" type="button" onClick={() => setSelectedCustomerId(customer.id)}>
                        <span className="customerAvatar">
                          <PawPrint size={20} />
                        </span>
                        <span className="customerMain">
                          <span className="customerTop">
                            <strong>{customer.name}</strong>
                            <span className="tag tagTeal">{customer.pets.length} pet</span>
                            {next && <span className="tag tagWarn">Yaklaşan {next.date}</span>}
                          </span>
                          <span className="customerPhone">
                            <Phone size={14} /> {customer.phone}
                          </span>
                          <span className="customerMeta">
                            {customer.pets.length > 0 ? customer.pets.map((pet) => `${pet.name}${pet.breed ? ` · ${pet.breed}` : ""}`).join(", ") : "Pet tanımlı değil"}
                          </span>
                        </span>
                      </button>
                      <button className="ghostButton smallButton" type="button" onClick={() => viewCustomer(customer)}>
                        Randevular
                      </button>
                    </article>
                  );
                })}
              </div>
            )}

            {selectedCustomer && (
              <div className="customerDetail">
                <h3>{selectedCustomer.name}</h3>
                <p>{selectedCustomer.notes || "Müşteri notu eklenmemiş."}</p>
                <div className="petChips">
                  {selectedCustomer.pets.map((pet) => (
                    <span key={pet.id}>
                      <PawPrint size={14} /> {pet.name} {pet.breed && `· ${pet.breed}`}
                    </span>
                  ))}
                </div>
                <div className="miniHistory">
                  <strong>Randevu geçmişi</strong>
                  {selectedHistory.length === 0 ? (
                    <small>Bu müşteri için henüz randevu yok.</small>
                  ) : (
                    selectedHistory.slice(0, 5).map((item) => (
                      <small key={item.id}>
                        {item.date} · {item.startTime} · {item.petName} · {statusLabels[item.status]}
                      </small>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="businessGrid">
          <form className="adminForm businessHoursForm" onSubmit={saveWorkingHours}>
            <div className="formHeader">
              <Settings size={22} />
              <div>
                <h2>Çalışma saatleri</h2>
                <p>Online randevu saatleri bu plana göre oluşur.</p>
              </div>
            </div>
            <label className="compactField">
              <span>Randevu aralığı</span>
              <select name="slotMinutes" defaultValue={settings?.slotMinutes || 60}>
                <option value="30">30 dakika</option>
                <option value="45">45 dakika</option>
                <option value="60">60 dakika</option>
                <option value="90">90 dakika</option>
              </select>
            </label>
            <div className="hoursTable">
              {settings &&
                dayOrder.map((day) => (
                  <div className="hoursRow" key={day}>
                    <label className="dayToggle">
                      <input name={`${day}-closed`} type="checkbox" defaultChecked={settings.workingHours[day].closed} />
                      <span>{dayLabels[day]}</span>
                    </label>
                    <input name={`${day}-open`} type="time" defaultValue={settings.workingHours[day].open} />
                    <input name={`${day}-close`} type="time" defaultValue={settings.workingHours[day].close} />
                  </div>
                ))}
            </div>
            <button className="submitButton">
              <CheckCircle2 size={18} /> Saatleri Kaydet
            </button>
          </form>

          <div className="businessSide">
            <form className="adminForm closedBlockForm" onSubmit={addClosedBlock}>
              <div className="formHeader">
                <CalendarX2 size={22} />
                <div>
                  <h2>Saat kapat</h2>
                  <p>İş, mola veya özel durumlar için belirli aralıkları randevuya kapatın.</p>
                </div>
              </div>
              <div className="formGrid">
                <input name="date" type="date" required defaultValue={today} />
                <input name="startTime" type="time" required defaultValue="12:00" />
                <input name="endTime" type="time" required defaultValue="13:00" />
                <input name="reason" placeholder="Sebep: mola, dış iş..." />
              </div>
              <button className="submitButton">
                <CalendarX2 size={18} /> Aralığı Kapat
              </button>
            </form>

            <div className="calendarPanel closedBlockPanel">
              <div className="panelHeader">
                <div>
                  <h2>Kapalı saatler</h2>
                  <p>{settings?.closedBlocks.length || 0} kayıt</p>
                </div>
              </div>
              <div className="closedBlockList">
                {settings?.closedBlocks.length ? (
                  settings.closedBlocks
                    .slice()
                    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
                    .map((block) => (
                      <article className="closedBlockCard" key={block.id}>
                        <span>
                          <strong>{block.date}</strong>
                          <small>{block.startTime} - {block.endTime} · {block.reason}</small>
                        </span>
                        <button className="iconButton danger" type="button" onClick={() => removeClosedBlock(block.id)}>
                          <Trash2 size={16} />
                        </button>
                      </article>
                    ))
                ) : (
                  <p className="emptyState">Kapalı saat tanımlı değil.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
