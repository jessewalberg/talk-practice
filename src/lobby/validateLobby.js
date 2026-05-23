const MAX_NAME_LENGTH = 16;

export function validateLobbyNames(nameX, nameO) {
  const x = nameX.trim();
  const o = nameO.trim();

  if (!x || !o) {
    return { valid: false, error: 'Enter both rival names.' };
  }

  if (x.length > MAX_NAME_LENGTH || o.length > MAX_NAME_LENGTH) {
    return { valid: false, error: 'Names must be 16 characters or fewer.' };
  }

  if (x.toLowerCase() === o.toLowerCase()) {
    return { valid: false, error: 'Rivals need different names.' };
  }

  return { valid: true, names: { x, o } };
}
