import { EventItem, Place, FreeTimeWindow } from '../domain/models';

/**
 * Bangkok timezone offset in milliseconds (+07:00 = 7 * 60 * 60 * 1000 = 25,200,000 ms)
 */
export const BANGKOK_TZ_OFFSET_HOURS = 7;

/**
 * Returns current date/time in Asia/Bangkok
 */
export function getBangkokNow(): Date {
  // Use current UTC time shifted to Bangkok or system time
  return new Date();
}

/**
 * Formats a date into Bangkok YYYY-MM-DD
 */
export function formatBangkokDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Formats a date into Bangkok HH:mm
 */
export function formatBangkokTime(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(date);
}

export interface ResolvedTimeWindow {
  startMs: number;
  endMs: number;
  isAvailableNow: boolean;
  dateStr: string;
}

/**
 * Resolves a FreeTimeWindow into concrete startMs and endMs epochs.
 */
export function resolveFreeTimeWindow(
  freeTime?: FreeTimeWindow,
  dateWindow?: { from: string; to: string }
): ResolvedTimeWindow | null {
  const now = getBangkokNow();
  const todayStr = formatBangkokDate(now);

  if (freeTime?.availableNow) {
    const startMs = now.getTime();
    const durationHours = freeTime.durationHours ?? 3;
    const endMs = startMs + durationHours * 60 * 60 * 1000;
    return {
      startMs,
      endMs,
      isAvailableNow: true,
      dateStr: todayStr,
    };
  }

  const targetDate = freeTime?.date || dateWindow?.from || todayStr;
  const targetDateEnd = dateWindow?.to || targetDate;

  if (freeTime?.startTime && freeTime?.endTime) {
    const cleanStartTime = freeTime.startTime.includes('T')
      ? freeTime.startTime
      : `${targetDate}T${freeTime.startTime}:00+07:00`;
    const cleanEndTime = freeTime.endTime.includes('T')
      ? freeTime.endTime
      : `${targetDate}T${freeTime.endTime}:00+07:00`;

    const startMs = new Date(cleanStartTime).getTime();
    const endMs = new Date(cleanEndTime).getTime();

    if (!isNaN(startMs) && !isNaN(endMs) && endMs >= startMs) {
      return {
        startMs,
        endMs,
        isAvailableNow: now.getTime() >= startMs && now.getTime() <= endMs,
        dateStr: targetDate,
      };
    }
  }

  if (freeTime?.startTime && freeTime?.durationHours) {
    const cleanStartTime = freeTime.startTime.includes('T')
      ? freeTime.startTime
      : `${targetDate}T${freeTime.startTime}:00+07:00`;
    const startMs = new Date(cleanStartTime).getTime();
    const endMs = startMs + freeTime.durationHours * 60 * 60 * 1000;
    if (!isNaN(startMs)) {
      return {
        startMs,
        endMs,
        isAvailableNow: now.getTime() >= startMs && now.getTime() <= endMs,
        dateStr: targetDate,
      };
    }
  }

  if (dateWindow?.from) {
    const startMs = new Date(
      dateWindow.from.includes('T') ? dateWindow.from : `${dateWindow.from}T00:00:00+07:00`
    ).getTime();
    const endMs = new Date(
      dateWindow.to.includes('T') ? dateWindow.to : `${targetDateEnd}T23:59:59+07:00`
    ).getTime();

    if (!isNaN(startMs) && !isNaN(endMs)) {
      return {
        startMs,
        endMs,
        isAvailableNow: now.getTime() >= startMs && now.getTime() <= endMs,
        dateStr: dateWindow.from.slice(0, 10),
      };
    }
  }

  return null;
}

export interface TimeMatchEvaluation {
  isHappeningNow: boolean;
  fitsFreeTime: boolean;
  overlapMinutes: number;
  timeLabelTh: string;
  timeLabelEn: string;
}

/**
 * Evaluates whether an event matches the user's free time window and current time.
 */
export function evaluateEventTime(
  event: EventItem,
  freeWindow: ResolvedTimeWindow | null
): TimeMatchEvaluation {
  const now = getBangkokNow().getTime();
  const eventStart = new Date(event.startDatetime).getTime();
  const eventEnd = new Date(event.endDatetime).getTime();

  const isHappeningNow = now >= eventStart && now <= eventEnd;

  if (!freeWindow) {
    return {
      isHappeningNow,
      fitsFreeTime: true,
      overlapMinutes: 0,
      timeLabelTh: isHappeningNow ? 'กำลังจัดอยู่ตอนนี้' : 'ตามกำหนดการของกิจกรรม',
      timeLabelEn: isHappeningNow ? 'Happening right now' : 'Scheduled event',
    };
  }

  const overlapStart = Math.max(freeWindow.startMs, eventStart);
  const overlapEnd = Math.min(freeWindow.endMs, eventEnd);

  if (overlapEnd <= overlapStart) {
    // No overlap with user's free time
    const isPast = eventEnd < freeWindow.startMs;
    return {
      isHappeningNow,
      fitsFreeTime: false,
      overlapMinutes: 0,
      timeLabelTh: isPast ? 'หมดเวลาจัดก่อนช่วงที่คุณว่าง' : 'จัดหลังช่วงเวลาที่คุณว่าง',
      timeLabelEn: isPast ? 'Ends before your free time' : 'Starts after your free time',
    };
  }

  const overlapMinutes = Math.round((overlapEnd - overlapStart) / (1000 * 60));
  const startTimeStr = formatBangkokTime(new Date(eventStart));
  const endTimeStr = formatBangkokTime(new Date(eventEnd));

  return {
    isHappeningNow,
    fitsFreeTime: true,
    overlapMinutes,
    timeLabelTh: isHappeningNow
      ? `กำลังจัดอยู่ตอนนี้ (จัดถึง ${endTimeStr} น., ตรงกับเวลาว่าง ${overlapMinutes} นาที)`
      : `จัดเวลา ${startTimeStr} - ${endTimeStr} น. (ตรงกับเวลาว่าง ${overlapMinutes} นาที)`,
    timeLabelEn: isHappeningNow
      ? `Happening now (until ${endTimeStr}, overlaps ${overlapMinutes} mins)`
      : `Runs ${startTimeStr} - ${endTimeStr} (overlaps ${overlapMinutes} mins)`,
  };
}

/**
 * Evaluates whether a place (opening hours) matches the user's free time window and current time.
 */
export function evaluatePlaceTime(
  place: Place,
  freeWindow: ResolvedTimeWindow | null
): TimeMatchEvaluation {
  const now = getBangkokNow();
  const currentDayOfWeek = now.getDay(); // 0=Sunday, 6=Saturday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (!place.openingHours) {
    return {
      isHappeningNow: true,
      fitsFreeTime: true,
      overlapMinutes: 120,
      timeLabelTh: 'เปิดให้บริการตามปกติ',
      timeLabelEn: 'Open as normal',
    };
  }

  const { openTime, closeTime, daysOpen } = place.openingHours;
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isOpenToday = daysOpen.includes(currentDayOfWeek);
  const isOpenRightNow =
    isOpenToday && currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

  if (!freeWindow) {
    return {
      isHappeningNow: isOpenRightNow,
      fitsFreeTime: true,
      overlapMinutes: 120,
      timeLabelTh: isOpenRightNow
        ? `เปิดอยู่ตอนนี้ (ปิด ${closeTime} น.)`
        : `เปิดทำการ ${openTime} - ${closeTime} น.`,
      timeLabelEn: isOpenRightNow ? `Open now (closes at ${closeTime})` : `Open ${openTime} - ${closeTime}`,
    };
  }

  // Calculate free time in minutes of day
  const freeStartDate = new Date(freeWindow.startMs);
  const freeEndDate = new Date(freeWindow.endMs);
  const freeStartMinutes = freeStartDate.getHours() * 60 + freeStartDate.getMinutes();
  const freeEndMinutes = freeEndDate.getHours() * 60 + freeEndDate.getMinutes();

  const overlapStart = Math.max(freeStartMinutes, openMinutes);
  const overlapEnd = Math.min(freeEndMinutes, closeMinutes);

  if (overlapEnd <= overlapStart) {
    return {
      isHappeningNow: isOpenRightNow,
      fitsFreeTime: false,
      overlapMinutes: 0,
      timeLabelTh: `สถานที่ปิดในช่วงเวลาที่คุณว่าง (เวลาทำการ ${openTime} - ${closeTime} น.)`,
      timeLabelEn: `Closed during your free time (open ${openTime} - ${closeTime})`,
    };
  }

  const overlapMinutes = overlapEnd - overlapStart;
  return {
    isHappeningNow: isOpenRightNow,
    fitsFreeTime: true,
    overlapMinutes,
    timeLabelTh: isOpenRightNow
      ? `เปิดอยู่ตอนนี้ (ปิด ${closeTime} น., เข้าชมได้ ${overlapMinutes} นาที)`
      : `เปิดบริการตรงกับเวลาว่าง (${openTime} - ${closeTime} น., เข้าชมได้ ${overlapMinutes} นาที)`,
    timeLabelEn: isOpenRightNow
      ? `Open right now (closes ${closeTime}, ${overlapMinutes} mins overlap)`
      : `Open during free time (${openTime} - ${closeTime})`,
  };
}
