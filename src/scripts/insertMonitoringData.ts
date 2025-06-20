import { Client } from 'pg';

// Database configuration with provided password
const client = new Client({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ytomsntqfpjjsotkkymh',
  password: 'Annarella91!',
  ssl: {
    rejectUnauthorized: false
  }
});

// Demo client UUIDs from clientUtils
const DEMO_CLIENT_UUIDS = [
  '550e8400-e29b-41d4-a716-446655440000', // demo-client-1
  '550e8400-e29b-41d4-a716-446655440001', // demo-client-2
];

const generateMonitoringData = () => {
  const monitoringEntries = [];
  
  // Generate 14 days of data for each demo client
  for (let clientIndex = 0; clientIndex < DEMO_CLIENT_UUIDS.length; clientIndex++) {
    const clientId = DEMO_CLIENT_UUIDS[clientIndex];
    
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const entryDate = new Date();
      entryDate.setDate(entryDate.getDate() - dayOffset);
      
      // Generate realistic but varied data
      const baseValue = clientIndex === 0 ? 7 : 6; // Client 1 slightly higher baseline
      const variation = Math.random() * 4 - 2; // -2 to +2 variation
      
      const moodRating = Math.max(1, Math.min(10, Math.round(baseValue + variation)));
      const energyLevel = Math.max(1, Math.min(10, Math.round(baseValue + variation * 0.8)));
      const sleepQuality = Math.max(1, Math.min(10, Math.round(baseValue + variation * 0.6)));
      const sleepHours = Math.max(4, Math.min(10, Math.round((baseValue - 1 + (Math.random() * 2)) * 10) / 10));
      const exerciseMinutes = Math.random() > 0.3 ? Math.round(Math.random() * 60) : 0;
      const socialInteraction = Math.random() > 0.4;
      const stressLevel = Math.max(1, Math.min(10, Math.round(8 - moodRating + Math.random() * 2)));
      
      // Sample journal entries and notes
      const journalEntries = [
        'Had a productive day with good energy levels.',
        'Feeling more balanced after practicing breathing exercises.',
        'Challenging day but managed to use coping strategies.',
        'Great day with friends and family. Mood was excellent.',
        'Working on maintaining consistency with daily routines.',
        'Some anxiety today but the grounding technique helped.',
        'Excellent day! Everything went smoothly and felt positive.',
        'Medium day. Practiced mindfulness during lunch break.',
        'Good progress with sleep hygiene and morning routine.',
        'Rough night affected my mood, but afternoon was better.'
      ];
      
      const gratitudeNotes = [
        'Grateful for my support system',
        'Thankful for good health',
        'Grateful for small wins today',
        'Appreciative of beautiful weather',
        'Thankful for progress in therapy',
        'Grateful for peaceful moments',
        'Appreciative of family time',
        'Thankful for energy to exercise',
        'Grateful for restful sleep',
        'Appreciative of positive interactions'
      ];
      
      const taskNotes = [
        'Completed breathing exercises as planned',
        'Practiced grounding technique when feeling anxious',
        'Used mindfulness during stressful moments',
        'Completed mood tracking for the day',
        'Practiced cognitive restructuring exercises',
        'Engaged in behavioral activation activities',
        'Maintained sleep hygiene routine',
        'Used relaxation techniques before bed',
        'Practiced gratitude journaling',
        'Completed daily reflection exercise'
      ];
      
      const taskRemarks = [
        'Technique was very effective today',
        'Finding it easier to implement strategies',
        'Still working on consistency but improving',
        'Noticed positive effects immediately',
        'Challenging but worth the effort',
        'Building good habits gradually',
        'Feeling more confident with tools',
        'Seeing real improvements over time',
        'Strategy helped manage difficult moment',
        'Consistency is paying off'
      ];
      
      const entry = {
        client_id: clientId,
        entry_date: entryDate.toISOString().split('T')[0],
        mood_rating: moodRating,
        energy_level: energyLevel,
        sleep_quality: sleepQuality,
        sleep_hours: sleepHours,
        exercise_minutes: exerciseMinutes,
        social_interaction: socialInteraction,
        stress_level: stressLevel,
        journal_entry: journalEntries[Math.floor(Math.random() * journalEntries.length)],
        gratitude_note: gratitudeNotes[Math.floor(Math.random() * gratitudeNotes.length)],
        task_notes: taskNotes[Math.floor(Math.random() * taskNotes.length)],
        task_remarks: taskRemarks[Math.floor(Math.random() * taskRemarks.length)]
      };
      
      monitoringEntries.push(entry);
    }
  }
  
  return monitoringEntries;
};

const insertMonitoringData = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully!');
    
    console.log('🚀 Generating monitoring data...');
    const entries = generateMonitoringData();
    
    console.log('🗑️ Clearing existing demo data...');
    await client.query(
      'DELETE FROM monitoring_entries WHERE client_id = ANY($1)',
      [DEMO_CLIENT_UUIDS]
    );
    
    console.log(`📊 Inserting ${entries.length} monitoring entries...`);
    
    // Insert entries one by one to handle any potential conflicts
    let insertedCount = 0;
    for (const entry of entries) {
      try {
        await client.query(`
          INSERT INTO monitoring_entries (
            client_id, entry_date, mood_rating, energy_level, sleep_quality, 
            sleep_hours, exercise_minutes, social_interaction, stress_level,
            journal_entry, gratitude_note, task_notes, task_remarks
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          entry.client_id,
          entry.entry_date,
          entry.mood_rating,
          entry.energy_level,
          entry.sleep_quality,
          entry.sleep_hours,
          entry.exercise_minutes,
          entry.social_interaction,
          entry.stress_level,
          entry.journal_entry,
          entry.gratitude_note,
          entry.task_notes,
          entry.task_remarks
        ]);
        insertedCount++;
        
        if (insertedCount % 5 === 0) {
          console.log(`✅ Inserted ${insertedCount}/${entries.length} entries...`);
        }
      } catch (error) {
        console.error(`❌ Error inserting entry for date ${entry.entry_date}:`, error);
      }
    }
    
    console.log(`🎉 Successfully inserted ${insertedCount} monitoring entries!`);
    
    // Verify the data was inserted
    const result = await client.query(
      'SELECT COUNT(*) as count FROM monitoring_entries WHERE client_id = ANY($1)',
      [DEMO_CLIENT_UUIDS]
    );
    
    console.log(`✅ Verification: ${result.rows[0].count} entries now exist in database`);
    
  } catch (error) {
    console.error('❌ Error inserting monitoring data:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔐 Database connection closed');
  }
};

// Run the script
insertMonitoringData()
  .then(() => {
    console.log('🚀 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 