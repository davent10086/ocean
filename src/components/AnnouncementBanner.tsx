import { BellOutlined, PushpinOutlined } from '@ant-design/icons';
import { Card, Empty, List, Spin, Tag, Typography } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { announcementsApi } from '../services/api';
import type { AnnouncementItem } from '../types/app';

export function AnnouncementBanner() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementsApi
      .latest()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Spin className="page-spin" />;
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="ocean-card" variant="borderless" style={{ borderRadius: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BellOutlined style={{ fontSize: 18, color: 'var(--color-primary)' }} />
            <Typography.Title level={4} style={{ margin: 0 }}>公告栏</Typography.Title>
          </div>
          <Empty description="暂无公告" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="ocean-card" variant="borderless" style={{ borderRadius: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <BellOutlined style={{ fontSize: 18, color: 'var(--color-primary)' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>公告栏</Typography.Title>
        </div>
        <List
          dataSource={items}
          renderItem={(item) => (
            <List.Item style={{ borderBlockEnd: item === items[items.length - 1] ? 'none' : undefined }}>
              <List.Item.Meta
                title={
                  <InlineFlex>
                    {item.pinned && <Tag icon={<PushpinOutlined />} color="blue">置顶</Tag>}
                    <Typography.Text strong>{item.title}</Typography.Text>
                  </InlineFlex>
                }
                description={
                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2, expandable: 'collapsible' }}
                    style={{ margin: 0 }}
                  >
                    {item.content}
                  </Typography.Paragraph>
                }
              />
              <Typography.Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                {dayjs(item.createdAt).format('MM-DD HH:mm')}
              </Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </motion.div>
  );
}

function InlineFlex({ children }: { children: React.ReactNode }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{children}</span>;
}
