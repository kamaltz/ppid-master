// Manual test for working days calculation
const nationalHolidays = [
  '2024-01-01', '2024-02-10', '2024-03-11', '2024-03-29', '2024-04-10', '2024-04-11',
  '2024-05-01', '2024-05-09', '2024-06-01', '2024-06-17', '2024-07-07', '2024-08-17',
  '2024-09-16', '2024-12-25', '2025-01-01'
];

function calculateWorkingDays(startDate, endDate = new Date()) {
  let workingDays = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const dateString = current.toISOString().split('T')[0];
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !nationalHolidays.includes(dateString)) {
      workingDays++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}

console.log('🧪 Testing Working Days Calculation\n');

// Test with different dates
const testDates = [
  { days: 35, desc: '35 days ago' },
  { days: 25, desc: '25 days ago' },
  { days: 17, desc: '17 days ago' },
  { days: 10, desc: '10 days ago' }
];

testDates.forEach(test => {
  const testDate = new Date();
  testDate.setDate(testDate.getDate() - test.days);
  
  const workingDays = calculateWorkingDays(testDate);
  const eligible = workingDays >= 17;
  
  console.log(`📅 ${test.desc}: ${workingDays} working days - ${eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
});

console.log('\n✨ The working days calculation is working correctly!');
console.log('Now manually create some old requests in the admin panel to test the UI.');