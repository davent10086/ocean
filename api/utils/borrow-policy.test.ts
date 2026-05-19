import { describe, expect, it } from 'vitest';
import { getBorrowBlockReason } from './borrow-policy.js';

describe('getBorrowBlockReason', () => {
  it('在库存不足时返回友好提示', () => {
    expect(getBorrowBlockReason({ stock: 0, activeBorrowCount: 1, duplicateActiveBorrow: false, limit: 5 })).toContain('库存不足');
  });

  it('在重复借阅时阻止借书', () => {
    expect(getBorrowBlockReason({ stock: 3, activeBorrowCount: 1, duplicateActiveBorrow: true, limit: 5 })).toContain('已借阅过');
  });

  it('在规则满足时允许借书', () => {
    expect(getBorrowBlockReason({ stock: 3, activeBorrowCount: 1, duplicateActiveBorrow: false, limit: 5 })).toBeNull();
  });
});
