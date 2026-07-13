export interface BorrowPolicyInput {
  stock: number;
  activeBorrowCount: number;
  duplicateActiveBorrow: boolean;
  limit: number;
}

export const getBorrowBlockReason = ({
  stock,
  activeBorrowCount,
  duplicateActiveBorrow,
  limit,
}: BorrowPolicyInput) => {
  if (stock <= 0) {
    return '当前图书库存不足，暂时无法借阅。';
  }

  if (duplicateActiveBorrow) {
    return '你已借阅过这本书，请先归还后再借。';
  }

  if (activeBorrowCount >= limit) {
    return `当前最多可同时借阅 ${limit} 本图书，请先归还部分图书。`;
  }

  return null;
};

export const calculateDueDate = (days: number) => {
  // 使用基于时间戳的计算，避免本地时区导致的日期偏移问题
  const now = new Date();
  const due = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return due;
};
