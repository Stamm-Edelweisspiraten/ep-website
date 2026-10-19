import type { PageServerLoad } from './$types';
import { faqs as records } from '$lib/faqs';

export const load: PageServerLoad = async () => {
    // Optional: Standardzustand `open = false` ergänzen
    const faqs = records.map((faq) => ({
        ...faq,
        open: false
    }));

    return { faqs };
};
