import * as schema from "./schema";

export function getDb() {
  console.warn("[AI Studio] Cloudflare D1 binding unavailable — using mock db");
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({})
  };
  return new Proxy({}, {
    get: (_, prop) => prop === 'query' ? new Proxy({}, { get: () => noOp }) : async () => []
  }) as any;
}
