'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('isAuthenticated') === 'true';
    } catch {
      return false;
    }
  });
  
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated, router]);

  

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    { title: 'إجمالي الإعلانات', value: '1,234', icon: '📢', trend: '+12%', color: 'blue' },
    { title: 'الإعلانات النشطة', value: '856', icon: '✅', trend: '+8%', color: 'green' },
    { title: 'الاعلانات المعلقة ', value: '94', icon: '🔍', trend: '-3%', color: 'orange' },
    { title: ' الاعلانات المرفوضة', value: '42', icon: '👥', trend: '+5%', color: 'red' },
  ];

  const quickActions = [
    { title: 'مراجعة الإعلانات', icon: '🔍', color: 'teal' },
    { title: 'إضافة قسم جديد', icon: '➕', color: 'violet' },
    { title: 'إدارة المستخدمين', icon: '👤', color: 'indigo' },
    { title: 'إرسال إشعار', icon: '📣', color: 'pink' },
  ];

  const recentActivities = [
    { action: 'تمت الموافقة على إعلان سيارة هيونداي', time: 'منذ 2 ساعة', type: 'approve' },
    { action: 'تم رفض إعلان هاتف مستعمل لعدم وضوح الصور', time: 'منذ 4 ساعات', type: 'reject' },
    { action: 'قام أحمد محمد بتسجيل حساب جديد', time: 'منذ يوم', type: 'user' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1 className="hero-title">مرحباً بك في لوحة التحكم</h1>
          <p className="hero-subtitle">إدارة شاملة وفعّالة لجميع إعلاناتك</p>
        </div>
        <div className="hero-time">
          <div className="hero-clock">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
          <div className="hero-date">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <span className={`stat-trend ${stat.trend.startsWith('+') ? 'positive' : 'negative'}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions-section">
        <h2 className="section-title">الإجراءات السريعة</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className={`quick-action-card action-${action.color}`}>
              <div className="action-icon">{action.icon}</div>
              <h3 className="action-title">{action.title}</h3>
              <button className="action-button" onClick={() => router.push('/dashboard/ads')}>انتقال<span className="arrow">←</span></button>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-activities-section">
        <h2 className="section-title">النشاطات الأخيرة</h2>
        <div className="activities-list">
          {recentActivities.map((activity, index) => (
            <div key={index} className={`activity-item activity-${activity.type}`}>
              <div className="activity-indicator"></div>
              <div className="activity-content">
                <p className="activity-action">{activity.action}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}