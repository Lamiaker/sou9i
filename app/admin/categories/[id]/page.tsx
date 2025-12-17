import { AdminService } from '@/services';
import { notFound } from 'next/navigation';
import CategoryDetailView from '@/components/admin/CategoryDetailView';

interface PageProps {
    params: {
        id: string;
    }
}

// Important: Server Component
export default async function CategoryDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const categoryId = params.id;
    const category = await AdminService.getCategory(categoryId);

    if (!category) {
        notFound();
    }

    // Get all categories for the "Parent" dropdown in case we edit
    const allCategories = await AdminService.getCategories();

    return (
        <CategoryDetailView
            category={category}
            allCategories={allCategories}
        />
    );
}
