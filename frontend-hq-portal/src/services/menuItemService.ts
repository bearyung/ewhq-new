import api from './api';
import type {
  MenuItemListQuery,
  MenuItemListResponse,
  MenuItemDetail,
  MenuItemUpsertPayload,
  MenuItemLookups,
} from '../types/menuItem';

const buildQueryString = (query: MenuItemListQuery): string => {
  const params = new URLSearchParams();

  if (query.categoryId) params.set('categoryId', String(query.categoryId));
  if (query.search) params.set('search', query.search);
  if (query.includeDisabled) params.set('includeDisabled', 'true');
  if (query.hasModifier !== undefined) params.set('hasModifier', query.hasModifier ? 'true' : 'false');
  if (query.isPromoItem !== undefined) params.set('isPromoItem', query.isPromoItem ? 'true' : 'false');
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortDirection) params.set('sortDirection', query.sortDirection);
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

class MenuItemService {
  async getMenuItems(brandId: number, query: MenuItemListQuery): Promise<MenuItemListResponse> {
    const response = await api.get(`/menu-items/brand/${brandId}${buildQueryString(query)}`);
    return response.data;
  }

  async getMenuItem(brandId: number, itemId: number): Promise<MenuItemDetail> {
    const response = await api.get(`/menu-items/brand/${brandId}/${itemId}`);
    return response.data;
  }

  async getLookups(brandId: number): Promise<MenuItemLookups> {
    const response = await api.get(`/menu-items/brand/${brandId}/lookups`);
    return response.data;
  }

  async createMenuItem(brandId: number, payload: MenuItemUpsertPayload): Promise<MenuItemDetail> {
    const response = await api.post(`/menu-items/brand/${brandId}`, payload);
    return response.data;
  }

  async updateMenuItem(brandId: number, itemId: number, payload: MenuItemUpsertPayload): Promise<void> {
    await api.put(`/menu-items/brand/${brandId}/${itemId}`, payload);
  }
}

export default new MenuItemService();
