const {
  LINE_LOGIN_CHANNEL_ID,
  ALLOW_DEV_LOGIN = 'false',
  ADMIN_LINE_USER_IDS = '',
  ADMIN_DISPLAY_NAMES = '',
} = process.env;

const BUILT_IN_ADMIN_DISPLAY_NAMES = ['FengFengWang', 'cherrywu'];

export async function resolveLineActor({ idToken, devProfile } = {}) {
  if (idToken && LINE_LOGIN_CHANNEL_ID) {
    return withAdminRole(await verifyLineIdToken(idToken));
  }

  if (ALLOW_DEV_LOGIN === 'true' && devProfile?.displayName) {
    return withAdminRole({
      userId: devProfile.userId || 'dev-user',
      displayName: devProfile.displayName,
    });
  }

  const error = new Error('LINE login is required.');
  error.statusCode = 401;
  throw error;
}

function withAdminRole(actor) {
  return {
    ...actor,
    isAdmin: isAdmin(actor),
  };
}

function isAdmin(actor) {
  const adminUserIds = parseList(ADMIN_LINE_USER_IDS);
  const adminDisplayNames = [...parseList(ADMIN_DISPLAY_NAMES), ...BUILT_IN_ADMIN_DISPLAY_NAMES].map(normalizeName);

  return adminUserIds.includes(actor.userId) || adminDisplayNames.includes(normalizeName(actor.displayName));
}

function parseList(value) {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

async function verifyLineIdToken(idToken) {
  const body = new URLSearchParams({
    id_token: idToken,
    client_id: LINE_LOGIN_CHANNEL_ID,
  });

  const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const error = new Error('Invalid LINE login token.');
    error.statusCode = 401;
    throw error;
  }

  const profile = await response.json();

  return {
    userId: profile.sub,
    displayName: profile.name || 'LINE 使用者',
  };
}
