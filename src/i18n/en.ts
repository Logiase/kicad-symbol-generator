/** English dictionary. This is the source of truth for translation keys. */
export const en = {
  'app.title': 'KiCAD Symbol Generator',
  'app.subtitle': 'Design multi-unit symbols, bulk-edit pins, export .kicad_sym',
  'lang.toggle': '中文',

  // Symbol properties
  'props.title': 'Symbol Properties',
  'props.name': 'Name',
  'props.reference': 'Reference',
  'props.value': 'Value',
  'props.footprint': 'Footprint',
  'props.datasheet': 'Datasheet',
  'props.description': 'Description',
  'props.showPinNames': 'Show pin names',
  'props.showPinNumbers': 'Show pin numbers',

  // Units
  'units.title': 'Units',
  'units.add': 'Add unit',
  'units.remove': 'Remove unit',
  'units.unit': 'Unit {n}',
  'units.rename': 'Rename',
  'units.namePlaceholder': 'Unit name',
  'units.confirmRemove': 'Remove this unit and all its pins?',

  // Pin table
  'pins.title': 'Pins',
  'pins.col.select': 'Sel',
  'pins.col.number': 'Number',
  'pins.col.name': 'Name',
  'pins.col.type': 'Type',
  'pins.col.side': 'Side',
  'pins.col.style': 'Style',
  'pins.col.hidden': 'Hidden',
  'pins.col.length': 'Length',
  'pins.col.actions': 'Actions',
  'pins.add': 'Add pin',
  'pins.delete': 'Delete',
  'pins.empty': 'No pins yet. Add one or use bulk add.',
  'pins.selectAll': 'Select all',
  'pins.selectedCount': '{n} selected',

  // Bulk add
  'bulkAdd.title': 'Bulk Add Pins',
  'bulkAdd.namePattern': 'Name pattern',
  'bulkAdd.numberPattern': 'Number pattern',
  'bulkAdd.namePlaceholder': 'e.g. PIN_[0..63] or PORT[0..31]_IN',
  'bulkAdd.numberPlaceholder': 'e.g. [1..64] (optional)',
  'bulkAdd.side': 'Side',
  'bulkAdd.type': 'Type',
  'bulkAdd.style': 'Style',
  'bulkAdd.preview': 'Preview',
  'bulkAdd.previewCount': '{n} pins',
  'bulkAdd.add': 'Add pins',
  'bulkAdd.autoNumber': 'auto',

  // Bulk operations
  'bulk.title': 'Bulk Edit Selected',
  'bulk.none': 'Select pins to edit them in bulk.',
  'bulk.setSide': 'Set side',
  'bulk.setType': 'Set type',
  'bulk.setStyle': 'Set style',
  'bulk.show': 'Show',
  'bulk.hide': 'Hide',
  'bulk.delete': 'Delete selected',
  'bulk.apply': 'Apply',
  'bulk.renameTitle': 'Rename selected by pattern',
  'bulk.renamePlaceholder': 'e.g. GPIO[0..]',
  'bulk.rename': 'Rename',

  // Layout
  'layout.title': 'Layout',
  'layout.direction': 'Walk direction',
  'layout.spacing': 'Pin spacing (mil)',
  'layout.arrangement': 'Arrangement per side',

  // Arrangement options
  'arrangement.order': 'List order',
  'arrangement.number_asc': 'Number ascending',
  'arrangement.number_desc': 'Number descending',
  'arrangement.name_asc': 'Name A-Z',
  'arrangement.name_desc': 'Name Z-A',

  // Direction options
  'direction.default': 'Default',
  'direction.clockwise': 'Clockwise',
  'direction.counter_clockwise': 'Counter-clockwise',

  // Sides
  'side.left': 'Left',
  'side.right': 'Right',
  'side.top': 'Top',
  'side.bottom': 'Bottom',

  // Electrical types
  'type.input': 'Input',
  'type.output': 'Output',
  'type.bidirectional': 'Bidirectional',
  'type.tri_state': 'Tri-state',
  'type.passive': 'Passive',
  'type.free': 'Free',
  'type.unspecified': 'Unspecified',
  'type.power_in': 'Power in',
  'type.power_out': 'Power out',
  'type.open_collector': 'Open collector',
  'type.open_emitter': 'Open emitter',
  'type.no_connect': 'No connect',

  // Graphic styles
  'style.line': 'Line',
  'style.inverted': 'Inverted',
  'style.clock': 'Clock',
  'style.inverted_clock': 'Inverted clock',
  'style.input_low': 'Input low',
  'style.clock_low': 'Clock low',
  'style.output_low': 'Output low',
  'style.edge_clock_high': 'Edge clock high',
  'style.non_logic': 'Non-logic',

  // Preview
  'preview.svg': 'SVG Preview',
  'preview.kicad': '.kicad_sym',
  'preview.unit': 'Unit',
  'preview.copy': 'Copy',
  'preview.copied': 'Copied!',
  'preview.download': 'Download .kicad_sym',
  'preview.downloadSvg': 'Download SVG',
  'preview.version': 'KiCAD version',
  'preview.zoomFit': 'Fit',

  // CSV
  'csv.export': 'Export CSV',
  'csv.import': 'Import CSV',
  'csv.error.noHeader': 'Could not find a header row (needs Pin and Name columns).',
  'csv.error.empty': 'The CSV file is empty.',
  'csv.imported': 'Imported {n} pins.',

  // Expand errors
  'expand.error.rangeLengthMismatch':
    'Ranges in the pattern must all have the same length.',
  'expand.error.empty': 'Pattern is empty.',

  // Misc
  'common.reset': 'Reset',
  'common.confirmReset': 'Reset everything to a blank symbol?',
}

export type TranslationKey = keyof typeof en
