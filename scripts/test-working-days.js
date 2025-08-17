// Copy the functions directly since import doesn't work in this context
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

function canFileObjection(requestDate) {
  const workingDays = calculateWorkingDays(requestDate);
  return {
    canFile: workingDays >= 17,
    workingDays
  };
}

function testWorkingDaysCalculation() {
  console.log('🧪 Testing Working Days Calculation\n');

  const testCases = [
    { days: 35, description: '35 calendar days ago (should be 25+ working days)' },
    { days: 28, description: '28 calendar days ago (should be 20+ working days)' },
    { days: 25, description: '25 calendar days ago (should be 18+ working days)' },
    { days: 21, description: '21 calendar days ago (should be 15+ working days)' },
    { days: 14, description: '14 calendar days ago (should be 10+ working days)' },
    { days: 7, description: '7 calendar days ago (should be 5+ working days)' }
  ];

  testCases.forEach(testCase => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() - testCase.days);
    
    const workingDays = calculateWorkingDays(testDate);
    const { canFile } = canFileObjection(testDate);
    
    console.log(`📅 ${testCase.description}`);
    console.log(`   Working days: ${workingDays}`);
    console.log(`   Can file keberatan: ${canFile ? '✅ YES' : '❌ NO'}`);
    console.log(`   Date: ${testDate.toLocaleDateString('id-ID')}\n`);
  });

  console.log('🎯 Test Summary:');
  console.log('- Requests with 17+ working days should show ✅ YES');
  console.log('- Requests with < 17 working days should show ❌ NO');
  console.log('- Weekend and holiday exclusions are applied automatically');
}

testWorkingDaysCalculation();