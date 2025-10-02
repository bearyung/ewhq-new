import api from './api';
import type { ButtonStyle, CreateButtonStyle, UpdateButtonStyle } from '../types/buttonStyle';

class ButtonStyleService {
  async getButtonStyles(brandId: number): Promise<ButtonStyle[]> {
    const response = await api.get(`/button-styles/brand/${brandId}`);
    return response.data;
  }

  async getButtonStyle(brandId: number, buttonStyleId: number): Promise<ButtonStyle> {
    const response = await api.get(`/button-styles/brand/${brandId}/${buttonStyleId}`);
    return response.data;
  }

  async createButtonStyle(brandId: number, buttonStyle: CreateButtonStyle): Promise<ButtonStyle> {
    const response = await api.post(`/button-styles/brand/${brandId}`, buttonStyle);
    return response.data;
  }

  async updateButtonStyle(
    brandId: number,
    buttonStyleId: number,
    buttonStyle: UpdateButtonStyle
  ): Promise<void> {
    await api.put(`/button-styles/brand/${brandId}/${buttonStyleId}`, buttonStyle);
  }

  async deleteButtonStyle(brandId: number, buttonStyleId: number): Promise<void> {
    await api.delete(`/button-styles/brand/${brandId}/${buttonStyleId}`);
  }
}

export default new ButtonStyleService();