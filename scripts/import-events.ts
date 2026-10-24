import fs from 'fs';
import path from 'path';
import { getDiscoveryRepository } from '../src/repository';
import { EventDataImporter } from '../src/import/importer';

async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0] || path.join(__dirname, '../src/data/seed-events.json');

  console.log(`📥 Importing events from: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  let rawItems: unknown[];
  try {
    rawItems = JSON.parse(fileContent);
  } catch (err) {
    console.error('❌ Failed to parse JSON file:', err);
    process.exit(1);
  }

  if (!Array.isArray(rawItems)) {
    console.error('❌ JSON content must be an array of event objects');
    process.exit(1);
  }

  const repo = getDiscoveryRepository();
  const importer = new EventDataImporter(repo);

  const result = await importer.importFromJson(rawItems, {
    overwriteDuplicates: args.includes('--overwrite'),
  });

  console.log('\n📊 Import Results:');
  console.log(`   Total items processed: ${result.totalProcessed}`);
  console.log(`   Successfully inserted: ${result.inserted}`);
  console.log(`   Updated existing:     ${result.updated}`);
  console.log(`   Skipped duplicates:   ${result.skippedDuplicates}`);
  console.log(`   Rejected errors:      ${result.rejectedValidationErrors.length}`);

  if (result.rejectedValidationErrors.length > 0) {
    console.log('\n⚠️ Validation Errors:');
    for (const err of result.rejectedValidationErrors) {
      console.log(`   - Item #${err.itemIndex} ("${err.title}"): ${err.errors.join('; ')}`);
    }
  }
}

main().catch((err) => {
  console.error('❌ Import execution error:', err);
  process.exit(1);
});
