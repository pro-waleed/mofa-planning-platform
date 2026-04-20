import { PageHeader } from "@/components/page-header";
import { TemplateForm } from "@/features/templates/template-form";

export default function NewTemplatePage() {
  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="إنشاء قالب ديناميكي"
        description="عرّف مستويات التخطيط والحقول الأساسية بحيث يمكن استعمال القالب لإنشاء خطط مؤسسية مرنة قابلة للتوسع."
        backHref="/templates"
      />
      <TemplateForm mode="create" />
    </div>
  );
}

