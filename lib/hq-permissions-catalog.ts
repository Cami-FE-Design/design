/**
 * HQ permission catalog (PRO-138, mock).
 *
 * Drives the "Edit permission role" form: left-rail "Permission areas" map to
 * one entry here; the right-pane sub-sections are built from `sections`. Each
 * action's `code` is a stable permission string used by `useAuth().has(code)`
 * and by the role-store mock to record which permissions a role grants.
 */

export type HqPermissionAction = {
  code: string
  label: { en: string; ar: string }
}

export type HqPermissionSection = {
  id: string
  title: { en: string; ar: string }
  actions: HqPermissionAction[]
}

export type HqPermissionArea = {
  id: string
  name: { en: string; ar: string }
  /** Plain-language summary shown next to the master toggle in the detail pane. */
  summary: { en: string; ar: string }
  /** Lucide icon name; resolved at render time so this file stays serializable. */
  icon:
    | "store"
    | "credit-card"
    | "headset"
    | "scroll"
    | "bar-chart"
    | "users"
    | "shield"
    | "settings"
  sections: HqPermissionSection[]
}

export const HQ_PERMISSION_AREAS: HqPermissionArea[] = [
  {
    id: "pet_businesses",
    name: { en: "Partners", ar: "الشركاء" },
    summary: {
      en: "Allow access to the Partner directory and decide what actions they can perform.",
      ar: "السماح بالوصول إلى دليل أعمال الحيوانات الأليفة وتحديد الإجراءات.",
    },
    icon: "store",
    sections: [
      {
        id: "directory",
        title: { en: "Directory access and actions", ar: "الوصول والإجراءات في الدليل" },
        actions: [
          {
            code: "merchants.view",
            label: { en: "Can view the Partner directory", ar: "عرض دليل الأعمال" },
          },
          {
            code: "merchants.create",
            label: { en: "Can onboard a new Partner", ar: "إضافة عمل جديد" },
          },
          {
            code: "merchants.edit",
            label: { en: "Can edit Partner details", ar: "تعديل تفاصيل العمل" },
          },
        ],
      },
      {
        id: "lifecycle",
        title: { en: "Lifecycle controls", ar: "ضوابط دورة الحياة" },
        actions: [
          {
            code: "merchants.suspend",
            label: { en: "Can suspend a Partner", ar: "تعليق عمل" },
          },
          {
            code: "merchants.delete",
            label: { en: "Can delete a Partner", ar: "حذف عمل" },
          },
        ],
      },
    ],
  },
  {
    id: "billing",
    name: { en: "Billing", ar: "الفوترة" },
    summary: {
      en: "Allow access to subscriptions, invoices, and refunds across Partners.",
      ar: "الوصول إلى الاشتراكات والفواتير والاستردادات.",
    },
    icon: "credit-card",
    sections: [
      {
        id: "billing_view",
        title: { en: "Billing access", ar: "الوصول إلى الفوترة" },
        actions: [
          {
            code: "billing.read",
            label: { en: "Can view billing data", ar: "عرض بيانات الفوترة" },
          },
        ],
      },
      {
        id: "billing_edit",
        title: { en: "Billing actions", ar: "إجراءات الفوترة" },
        actions: [
          {
            code: "billing.subscriptions.edit",
            label: {
              en: "Can adjust subscriptions and plans",
              ar: "تعديل الاشتراكات والخطط",
            },
          },
          {
            code: "billing.refunds.issue",
            label: { en: "Can issue refunds and credits", ar: "إصدار الاستردادات والأرصدة" },
          },
        ],
      },
      {
        // PRO-737. Rate changes are split out from the general billing actions
        // above because they reprice every future transaction for a Partner.
        id: "billing_camipay",
        title: { en: "CamiPay settlement", ar: "تسوية كامي باي" },
        actions: [
          {
            code: "billing.camipay.rails.edit",
            label: {
              en: "Can turn CamiPay rails on or off and assign a gateway",
              ar: "تفعيل أو تعطيل قنوات كامي باي وتعيين البوابة",
            },
          },
          {
            code: "billing.camipay.rates.edit",
            label: {
              en: "Can change a Partner's take rate",
              ar: "تغيير نسبة العمولة للشريك",
            },
          },
        ],
      },
    ],
  },
  {
    id: "support",
    name: { en: "Support", ar: "الدعم" },
    summary: {
      en: "Allow access to support tickets and Partner impersonation.",
      ar: "الوصول إلى تذاكر الدعم وانتحال شخصية العميل.",
    },
    icon: "headset",
    sections: [
      {
        id: "support_tickets",
        title: { en: "Tickets", ar: "التذاكر" },
        actions: [
          {
            code: "support.read",
            label: { en: "Can view support tickets", ar: "عرض تذاكر الدعم" },
          },
          {
            code: "support.reply",
            label: { en: "Can reply to tickets", ar: "الرد على التذاكر" },
          },
        ],
      },
      {
        id: "support_impersonation",
        title: { en: "Impersonation", ar: "انتحال الشخصية" },
        actions: [
          {
            code: "merchants.impersonate",
            label: {
              en: "Can sign in as a Partner Owner",
              ar: "تسجيل الدخول كمالك عمل",
            },
          },
        ],
      },
    ],
  },
  {
    id: "audit",
    name: { en: "Audit log", ar: "سجل التدقيق" },
    summary: { en: "Allow access to the HQ audit log.", ar: "الوصول إلى سجل تدقيق المقر." },
    icon: "scroll",
    sections: [
      {
        id: "audit_view",
        title: { en: "Audit log", ar: "سجل التدقيق" },
        actions: [
          {
            code: "audit.read",
            label: { en: "Can view the audit log", ar: "عرض سجل التدقيق" },
          },
          {
            code: "audit.export",
            label: { en: "Can export the audit log", ar: "تصدير سجل التدقيق" },
          },
        ],
      },
    ],
  },
  {
    id: "analytics",
    name: { en: "Analytics & Reports", ar: "التحليلات والتقارير" },
    summary: {
      en: "Allow access to the HQ analytics dashboards and exportable reports.",
      ar: "الوصول إلى لوحات التحليلات والتقارير القابلة للتصدير.",
    },
    icon: "bar-chart",
    sections: [
      {
        id: "analytics_view",
        title: { en: "Dashboards", ar: "لوحات التحكم" },
        actions: [
          {
            code: "analytics.read",
            label: { en: "Can view HQ analytics", ar: "عرض تحليلات المقر" },
          },
          {
            code: "analytics.export",
            label: { en: "Can export reports", ar: "تصدير التقارير" },
          },
        ],
      },
    ],
  },
  {
    id: "hq_users",
    name: { en: "HQ Users", ar: "مستخدمو المقر" },
    summary: {
      en: "Allow access to the HQ team directory and decide who can invite or remove members.",
      ar: "الوصول إلى دليل فريق المقر وتحديد من يمكنه دعوة الأعضاء أو إزالتهم.",
    },
    icon: "users",
    sections: [
      {
        id: "hq_users_view",
        title: { en: "Team directory", ar: "دليل الفريق" },
        actions: [
          {
            code: "hq_users.read",
            label: { en: "Can view the HQ team", ar: "عرض فريق المقر" },
          },
        ],
      },
      {
        id: "hq_users_manage",
        title: { en: "Membership", ar: "العضوية" },
        actions: [
          {
            code: "hq_users.invite",
            label: { en: "Can invite HQ teammates", ar: "دعوة زملاء المقر" },
          },
          {
            code: "hq_users.disable",
            label: { en: "Can disable HQ teammates", ar: "تعطيل زملاء المقر" },
          },
          {
            code: "hq_users.role.change",
            label: { en: "Can change a teammate's role", ar: "تغيير دور زميل" },
          },
        ],
      },
    ],
  },
  {
    id: "roles",
    name: { en: "Roles & Permissions", ar: "الأدوار والأذونات" },
    summary: {
      en: "Allow access to the HQ role catalog and decide who can edit it.",
      ar: "الوصول إلى دليل أدوار المقر وتحديد من يمكنه تعديله.",
    },
    icon: "shield",
    sections: [
      {
        id: "roles_view",
        title: { en: "Catalog", ar: "الدليل" },
        actions: [
          {
            code: "roles.read",
            label: { en: "Can view roles and permissions", ar: "عرض الأدوار والأذونات" },
          },
        ],
      },
      {
        id: "roles_manage",
        title: { en: "Role management", ar: "إدارة الأدوار" },
        actions: [
          {
            code: "roles.create",
            label: { en: "Can create custom HQ roles", ar: "إنشاء أدوار مخصصة" },
          },
          {
            code: "roles.edit",
            label: { en: "Can edit role permissions", ar: "تعديل أذونات الأدوار" },
          },
          {
            code: "roles.delete",
            label: { en: "Can delete custom HQ roles", ar: "حذف أدوار مخصصة" },
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    name: { en: "Settings", ar: "الإعدادات" },
    summary: {
      en: "Allow access to HQ workspace settings.",
      ar: "الوصول إلى إعدادات مساحة عمل المقر.",
    },
    icon: "settings",
    sections: [
      {
        id: "settings_view",
        title: { en: "Workspace settings", ar: "إعدادات مساحة العمل" },
        actions: [
          {
            code: "settings.read",
            label: { en: "Can view HQ settings", ar: "عرض إعدادات المقر" },
          },
          {
            code: "settings.edit",
            label: { en: "Can edit HQ settings", ar: "تعديل إعدادات المقر" },
          },
        ],
      },
    ],
  },
]

export const ALL_HQ_PERMISSION_CODES: string[] = HQ_PERMISSION_AREAS.flatMap((area) =>
  area.sections.flatMap((s) => s.actions.map((a) => a.code)),
)

export function findPermissionLabel(code: string, locale: "en" | "ar" = "en"): string | undefined {
  for (const area of HQ_PERMISSION_AREAS) {
    for (const section of area.sections) {
      const action = section.actions.find((a) => a.code === code)
      if (action) return action.label[locale]
    }
  }
  return undefined
}

/**
 * "Active" if the role grants ANY of the area's permissions; "Off" if none.
 * Used by the left rail status dot and the area's master toggle.
 */
export function isAreaActive(
  permissionCodes: ReadonlySet<string>,
  area: HqPermissionArea,
): boolean {
  return area.sections.some((s) => s.actions.some((a) => permissionCodes.has(a.code)))
}

export function listAreaCodes(area: HqPermissionArea): string[] {
  return area.sections.flatMap((s) => s.actions.map((a) => a.code))
}
