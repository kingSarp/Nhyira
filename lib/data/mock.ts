import type { Invitation, JoinRequest, SignupLink } from "./types";

// Mock households for building screens. Replaced by Supabase in the backend
// phase; nothing outside lib/data may import this file.
//
// Handy tokens for /i/[token]:
//   kwame-ama-boateng-0001  replied (returning state)
//   asante-family-000000002 no reply yet (first open)
//   mr-yeboah-0000000000004 declined everything

/** The signed-in organiser, until real auth exists. */
export const mockOrganiser = { email: "efua.owusu@example.com" };

const seedInvitations: Invitation[] = [
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

const seedRequests: JoinRequest[] = [
  {
    id: "req-0001",
    name: "Kojo Antwi",
    phone: "024 222 0000",
    partySize: 2,
    side: "Groom's friends",
    message: "Yaw's football teammate from Legon. Would love to come with my wife.",
    status: "pending",
    createdAt: "2026-12-06T10:15:00Z",
    decidedAt: null,
    token: null,
  },
  {
    id: "req-0002",
    name: "Adwoa Sarpong",
    phone: "050 333 0000",
    partySize: 1,
    side: "Bride's friends",
    message: null,
    status: "pending",
    createdAt: "2026-12-07T08:40:00Z",
    decidedAt: null,
    token: null,
  },
  ...[
    ["Yaa Asantewaa", "024 555 0001", 2, "Bride's colleagues", "From the bank, Ridge branch."],
    ["Kwesi Appiah", "020 555 0002", 1, "Groom's friends", null],
    ["Efia Boakye", "055 555 0003", 3, "Bride's family", "Auntie Lady's side, coming with my two daughters."],
    ["Nii Armah", "026 555 0004", 1, null, null],
    ["Akosua Darko", "050 555 0005", 2, "Bride's friends", "Secondary school mates from Wesley Girls."],
  ].map(([name, phone, partySize, side, message], i) => ({
    id: `req-00${i + 3}`,
    name: name as string,
    phone: phone as string,
    partySize: partySize as number,
    side: side as string | null,
    message: message as string | null,
    status: "pending" as const,
    createdAt: `2026-12-0${8 + (i % 2)}T1${i}:05:00Z`,
    decidedAt: null,
    token: null,
  })),
];

// Both shared links start switched off.
const seedLinks: Record<"request" | "open", SignupLink> = {
  request: { kind: "request", code: "ask-7f3k9q2m", enabled: false, events: ["engagement", "wedding", "reception"], limit: null, retiredCodes: [] },
  open: { kind: "open", code: "join-4h8w2x6p", enabled: false, events: ["engagement", "wedding", "reception"], limit: null, retiredCodes: [] },
};

/**
 * One in-memory store per server process, kept on globalThis so every route
 * and server action sees the same data. Resets when the server restarts.
 */
type Store = { invitations: Invitation[]; requests: JoinRequest[]; links: typeof seedLinks };
const g = globalThis as unknown as { __nhyiraStore?: Store };
export const store: Store = (g.__nhyiraStore ??= {
  invitations: structuredClone(seedInvitations),
  requests: structuredClone(seedRequests),
  links: structuredClone(seedLinks),
});

export const mockInvitations = store.invitations;
