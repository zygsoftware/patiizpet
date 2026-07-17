"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Loader2,
  LockKeyhole,
  LogOut,
  PawPrint,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users
} from "lucide-react";
import { todayInTurkey } from "@/lib/date";
import type { Appointment, AppointmentStatus, CustomerRecord } from "@/lib/types";

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal"
};

function normalizePhone(value: string) {
  const digits = (value || "").replace(/\D/g, "");
  return digits || (value || "").trim().toLowerCase();
}

function addDays(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [tab, setTab] = useState<"appointments" | "customers">("appointments");

  const isLoggedIn = Boolean(sessionPassword);
  const today = todayInTurkey();
  const weekEnd = addDays(today, 6);
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || customers[0];

  const stats = useMemo(() => {
    const active = appointments.filter((item) => item.status !== "cancelled");
    return {
      total: appointments.length,
      pending: appointments.filter((item) => item.status === "pending").length,
      today: active.filter((item) => item.date === today).length,
      week: active.filter((item) => item.date >= today && item.date <= weekEnd).length,
      customers: customers.length,
      pets: customers.reduce((sum, customer) => sum + customer.pets.length, 0)
    };
  }, [appointments, customers, today, weekEnd]);

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

  async function loadAll(activePassword = sessionPassword) {
    if (!activePassword) return false;
    setLoading(true);
    const [appointmentResponse, customerResponse] = await Promise.all([
      fetch("/api/appointments", { headers: { "x-admin-password": activePassword } }),
      fetch("/api/customers", { headers: { "x-admin-password": activePassword } })
    ]);
    const appointmentData = await appointmentResponse.json();
    const customerData = await customerResponse.json();
    setLoading(false);

    if (!appointmentResponse.ok || !customerResponse.ok) {
      setMessage(appointmentData.message || customerData.message || "Admin girişi başarısız.");
      return false;
    }

    setAppointments(appointmentData.appointments || []);
    const loadedCustomers = customerData.customers || [];
    setCustomers(loadedCustomers);
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
        </div>
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
            <div className="formGrid">
              <input name="date" type="date" required defaultValue={today} />
              <input name="startTime" type="time" required defaultValue="12:00" />
              <input name="endTime" type="time" required defaultValue="13:00" />
              <input name="customerName" required placeholder="Müşteri adı" />
              <input name="phone" required placeholder="Telefon" />
              <input name="petName" required placeholder="Pet adı" />
              <input name="petType" required placeholder="Tür / ırk" />
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
                        <div>
                          <strong>
                            <Clock size={15} /> {item.startTime} - {item.endTime}
                          </strong>
                          <span>
                            {item.customerName} / {item.petName} ({item.petType})
                          </span>
                          <small>
                            {item.phone} · {item.service} · {statusLabels[item.status]} ·{" "}
                            {item.source === "admin" ? "Manuel" : "Online"}
                          </small>
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
      ) : (
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
      )}
    </div>
  );
}
