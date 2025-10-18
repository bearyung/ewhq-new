import api from './api';
import type {
  ModifierGroupProperties,
  UpdateModifierGroupPropertiesPayload,
} from '../types/modifierGroup';

class ModifierGroupService {
  async getProperties(brandId: number, groupHeaderId: number): Promise<ModifierGroupProperties> {
    const response = await api.get(`/modifier-groups/brand/${brandId}/${groupHeaderId}`);
    return response.data;
  }

  async updateProperties(
    brandId: number,
    groupHeaderId: number,
    payload: UpdateModifierGroupPropertiesPayload,
  ): Promise<ModifierGroupProperties> {
    const response = await api.put(`/modifier-groups/brand/${brandId}/${groupHeaderId}`, payload);
    return response.data;
  }
}

export default new ModifierGroupService();
