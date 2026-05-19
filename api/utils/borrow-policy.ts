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
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
};
