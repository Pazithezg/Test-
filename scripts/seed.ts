import { getDiscoveryRepository } from '../src/repository';
import placesData from '../src/data/seed-places.json';
import eventsData from '../src/data/seed-events.json';
import { Place, EventItem } from '../src/domain/models';

async function seed() {
  console.log('🌱 Starting Bangkok discovery system data seed...');
  const repo = getDiscoveryRepository();

  const areas = await repo.getAreas();
  console.log(`📍 Verified Bangkok test areas: ${areas.length}`);
  for (const a of areas) {
    console.log(`   - [${a.id}] ${a.nameTh} (${a.nameEn}) - lat: ${a.latitude}, lng: ${a.longitude}`);
  }

  let placeCount = 0;
  for (const rawPlace of placesData) {
    const place = rawPlace as unknown as Place;
    await repo.insertPlace(place);
    placeCount++;
  }
  console.log(`🏛️ Seeded ${placeCount} places in Bangkok.`);

  let eventCount = 0;
  for (const rawEvent of eventsData) {
    const event = rawEvent as unknown as EventItem;
    await repo.insertEvent(event);
    eventCount++;
  }
  console.log(`🎉 Seeded ${eventCount} events (including verified events and controlled test fixtures).`);

  const health = await repo.checkHealth();
  console.log('\n✅ Seed completed successfully:');
  console.log(`   Database connected: ${health.databaseConnected}`);
  console.log(`   Total places: ${health.totalPlaces}`);
  console.log(`   Total events: ${health.totalEvents}`);
  console.log(`   Storage mode: ${health.isFallbackStore ? 'Local resilient store' : 'Supabase PostgreSQL'}`);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
