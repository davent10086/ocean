import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';

interface StatisticCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  suffix?: string;
}

export function StatisticCard({ title, value, icon, suffix }: StatisticCardProps) {
  return (
    <Card className="ocean-card stat-card" variant="borderless">
      <Statistic title={title} value={value} prefix={icon} suffix={suffix} />
    </Card>
  );
}
