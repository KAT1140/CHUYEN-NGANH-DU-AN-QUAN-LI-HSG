// Add HSG scores for previous years
const mysql = require('mysql2/promise');

async function addPreviousYearsHSG() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'hsg-db'
    });
    
    console.log('=== ADDING PREVIOUS YEARS HSG SCORES ===');
    
    // Get all students (current and graduated)
    const [allStudents] = await connection.execute(`
      SELECT s.id, s.name, s.grade, t.subject, t.name as teamName
      FROM students s
      LEFT JOIN teams t ON s.teamId = t.id
      ORDER BY s.name
    `);
    
    console.log(`📚 Found ${allStudents.length} students`);
    
    // Previous years to add scores for
    const previousYears = [
      { year: 2023, examDate: '2023-12-10' },
      { year: 2022, examDate: '2022-12-11' },
      { year: 2021, examDate: '2021-12-12' }
    ];
    
    let totalScoresAdded = 0;
    
    for (const yearData of previousYears) {
      console.log(`\n📅 Adding HSG scores for year ${yearData.year}...`);
      
      // For each year, randomly select students to have participated
      const participationRate = 0.7; // 70% of students participated each year
      const participatingStudents = allStudents
        .filter(() => Math.random() < participationRate)
        .slice(0, Math.floor(allStudents.length * participationRate));
      
      console.log(`  Selected ${participatingStudents.length} students for ${yearData.year}`);
      
      for (const student of participatingStudents) {
        // Each student gets 1-3 HSG scores for different subjects
        const subjects = ['Toán', 'Lý', 'Hóa', 'Sinh', 'Văn', 'Anh', 'Sử', 'Địa', 'Tin'];
        const numScores = Math.floor(Math.random() * 3) + 1; // 1-3 scores per student
        const selectedSubjects = [];
        
        // Always include their team subject if available
        if (student.subject && subjects.includes(student.subject)) {
          selectedSubjects.push(student.subject);
        }
        
        // Add random additional subjects
        while (selectedSubjects.length < numScores) {
          const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
          if (!selectedSubjects.includes(randomSubject)) {
            selectedSubjects.push(randomSubject);
          }
        }
        
        // Create scores for selected subjects
        for (const subject of selectedSubjects) {
          const isMainSubject = subject === student.subject;
          const minScore = isMainSubject ? 7.0 : 4.0; // Higher scores for main subject
          const maxScore = 10.0;
          const score = (Math.random() * (maxScore - minScore) + minScore).toFixed(1);
          
          await connection.execute(`
            INSERT INTO scores (memberId, testName, score, maxScore, examDate, createdBy, createdAt, updatedAt)
            VALUES (?, 'HSG cấp tỉnh', ?, 10, ?, 1, NOW(), NOW())
          `, [student.id, parseFloat(score), yearData.examDate]);
          
          totalScoresAdded++;
        }
      }
      
      console.log(`  ✅ Added scores for ${participatingStudents.length} students in ${yearData.year}`);
    }
    
    console.log(`\n🎉 Total HSG scores added: ${totalScoresAdded}`);
    
    // Verify results
    console.log('\n📊 VERIFICATION:');
    
    const [yearlyStats] = await connection.execute(`
      SELECT 
        YEAR(examDate) as year,
        COUNT(*) as count
      FROM scores 
      WHERE testName = 'HSG cấp tỉnh'
      GROUP BY YEAR(examDate)
      ORDER BY year DESC
    `);
    
    console.log('HSG scores by year:');
    yearlyStats.forEach(stat => {
      console.log(`- ${stat.year}: ${stat.count} scores`);
    });
    
    const [totalHSG] = await connection.execute(`
      SELECT COUNT(*) as count FROM scores WHERE testName = 'HSG cấp tỉnh'
    `);
    
    const [totalAll] = await connection.execute(`
      SELECT COUNT(*) as count FROM scores
    `);
    
    console.log(`\nTotal HSG scores: ${totalHSG[0].count}`);
    console.log(`Total all scores: ${totalAll[0].count}`);
    
    // Show top performers across all years
    const [topPerformers] = await connection.execute(`
      SELECT 
        s.score,
        s.examDate,
        st.name as studentName,
        st.grade,
        t.subject
      FROM scores s
      LEFT JOIN students st ON s.memberId = st.id
      LEFT JOIN teams t ON st.teamId = t.id
      WHERE s.testName = 'HSG cấp tỉnh'
      ORDER BY s.score DESC
      LIMIT 10
    `);
    
    console.log('\n🏆 TOP 10 HSG PERFORMERS (ALL YEARS):');
    topPerformers.forEach((score, index) => {
      const year = new Date(score.examDate).getFullYear();
      console.log(`${index + 1}. ${score.studentName} (${score.subject || 'N/A'}) - ${score.score}/10 (${year})`);
    });
    
    await connection.end();
    console.log('\n✅ Previous years HSG scores added successfully!');
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  }
}

addPreviousYearsHSG();