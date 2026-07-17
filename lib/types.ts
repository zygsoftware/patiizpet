export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  phone: string;
  petName: string;
  petType: string;
  service: string;
  notes: string;
  status: AppointmentStatus;
  source: "customer" | "admin";
  createdAt: string;
};

export type AppointmentInput = Omit<Appointment, "id" | "status" | "source" | "createdAt"> & {
  status?: AppointmentStatus;
  source?: "customer" | "admin";
};

export type PetRecord = {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  notes: string;
  createdAt: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  pets: PetRecord[];
  createdAt: string;
  updatedAt: string;
};

export type CustomerInput = {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
};

export type PetInput = Omit<PetRecord, "id" | "createdAt">;
