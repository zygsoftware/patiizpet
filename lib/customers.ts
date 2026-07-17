import { listAppointments } from "./appointments";
import { kvStore } from "./kv";
import { hasPersistentStorage } from "./storage";
import { CustomerInput, CustomerRecord, PetInput, PetRecord } from "./types";

const INDEX_KEY = "customers:index";
const memoryStore = new Map<string, CustomerRecord>();

function normalizePhone(value: string) {
  return (value || "").replace(/\D/g, "") || value.trim().toLowerCase();
}

function keyFor(id: string) {
  return `customers:${id}`;
}

export async function listCustomers() {
  const customers = await listStoredCustomers();
  const fromAppointments = await customersFromAppointments(customers);
  return mergeCustomers([...customers, ...fromAppointments]).sort(sortCustomers);
}

async function listStoredCustomers() {
  if (!hasPersistentStorage()) {
    return Array.from(memoryStore.values()).sort(sortCustomers);
  }

  const ids = await kvStore.smembers(INDEX_KEY);
  if (!ids.length) return [];

  const items = await kvStore.mget<CustomerRecord>(ids.map(keyFor));
  return items.filter((item): item is CustomerRecord => Boolean(item)).sort(sortCustomers);
}

export async function createCustomer(input: CustomerInput) {
  if (!input.name?.trim() || !input.phone?.trim()) {
    throw new Error("Müşteri adı ve telefon zorunludur.");
  }

  const existing = await findCustomerByPhone(input.phone);
  if (existing) {
    return updateCustomer(existing.id, input);
  }

  const now = new Date().toISOString();
  const customer: CustomerRecord = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || "",
    notes: input.notes?.trim() || "",
    pets: [],
    createdAt: now,
    updatedAt: now
  };

  await saveCustomer(customer);
  return customer;
}

export async function upsertCustomerFromAppointment(input: CustomerInput & { pet?: Partial<PetInput> }) {
  const customer = await createCustomer(input);
  if (input.pet?.name && !customer.pets.some((pet) => pet.name.toLowerCase() === input.pet?.name?.toLowerCase())) {
    return addPet(customer.id, {
      name: input.pet.name || "",
      type: input.pet.type || "",
      breed: input.pet.breed || "",
      age: input.pet.age || "",
      birthDate: input.pet.birthDate || "",
      allergies: input.pet.allergies || "",
      characterNote: input.pet.characterNote || "",
      photo: input.pet.photo || "",
      notes: input.pet.notes || ""
    });
  }
  return customer;
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>) {
  const current = await getCustomer(id);
  if (!current) throw new Error("Müşteri bulunamadı.");

  const next: CustomerRecord = {
    ...current,
    name: input.name?.trim() || current.name,
    phone: input.phone?.trim() || current.phone,
    email: input.email?.trim() ?? current.email,
    notes: input.notes?.trim() ?? current.notes,
    updatedAt: new Date().toISOString()
  };

  await saveCustomer(next);
  return next;
}

export async function deleteCustomer(id: string) {
  if (!hasPersistentStorage()) {
    memoryStore.delete(id);
    return;
  }

  await kvStore.del(keyFor(id));
  await kvStore.srem(INDEX_KEY, id);
}

export async function addPet(customerId: string, input: PetInput) {
  const customer = await getCustomer(customerId);
  if (!customer) throw new Error("Müşteri bulunamadı.");
  if (!input.name?.trim()) throw new Error("Evcil hayvan adı zorunludur.");

  const pet: PetRecord = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    type: input.type?.trim() || "",
    breed: input.breed?.trim() || "",
    age: input.age?.trim() || "",
    birthDate: input.birthDate?.trim() || "",
    allergies: input.allergies?.trim() || "",
    characterNote: input.characterNote?.trim() || "",
    photo: input.photo?.trim() || "",
    notes: input.notes?.trim() || "",
    createdAt: new Date().toISOString()
  };

  const next = {
    ...customer,
    pets: [...customer.pets, pet],
    updatedAt: new Date().toISOString()
  };

  await saveCustomer(next);
  return next;
}

export async function updatePet(customerId: string, petId: string, input: Partial<PetInput>) {
  const customer = await getCustomer(customerId);
  if (!customer) throw new Error("Müşteri bulunamadı.");

  const nextPets = customer.pets.map((pet) =>
    pet.id === petId
      ? {
          ...pet,
          name: input.name?.trim() || pet.name,
          type: input.type?.trim() ?? pet.type,
          breed: input.breed?.trim() ?? pet.breed,
          age: input.age?.trim() ?? pet.age,
          birthDate: input.birthDate?.trim() ?? pet.birthDate,
          allergies: input.allergies?.trim() ?? pet.allergies,
          characterNote: input.characterNote?.trim() ?? pet.characterNote,
          photo: input.photo?.trim() ?? pet.photo,
          notes: input.notes?.trim() ?? pet.notes
        }
      : pet
  );

  if (!nextPets.some((pet) => pet.id === petId)) throw new Error("Pet bulunamadı.");

  const next = {
    ...customer,
    pets: nextPets,
    updatedAt: new Date().toISOString()
  };

  await saveCustomer(next);
  return next;
}

export async function deletePet(customerId: string, petId: string) {
  const customer = await getCustomer(customerId);
  if (!customer) throw new Error("Müşteri bulunamadı.");

  const next = {
    ...customer,
    pets: customer.pets.filter((pet) => pet.id !== petId),
    updatedAt: new Date().toISOString()
  };

  await saveCustomer(next);
  return next;
}

async function getCustomer(id: string) {
  if (!hasPersistentStorage()) return memoryStore.get(id) || null;
  return kvStore.get<CustomerRecord>(keyFor(id));
}

async function findCustomerByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  const customers = await listStoredCustomers();
  return customers.find((customer) => normalizePhone(customer.phone) === normalized) || null;
}

async function saveCustomer(customer: CustomerRecord) {
  if (!hasPersistentStorage()) {
    memoryStore.set(customer.id, customer);
    return;
  }

  await kvStore.set(keyFor(customer.id), customer);
  await kvStore.sadd(INDEX_KEY, customer.id);
}

function sortCustomers(a: CustomerRecord, b: CustomerRecord) {
  return a.name.localeCompare(b.name, "tr");
}

async function customersFromAppointments(existing: CustomerRecord[]) {
  const knownPhones = new Set(existing.map((customer) => normalizePhone(customer.phone)));
  const byPhone = new Map<string, CustomerRecord>();
  const appointments = await listAppointments();

  for (const appointment of appointments) {
    const phoneKey = normalizePhone(appointment.phone);
    if (!phoneKey || knownPhones.has(phoneKey)) continue;

    const current = byPhone.get(phoneKey);
    const petExists = current?.pets.some((pet) => pet.name.toLowerCase() === appointment.petName.toLowerCase());
    const pet: PetRecord = {
      id: `appointment-${appointment.id}`,
      name: appointment.petName,
      type: appointment.petType,
      breed: appointment.petType,
      age: "",
      birthDate: "",
      allergies: "",
      characterNote: "",
      photo: "",
      notes: appointment.notes,
      createdAt: appointment.createdAt
    };

    if (current) {
      if (!petExists) current.pets.push(pet);
      current.updatedAt = appointment.createdAt > current.updatedAt ? appointment.createdAt : current.updatedAt;
      continue;
    }

    byPhone.set(phoneKey, {
      id: `appointment-customer-${phoneKey}`,
      name: appointment.customerName,
      phone: appointment.phone,
      email: "",
      notes: "Randevu geçmişinden oluşturuldu.",
      pets: [pet],
      createdAt: appointment.createdAt,
      updatedAt: appointment.createdAt
    });
  }

  return Array.from(byPhone.values());
}

function mergeCustomers(customers: CustomerRecord[]) {
  const merged = new Map<string, CustomerRecord>();

  for (const customer of customers) {
    const key = normalizePhone(customer.phone) || customer.id;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, { ...customer, pets: [...customer.pets] });
      continue;
    }

    const petNames = new Set(current.pets.map((pet) => pet.name.toLowerCase()));
    for (const pet of customer.pets) {
      if (!petNames.has(pet.name.toLowerCase())) current.pets.push(pet);
    }
    current.updatedAt = customer.updatedAt > current.updatedAt ? customer.updatedAt : current.updatedAt;
  }

  return Array.from(merged.values());
}
