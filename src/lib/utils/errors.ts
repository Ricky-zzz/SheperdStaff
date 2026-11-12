/**
 * Translate raw SQLite / JS errors into messages a user can act on.
 *
 * Screens show `toUserMessage(err)` in alerts instead of raw driver strings
 * like `FOREIGN KEY constraint failed`. Unknown messages are passed through
 * when they look human, otherwise a generic fallback is returned.
 */
export function toUserMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';
  const message = raw.trim();
  if (!message) return fallback;

  const lower = message.toLowerCase();

  if (lower.includes('foreign key')) {
    return 'This record is still used by other data. Remove or unlink those records first.';
  }
  if (lower.includes('unique constraint') || lower.includes('duplicate')) {
    return 'That value is already in use. Choose a different one.';
  }
  if (lower.includes('not null constraint')) {
    return 'A required value is missing. Fill in every required field.';
  }
  if (lower.includes('no such table') || lower.includes('no such column')) {
    return 'The app data is out of date. Restart the app to finish updating.';
  }
  if (lower.includes('database is locked') || lower.includes('busy')) {
    return 'The app is busy. Try again in a moment.';
  }

  // Known service errors are already written for users — keep them.
  return message;
}
