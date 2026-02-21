/**
 * Maps raw database parameter_name values to human-readable display labels.
 * Covers PostgreSQL snake_case names and MongoDB legacy names.
 *
 * Usage:
 *   import { formatParam } from '../utils/parameterLabels';
 *   formatParam('thickness_um')  // → "Thickness (μm)"
 *   formatParam('cd_measurement') // → "CD Measurement"
 */

export const PARAMETER_LABELS = {
  // ── Dimensional / Critical Dimension ──────────────────────────
  thickness_um:        'Thickness (μm)',
  thickness:           'Thickness',
  cd_measurement:      'CD Measurement',
  cd_top:              'CD Top',
  cd_bottom:           'CD Bottom',
  cd_middle:           'CD Middle',
  critical_dimension:  'Critical Dimension',
  linewidth:           'Line Width',
  sidewall_angle:      'Sidewall Angle',
  etch_depth:          'Etch Depth',

  // ── Process Parameters ─────────────────────────────────────────
  temperature:         'Temperature',
  temperature_control: 'Temperature Control',
  pressure:            'Pressure',
  pressure_system:     'Pressure System',
  feed_rate:           'Feed Rate',
  material_feed:       'Material Feed',
  coolant_flow:        'Coolant Flow',
  flow_rate:           'Flow Rate',
  humidity:            'Humidity',
  humidity_level:      'Humidity Level',

  // ── Electrical ─────────────────────────────────────────────────
  voltage:             'Voltage',
  current:             'Current',
  resistance:          'Resistance',
  power:               'Power',

  // ── Surface / Optical ─────────────────────────────────────────
  roughness_nm:        'Roughness (nm)',
  roughness:           'Roughness',
  reflectivity:        'Reflectivity',
  overlay:             'Overlay',
  focus:               'Focus',
  dose:                'Dose',

  // ── Legacy MongoDB names (already human-readable) ─────────────
  "Temperature Control": 'Temperature Control',
  "Pressure System":     'Pressure System',
  "CD's":                "CD's",
  "Coolant Flow":        'Coolant Flow',
  "Humidity Level":      'Humidity Level',
  "Material Feed":       'Material Feed',
};

/**
 * Returns the human-readable label for a parameter name.
 * Falls back to converting snake_case → Title Case for unknown names.
 *
 * @param {string} name - Raw parameter name from the database
 * @returns {string} Display label
 */
export function formatParam(name) {
  if (!name) return '—';
  if (PARAMETER_LABELS[name]) return PARAMETER_LABELS[name];

  // Smart fallback: snake_case / camelCase → Title Case
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
