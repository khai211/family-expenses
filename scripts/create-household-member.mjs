// Usage: node --env-file=.env.local scripts/create-household-member.mjs <email> <password>
// Creates (or updates the password for) a Supabase auth user. If the email
// is already in household_invites, the on_auth_user_created trigger links
// them to that household automatically.

import { createClient } from "@supabase/supabase-js";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/create-household-member.mjs <email> <password>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: existing } = await supabase.auth.admin.listUsers();
const match = existing?.users.find((u) => u.email === email);

if (match) {
  const { error } = await supabase.auth.admin.updateUserById(match.id, { password });
  if (error) throw error;
  console.log(`Updated password for existing user ${email}`);
} else {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`Created user ${email}`);
}
