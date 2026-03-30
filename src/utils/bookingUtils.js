export const sClass = (status) => {
  if (!status) return 'conf';
  const s = status.toLowerCase();
  if (s.includes('check'))   return 'chk';
  if (s.includes('cancel'))  return 'can';
  if (s.includes('complet')) return 'comp';
  if (s.includes('no-show') || s.includes('no show')) return 'can';
  return 'conf';
};

export const initials = (name) =>
  (name || '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

/**
 * Flatten the API booking list into individual calendar entries.
 * Each booking_item row becomes one calendar block.
 *
 * @param {Array}  apiBookings  - raw bookings from GET /bookings/outlet/booking/list
 * @param {Array}  therapists   - loaded therapists (for gender lookup)
 * @returns {Array}             - flat array of calendar-entry objects
 */
export function normalizeApiBookings(apiBookings = [], therapists = []) {
  const thMap = {};
  therapists.forEach((t) => { thMap[t.id] = t; });

  const entries = [];

  apiBookings.forEach((booking) => {
    if (!booking.booking_item) return;

    Object.entries(booking.booking_item).forEach(([customerKey, items]) => {
      if (!Array.isArray(items)) return;

      items.forEach((item) => {
        const th     = thMap[item.therapist_id];
        const gender = th?.gender ?? (item.therapist_gender || 'female');

        // Normalise start/end: API sends "HH:MM:SS", calendar wants "HH:MM"
        const start = (item.start_time || '00:00').substring(0, 5);
        const end   = (item.end_time   || '00:00').substring(0, 5);

        entries.push({
          // Calendar identity
          id:         item.id,           // booking_item id (unique per row)
          booking_id: booking.id,        // parent booking id (needed for CRUD)

          // Status + meta (from parent booking)
          status:     booking.status,
          source:     booking.source     || '',
          note:       booking.note       || '',
          membership: booking.membership || 0,
          booked_on:  booking.booking_created_at || '',
          booked_by:  booking.created_by_name    || '',
          updated_on: '',
          updated_by: booking.updated_by_name    || '',

          // Customer (from parent booking – more reliable than item.customer_name)
          customer_name:  booking.customer_name  || customerKey || '',
          customer_phone: booking.mobile_number  || '',
          customer_id:    booking.user_id,

          // Therapist
          therapist_id:     item.therapist_id,
          therapist_name:   item.therapist || th?.name || '',
          therapist_gender: gender,

          // Service
          service_name: item.service    || '',
          service_id:   item.service_id || null,
          duration:     item.duration   || 60,
          start_time:   start,
          end_time:     end,

          // Room
          room:    item.room_items?.[0]?.room_name || '',
          room_id: item.room_items?.[0]?.room_id   || null,
          room_items: item.room_items || [],

          // Flags
          is_requested_therapist: !!item.requested_person,
          is_requested_room:      !!item.requested_room,

          // Commission (display only)
          price: item.nonMemberCommission || item.memberCommissionAfter6 || '0.00',

          // Keep raw item for edit payloads
          _raw_item: item,
        });
      });
    });
  });
console.log("entries",entries);

  return entries;
}
