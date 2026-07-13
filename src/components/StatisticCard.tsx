import { Card, Statistic } from 'antd';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatisticCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  suffix?: string;
}

export function StatisticCard({ title, value, icon, suffix }: StatisticCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="ocean-card stat-card" variant="borderless">
        <Statistic title={title} value={value} prefix={icon} suffix={suffix} />
      </Card>
    </motion.div>
  );
}
