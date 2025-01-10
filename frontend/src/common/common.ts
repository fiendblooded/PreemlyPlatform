export function getDateRangeDetails(date1: string, date2: string): string {
  const startDate = new Date(date1);
  const endDate = new Date(date2);

  // Validate the dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format.");
  }

  if (startDate > endDate) {
    throw new Error("Start date must be earlier than end date.");
  }

  // Check if the dates are on the same day
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  // Get human-readable range
  let range: string;
  const options = { year: "numeric", month: "long", day: "numeric" } as const;

  if (isSameDay) {
    const date = startDate.toLocaleDateString(undefined, options);
    const startTime = startDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = endDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    range = `${date}, ${startTime} - ${endTime}`;
  } else {
    range = `${startDate.toLocaleDateString(
      undefined,
      options
    )} - ${endDate.toLocaleDateString(undefined, options)}`;
  }

  // Get timezone in GMT+x (City) format
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneOffset = startDate.getTimezoneOffset(); // Offset in minutes
  const gmtOffset = -timeZoneOffset / 60; // Convert to hours
  const gmtString = `GMT${
    gmtOffset >= 0 ? `+${gmtOffset}` : gmtOffset
  } (${timeZone})`;

  // Calculate the duration
  const durationMs = endDate.getTime() - startDate.getTime();
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  // Build the duration string, excluding 0 values
  const durationParts = [];
  if (days > 0) durationParts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) durationParts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0)
    durationParts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  const duration = durationParts.join(", ");

  // Return the formatted result
  return `${range} / ${gmtString} / ${duration} left`;
}
