export function parseTtlToSeconds(input: string): number {
  const value = input.trim();
  const match = value.match(/^(\d+)\s*([smhd])?$/i);
  if (!match) {
    throw new Error(
      `Invalid TTL "${input}". Use formats like "900", "15m", "1h", "7d".`,
    );
  }

  const amount = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      return amount;
  }
}

