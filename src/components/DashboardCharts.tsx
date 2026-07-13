import { Card, Empty, Typography } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import type { DashboardCharts } from '../../shared/types';

interface DashboardChartsProps {
  charts: DashboardCharts;
}

const COLORS = {
  borrows: '#3B82F6',
  returns: '#10B981',
};

export function DashboardCharts({ charts }: DashboardChartsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
      <Card className="ocean-card" variant="borderless">
        <Typography.Title level={4}>月度借阅趋势</Typography.Title>
        {charts.monthlyBorrows.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.monthlyBorrows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="count" fill={COLORS.borrows} radius={[4, 4, 0, 0]} name="借阅量" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="ocean-card" variant="borderless">
        <Typography.Title level={4}>近7天借还动态</Typography.Title>
        {charts.weeklyActivity.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={charts.weeklyActivity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="borrows"
                stroke={COLORS.borrows}
                name="借出"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="returns"
                stroke={COLORS.returns}
                name="归还"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}