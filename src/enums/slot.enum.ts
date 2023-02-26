enum STATUS {
    ACTIVE = 'ACTIVE',
    DELETED = 'DELETED'
}

enum SHIFT_TIME {
    EARLY_MORNING_START_TIME =  '07:00:00',
    EARLY_MORNING_END_TIME =  '10:00:00',
    MORNING_START_TIME =  '10:00:00',
    MORNING_END_TIME =  '12:00:00',
    AFTERNOON_START_TIME =  '13:00:00',
    AFTERNOON_END_TIME =  '17:00:00',
    EVENING_START_TIME =  '17:00:00',
    EVENING_END_TIME =  '24:00:00',
    NIGHT_START_TIME =  '00:00:00',
    NIGHT_END_TIME =  '07:00:00',
}
enum SHIFT {
    EARLY_MORNING = "EARLY_MORNING",
    MORNING = "MORNING",
    AFTERNOON = "AFTERNOON",
    EVENING = "EVENING",
    NIGHT = "NIGHT",
}
export {
    STATUS,
    SHIFT_TIME,
    SHIFT
}