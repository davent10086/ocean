import { describe, expect, it } from 'vitest';
import { getMenuItemsByRole } from './menu';

describe('getMenuItemsByRole', () => {
  it('管理员可以看到用户管理菜单', () => {
    const items = getMenuItemsByRole('ADMIN');
    expect(items.some((item) => item?.key === '/users')).toBe(true);
  });

  it('成员不会看到用户管理菜单', () => {
    const items = getMenuItemsByRole('MEMBER');
    expect(items.some((item) => item?.key === '/users')).toBe(false);
  });
});
