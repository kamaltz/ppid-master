// Indonesian national holidays 2024-2025
const nationalHolidays = [
  '2024-01-01', // New Year
  '2024-02-10', // Chinese New Year
  '2024-03-11', // Nyepi
  '2024-03-29', // Good Friday
  '2024-04-10', // Eid al-Fitr
  '2024-04-11', // Eid al-Fitr
  '2024-05-01', // Labor Day
  '2024-05-09', // Ascension Day
  '2024-06-01', // Pancasila Day
  '2024-06-17', // Eid al-Adha
  '2024-07-07', // Islamic New Year
  '2024-08-17', // Independence Day
  '2024-09-16', // Prophet Muhammad Birthday
  '2024-12-25', // Christmas
  '2025-01-01', // New Year
  // Add more years as needed
];

export function calculateWorkingDays(startDate: Date, endDate: Date = new Date()): number {
  let workingDays = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const dateString = current.toISOString().split('T')[0];
    
    // Skip weekends (Saturday = 6, Sunday = 0) and national holidays
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !nationalHolidays.includes(dateString)) {
      workingDays++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}

export function canFileObjection(requestDate: Date): { canFile: boolean; workingDays: number } {
  const workingDays = calculateWorkingDays(requestDate);
  return {
    canFile: workingDays >= 17,
    workingDays
  };
}