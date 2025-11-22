"use client";

import { useState } from "react";

const initialRules = {
  sideAdsPerUser: 3,
  maxFreeAdValue: 1000,
  maxFreeAdsCount: 5,
  homepageAdvertisersCount: 10,
  homepageAdsPerAdvertiser: 2,
  autoApprovalThreshold: 500,
  featuredPackagePrice: 0,
  standardPackagePrice: 0,
};

export default function DisplayRules() {
  const [rules, setRules] = useState(initialRules);
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const CATEGORY_LABELS_AR: Record<string, string> = {
    real_estate: 'عقارات',
    cars: 'سيارات',
    cars_rent: 'تأجير سيارات',
    'spare-parts': 'قطع غيار',
    stores: 'محلات',
    restaurants: 'مطاعم',
    groceries: 'بقالة',
    'food-products': 'منتجات غذائية',
    electronics: 'إلكترونيات',
    'home-tools': 'أدوات منزلية',
    furniture: 'أثاث',
    doctors: 'أطباء',
    health: 'الصحة',
    teachers: 'معلمون',
    education: 'تعليم',
    jobs: 'وظائف',
    shipping: 'شحن',
    'mens-clothes': 'ملابس رجالي',
    'watches-jewelry': 'ساعات ومجوهرات',
    'free-professions': 'مهن حرة',
    'kids-toys': 'ألعاب أطفال',
    gym: 'رياضة',
    construction: 'مقاولات',
    maintenance: 'صيانة',
    'car-services': 'خدمات سيارات',
    'home-services': 'خدمات منزلية',
    'lighting-decor': 'إضاءة وديكور',
    animals: 'حيوانات',
    'farm-products': 'منتجات زراعية',
    wholesale: 'جملة',
    'production-lines': 'خطوط إنتاج',
    'light-vehicles': 'مركبات خفيفة',
    'heavy-transport': 'نقل ثقيل',
    tools: 'أدوات',
    'home-appliances': 'أجهزة منزلية',
    missing: 'مفقودات',
  };

  type CategoryRule = { freeAdsCount: number; durationDays: number; autoApprovalValue: number };
  const initialCategoryRules: Record<string, CategoryRule> = Object.keys(CATEGORY_LABELS_AR).reduce((acc, slug) => {
    acc[slug] = {
      freeAdsCount: initialRules.maxFreeAdsCount,
      durationDays: 0,
      autoApprovalValue: initialRules.autoApprovalThreshold,
    };
    return acc;
  }, {} as Record<string, CategoryRule>);

  const [categoryRules, setCategoryRules] = useState<Record<string, CategoryRule>>(initialCategoryRules);

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving rules:", rules);
    console.log("Saving category rules:", categoryRules);
    setIsEditing(false);
    setSavedMessage("تم حفظ القواعد بنجاح ✅");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleReset = () => {
    setRules(initialRules);
    setIsEditing(false);
    setCategoryRules(initialCategoryRules);
  };

  return (
    <div className="rules-container">
      {/* New Enhanced Header */}
      <div className="display-rules-banner">
        <div className="banner-wrapper">
          <div className="banner-info-section">
            <div className="banner-icon-container">
              <div className="banner-gear-icon">⚙️</div>
            </div>
            <div className="banner-text-content">
              <h1>إدارة الباقات</h1>
              <p>إدارة وتخصيص قواعد عرض الإعلانات في النظام</p>
            </div>
          </div>
          
          <div className="banner-controls-section">
            {savedMessage && (
              <div className="success-notification">{savedMessage}</div>
            )}
            <div className="banner-button-group">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="rules-action-btn btn-save-changes">
                    <span>💾</span>
                    حفظ التغييرات
                  </button>
                  <button onClick={handleReset} className="rules-action-btn btn-cancel-changes">
                    <span>❌</span>
                    إلغاء
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="rules-action-btn btn-edit-rules">
                  تعديل القواعد
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="rules-grid">
        {/* Package Prices */}
        <div className="rule-card">
          <div className="card-header">
            <div className="card-icon">$</div>
            <div>
              <h3 className="card-title">سعر إعلان الباقة</h3>
              <p className="card-description">تحديد سعر إعلان الباقة لكل نوع</p>
            </div>
          </div>
          <div className="card-content">
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">
                  <span className="label-icon">⭐</span>
                  سعر الباقة المميزة:
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={rules.featuredPackagePrice}
                    onChange={(e) => setRules({...rules, featuredPackagePrice: parseInt(e.target.value) || 0})}
                    disabled={!isEditing}
                    className={`form-input ${isEditing ? 'editable' : 'readonly'}`}
                  />
                  <div className="input-suffix">ج.م</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">
                  <span className="label-icon">📝</span>
                  سعر الباقة ستاندر:
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={rules.standardPackagePrice}
                    onChange={(e) => setRules({...rules, standardPackagePrice: parseInt(e.target.value) || 0})}
                    disabled={!isEditing}
                    className={`form-input ${isEditing ? 'editable' : 'readonly'}`}
                  />
                  <div className="input-suffix">ج.م</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rule-card">
          <div className="card-header">
            <div className="card-icon">📂</div>
            <div>
              <h3 className="card-title">قواعد حسب القسم</h3>
              <p className="card-description">تحديد عدد الإعلانات المجانية، مدة الأيام، وقيمة الموافقة التلقائية لكل قسم</p>
            </div>
          </div>
          <div className="card-content">
            <div className="table-container">
              <table className="data-table category-rules-table">
                <thead>
                  <tr>
                    <th>القسم</th>
                    <th>عدد الإعلانات المجانية (في الشهر) </th>
                    {/* <th>مدة الأيام</th> */}
                    <th>قيمة الموافقة التلقائية</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(CATEGORY_LABELS_AR).map(([slug, label]) => (
                    <tr key={slug}>
                      <td>{label}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={categoryRules[slug]?.freeAdsCount ?? 0}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            setCategoryRules(prev => ({
                              ...prev,
                              [slug]: { ...prev[slug], freeAdsCount: v }
                            }));
                          }}
                          disabled={!isEditing}
                          className={`form-input ${isEditing ? 'editable' : 'readonly'}`}
                        />
                      </td>
                      {/* <td>
                        <input
                          type="number"
                          min={0}
                          value={categoryRules[slug]?.durationDays ?? 0}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            setCategoryRules(prev => ({
                              ...prev,
                              [slug]: { ...prev[slug], durationDays: v }
                            }));
                          }}
                          disabled={!isEditing}
                          className={`form-input ${isEditing ? 'editable' : 'readonly'}`}
                        />
                      </td> */}
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={categoryRules[slug]?.autoApprovalValue ?? 0}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            setCategoryRules(prev => ({
                              ...prev,
                              [slug]: { ...prev[slug], autoApprovalValue: v }
                            }));
                          }}
                          disabled={!isEditing}
                          className={`form-input ${isEditing ? 'editable' : 'readonly'}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}