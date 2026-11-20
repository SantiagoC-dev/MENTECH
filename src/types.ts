export type Role = 'patient' | 'professional' | 'admin';
export type Status = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}
export interface Specialist {
  id: string;
  ownerId: string;
  name: string;
  specialty: string;
  bio: string;
  fee: number;
  years: number;
  verified: boolean;
  featured: boolean;
  initials: string;
  color: string;
}
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  topic: string;
  date: string;
  time: string;
  fee: number;
  status: Status;
  createdAt: string;
}
export interface SessionRecord {
  id: string;
  userId: string;
  device: string;
  createdAt: string;
  lastSeen: string;
  active: boolean;
  revoked: boolean;
}
