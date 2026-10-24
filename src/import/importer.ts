import { EventItem, VerificationStatus } from '../domain/models';
import { EventImportItemSchema } from '../domain/schemas';
import { DiscoveryRepository } from '../repository/interface';

export interface ImportResult {
  totalProcessed: number;
  inserted: number;
  updated: number;
  skippedDuplicates: number;
  rejectedValidationErrors: Array<{ itemIndex: number; title?: string; errors: string[] }>;
}

export class EventDataImporter {
  constructor(private repository: DiscoveryRepository) {}

  async importFromJson(
    rawItems: unknown[],
    options: { overwriteDuplicates?: boolean } = {}
  ): Promise<ImportResult> {
    const result: ImportResult = {
      totalProcessed: rawItems.length,
      inserted: 0,
      updated: 0,
      skippedDuplicates: 0,
      rejectedValidationErrors: [],
    };

    for (let i = 0; i < rawItems.length; i++) {
      const raw = rawItems[i];
      const validation = EventImportItemSchema.safeParse(raw);

      if (!validation.success) {
        result.rejectedValidationErrors.push({
          itemIndex: i,
          title: (raw as any)?.title || 'Unknown',
          errors: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        });
        continue;
      }

      const item = validation.data;

      // Duplicate check
      const duplicates = await this.repository.findDuplicateEvents(
        item.title,
        item.venueName,
        item.startDatetime,
        item.sourceUrl
      );

      const nowIso = new Date().toISOString();
      const eventToSave: EventItem = {
        id: item.id || `event-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        title: item.title,
        titleTh: item.titleTh,
        description: item.description,
        descriptionTh: item.descriptionTh,
        placeId: item.placeId || null,
        venueName: item.venueName,
        address: item.address,
        addressTh: item.addressTh,
        areaId: item.areaId,
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,
        categories: item.categories,
        tags: item.tags,
        startDatetime: item.startDatetime,
        endDatetime: item.endDatetime,
        minPrice: item.minPrice ?? null,
        maxPrice: item.maxPrice ?? null,
        isFree: item.isFree,
        currency: item.currency,
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        lastCheckedAt: nowIso,
        verificationStatus: item.verificationStatus as VerificationStatus,
        publicationStatus: item.publicationStatus as any,
        eventStatus: item.eventStatus as any,
        isDemoFixture: item.isDemoFixture,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (duplicates.length > 0) {
        if (options.overwriteDuplicates) {
          eventToSave.id = duplicates[0].id;
          await this.repository.insertEvent(eventToSave);
          result.updated++;
        } else {
          result.skippedDuplicates++;
        }
      } else {
        await this.repository.insertEvent(eventToSave);
        result.inserted++;
      }
    }

    return result;
  }
}
