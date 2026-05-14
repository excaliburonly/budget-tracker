export function getUserCurrentMonth(timezone: string = 'UTC') {
  const now = new Date();
  const userDateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);

  const getPart = (type: string) => userDateParts.find(p => p.type === type)?.value;
  return `${getPart('year')}-${getPart('month')}`;
}

export function getUserToday(timezone: string = 'UTC') {
  const now = new Date();
  const userDateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const getPart = (type: string) => userDateParts.find(p => p.type === type)?.value;
  
  return new Date(Date.UTC(
    parseInt(getPart('year')!),
    parseInt(getPart('month')!) - 1,
    parseInt(getPart('day')!)
  ));
}

export function getUserDateParts(timezone: string = 'UTC') {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(now);
}
