// Scale fotografiche da SPEC §6 — esattamente queste, non inventarne altre.

export const SHUTTER_SPEEDS = [
  'B', '1', '1/2', '1/4', '1/8', '1/15', '1/30',
  '1/60', '1/125', '1/250', '1/500', '1/1000',
]

export const APERTURES = [
  'f/1.8', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16', 'f/22',
]

export const MODES = ['AE', 'Manuale']

export const TAGS = ['keeper', 'errore', 'esperimento']

export const ROLL_STATUSES = [
  'in_corso', 'da_sviluppare', 'sviluppato', 'scansionato', 'archiviato',
]

// Default attrezzatura (SPEC §2, §5).
export const DEFAULT_CAMERA = 'Canon AE-1'
export const DEFAULT_LENS = 'FD 50mm f/1.8'
