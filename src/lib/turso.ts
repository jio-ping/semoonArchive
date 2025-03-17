import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const turso =
  url && authToken
    ? createClient({
        url,
        authToken,
      })
    : null;
