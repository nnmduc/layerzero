export async function insertRegistration(db, { id, tier, email, facebook, zalo, github, note, ip, userAgent }) {
  const query = `
    INSERT INTO registrations (
      id, tier, email, facebook, zalo, github, note, ip, user_agent, created_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'received')
  `;

  await db
    .prepare(query)
    .bind(
      id,
      tier,
      email,
      facebook || null,
      zalo || null,
      github || null,
      note || null,
      ip || null,
      userAgent || null
    )
    .run();

  return { id, tier, email };
}

export async function getRegistrationCount(db) {
  const res = await db.prepare('SELECT COUNT(*) as count FROM registrations').first();
  return res ? res.count : 0;
}
