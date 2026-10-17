import type { Invitation } from "./types";

// Mock households for building screens. Replaced by Supabase in the backend
// phase; nothing outside lib/data may import this file.
//
// Handy tokens for /i/[token]:
//   kwame-ama-boateng-0001  replied (returning state)
//   asante-family-000000002 no reply yet (first open)
//   mr-yeboah-0000000000004 declined everything

export const mockInvitations: Invitation[] = [
  {
    token: "kwame-ama-boateng-0001",
    householdName: "Kwame & Ama Boateng",
    greeting: "Kwame & Ama",
    phone: "024 000 0000",
    side: "Groom's family",
    seats: { engagement: 2, wedding: 2, reception: 2 },
    responses: {
      engagement: { attending: false, names: [] },
      wedding: { attending: true, names: ["Kwame Boateng", "Ama Boateng"] },
      reception: { attending: true, names: ["Kwame Boateng", "Ama Boateng"] },
    },
    note: "So happy for you both!",
    respondedAt: "2026-12-02T18:20:00Z",
  },
  {
    token: "asante-family-000000002",
    householdName: "The Asante Family",
    phone: "020 000 0000",
    side: "Bride's family",
    seats: { engagement: 4, wedding: 4, reception: 4 },
    responses: null,
    note: null,
    respondedAt: null,
  },
  {
    token: "rev-mrs-addo-0000000003",
    householdName: "Rev. & Mrs Addo",
    greeting: "Rev. & Mrs Addo",
    phone: "026 000 0000",
    side: "Bride's family",
    seats: { wedding: 2, reception: 2 },
    responses: {
      wedding: { attending: true, names: ["Rev. Addo", "Mrs Addo"] },
      reception: { attending: true, names: ["Rev. Addo"] },
    },
    note: "Mrs Addo travels that weekend.",
    respondedAt: "2026-12-04T09:05:00Z",
  },
  {
    token: "mr-yeboah-0000000000004",
    householdName: "Mr Yeboah",
    phone: null,
    side: "Groom's family",
    seats: { wedding: 1, reception: 1 },
    responses: {
      wedding: { attending: false, names: [] },
      reception: { attending: false, names: [] },
    },
    note: null,
    respondedAt: "2026-12-05T12:40:00Z",
  },
  {
    token: "esi-mensah-000000000005",
    householdName: "Esi Mensah",
    greeting: "Esi",
    phone: "055 000 0000",
    side: "Bride's friends",
    seats: { wedding: 1, reception: 1 },
    responses: null,
    note: null,
    respondedAt: null,
  },
  {
    token: "dr-kofi-owusu-000000006",
    householdName: "Dr Kofi Owusu & family",
    phone: "024 111 0000",
    side: "Groom's family",
    seats: { engagement: 3, wedding: 3, reception: 3 },
    responses: null,
    note: null,
    respondedAt: null,
  },
];
