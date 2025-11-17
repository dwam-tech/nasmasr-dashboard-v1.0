"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function IntroPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
      <div style={{ maxWidth: 720, textAlign: 'center' }}>
        <Image src="/nas-masr.png" alt="ناس مصر" width={140} height={140} style={{ marginBottom: 15 }} />
        <h1 style={{ fontSize: 32, margin: '12px 0', color: '#333' }}>أهلاً بك في نظام إدارة ناس مصر</h1>
        <p style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
          هذه صفحة تعريفية بسيطة. يمكنك تسجيل الدخول للوصول إلى لوحة التحكم الخاصة بالمشرفين.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/auth/login" className="modern-submit-btn">
            <span className="btn-content">لوحة التحكم</span>
            <div className="btn-shine"></div>
          </Link>
          {/* <Link href="/dashboard" className="modern-submit-btn" style={{ background: '#444' }}>
            <span className="btn-content">لوحة التحكم</span>
            <div className="btn-shine"></div>
          </Link> */}
        </div>
      </div>
    </div>
  );
}