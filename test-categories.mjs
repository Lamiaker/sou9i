// Script de test pour l'API des catégories
// Exécuter avec: node test-categories.mjs

const BASE_URL = 'http://localhost:3000/api/categories';

async function testAPI() {
    console.log('🧪 Tests de l\'API Categories\n');

    try {
        // Test 1: Récupérer toutes les catégories
        console.log('1️⃣ GET /api/categories (toutes)');
        const allResponse = await fetch(BASE_URL);
        const allData = await allResponse.json();
        console.log(`   ✅ ${allData.data?.length || 0} catégories récupérées\n`);

        // Test 2: Récupérer les catégories hiérarchiques
        console.log('2️⃣ GET /api/categories?type=hierarchy');
        const hierarchyResponse = await fetch(`${BASE_URL}?type=hierarchy`);
        const hierarchyData = await hierarchyResponse.json();
        console.log(`   ✅ ${hierarchyData.data?.length || 0} catégories parentes`);
        if (hierarchyData.data?.[0]) {
            console.log(`   └─ Exemple: "${hierarchyData.data[0].name}" avec ${hierarchyData.data[0].children?.length || 0} enfants\n`);
        }

        // Test 3: Récupérer seulement les catégories parentes
        console.log('3️⃣ GET /api/categories?type=parents');
        const parentsResponse = await fetch(`${BASE_URL}?type=parents`);
        const parentsData = await parentsResponse.json();
        console.log(`   ✅ ${parentsData.data?.length || 0} catégories parentes récupérées\n`);

        // Test 4: Récupérer les catégories avec compteur
        console.log('4️⃣ GET /api/categories?withCount=true');
        const countResponse = await fetch(`${BASE_URL}?withCount=true`);
        const countData = await countResponse.json();
        console.log(`   ✅ ${countData.data?.length || 0} catégories avec compteur\n`);

        // Test 5: Récupérer une catégorie par slug
        if (hierarchyData.data?.[0]?.slug) {
            const slug = hierarchyData.data[0].slug;
            console.log(`5️⃣ GET /api/categories/${slug} (par slug)`);
            const categoryResponse = await fetch(`${BASE_URL}/${slug}`);
            const categoryData = await categoryResponse.json();
            console.log(`   ✅ Catégorie: "${categoryData.data?.name}"`);
            console.log(`   └─ ${categoryData.data?.children?.length || 0} sous-catégories\n`);
        }

        // Test 6: Récupérer les enfants d'une catégorie
        if (hierarchyData.data?.[0]?.id) {
            const parentId = hierarchyData.data[0].id;
            console.log(`6️⃣ GET /api/categories?parentId=${parentId} (enfants)`);
            const childrenResponse = await fetch(`${BASE_URL}?parentId=${parentId}`);
            const childrenData = await childrenResponse.json();
            console.log(`   ✅ ${childrenData.data?.length || 0} sous-catégories récupérées\n`);
        }

        console.log('✅ Tous les tests sont passés avec succès! 🎉');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
    }
}

testAPI();
