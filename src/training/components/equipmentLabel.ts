import type { EquipmentTag } from '../types';

export function equipmentLabel(equipment: EquipmentTag): string {
  return equipment === 'kettlebell' ? 'Kettlebell' : 'Klimmzugstange';
}
