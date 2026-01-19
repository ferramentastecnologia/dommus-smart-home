/**
 * Generates a Google Calendar link with pre-filled information
 */
export function generateGoogleCalendarLink(params: {
  title: string;
  description?: string;
  location?: string;
  startTime?: Date;
  endTime?: Date;
  emails?: string[];
}): string {
  const {
    title,
    description = "",
    location = "",
    startTime = new Date(Date.now() + 3600000), // Default to 1 hour from now
    endTime = new Date(Date.now() + 7200000),   // Default to 2 hours from now
    emails = []
  } = params;

  // Format dates in the format YYYYMMDDTHHMMSSZ
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };
  
  const formattedStart = formatDate(startTime);
  const formattedEnd = formatDate(endTime);
  
  // Build the URL parameters
  const urlParams = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location: location,
    dates: `${formattedStart}/${formattedEnd}`,
  });
  
  // Add guests
  if (emails.length > 0) {
    urlParams.append("add", emails.join(","));
  }
  
  return `https://calendar.google.com/calendar/render?${urlParams.toString()}`;
} 