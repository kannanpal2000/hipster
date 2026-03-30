import THERAPISTS from './therapists';
import { calcEnd } from '../utils/timeUtils';

let nextId = 100;
export const getNextId = () => ++nextId;

function mkBk(id, thId, start, dur, svc, cName, cPhone, status = 'Confirmed', note = '', src = 'Walk-in') {
  const th = THERAPISTS.find((t) => t.id === thId) || THERAPISTS[0];
  return {
    id,
    status,
    therapist_id:     thId,
    therapist_name:   th.name,
    therapist_gender: th.gender,
    service_name:     svc,
    duration:         dur,
    start_time:       start,
    end_time:         calcEnd(start, dur),
    customer_name:    cName,
    customer_phone:   cPhone,
    customer_id:      980,
    room:             ['806 Couples Room', 'Room A', 'Room B'][id % 3],
    is_requested_therapist: id % 3 === 0,
    is_requested_room:      id % 4 === 0,
    note,
    source:    src,
    booked_on: '2024-05-22T17:34:00',
    booked_by: cName,
    updated_on:'2024-06-13T17:34:00',
    updated_by:'Sandy (HQ)',
    items:  [],
    price: '77.00',
  };
}

const INIT_BOOKINGS = [
  mkBk(1,  1,  '09:00', 90, '90 Min Tui Na / Acupressure',         'Victoria Baker', '92214868'),
  mkBk(2,  1,  '11:00', 90, '90 Min Tui Na / Acupressure',         'Victoria Baker', '92214868'),
  mkBk(3,  1,  '13:00', 60, '60 Min Slimming Massage',             'Yashika Yeo',    '93369589'),
  mkBk(4,  8,  '10:00', 60, '60 Min Slimming Massage',             'Yashika Yeo',    '93369589'),
  mkBk(5,  8,  '12:00', 60, '60 Min Tui Na for Kids',              'Gerald Tan',     '93369589'),
  mkBk(6,  8,  '13:45', 90, '90 Min Tui Na / Acupressure',         'Victoria Baker', '92214868'),
  mkBk(7,  2,  '11:00', 60, '60 Min Tui Na for Kids',              'Gerald Tan',     '93369589'),
  mkBk(8,  3,  '10:00', 90, '90 Min Swedish / Relaxing Massage',   'Ethan Tan',      '93369589'),
  mkBk(9,  5,  '11:00', 60, '60 Min Slimming Massage',             'Yashika Yeo',    '93369589', 'Check-in (In Progress)'),
  mkBk(10, 5,  '14:00', 90, '90 Min Tui Na / Acupressure',         'Victoria Baker', '92214868'),
  mkBk(11, 5,  '09:30', 60, '60 Min Body Therapy',                 'Victoria Baker', '92214868'),
  mkBk(12, 14, '12:00', 60, '60 Min Tui Na for Kids',              'Gerald Tan',     '93369589'),
  mkBk(13, 3,  '09:30', 120,'120 Min Body Therapy',                'Victoria Baker', '92214868',
    'Confirmed',
    'I have an allergy to eucalyptus, lavender, and citrus oils. Please avoid using them in my body massage.',
    'By Phone'
  ),
];

export default INIT_BOOKINGS;
