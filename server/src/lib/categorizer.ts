/**
 * Smart auto-categorization based on product name keywords.
 * Used when Shopify's product_type is not set.
 */
export function inferCategory(productName: string): string {
    const name = productName.toLowerCase();

    const categoryRules: { keywords: string[]; category: string }[] = [
        { keywords: ['bag', 'purse', 'wallet', 'belt', 'watch', 'sunglasses', 'hat', 'cap', 'scarf'], category: 'Accessories' },
        { keywords: ['jacket', 'coat', 'hoodie', 'parka', 'windbreaker', 'blazer'], category: 'Outerwear' },
        { keywords: ['shoe', 'sneaker', 'boot', 'sandal', 'heel', 'high tops', 'loafer', 'slipper'], category: 'Footwear' },
        { keywords: ['tuxedo', 'suit', 'formal', 'tie', 'bow'], category: 'Formal Wear' },
        { keywords: ['sports', 'athletic', 'gym', 'fitness', 'running', 'track'], category: 'Sportswear' },
        { keywords: ['jumper', 'sweater', 'cardigan', 'wool', 'knit'], category: 'Knitwear' },
        { keywords: ['shirt', 'top', 'blouse', 'tee', 't-shirt', 'polo', 'tank', 'camisole'], category: 'Apparel' },
        { keywords: ['skirt', 'dress', 'gown', 'romper'], category: 'Dresses' },
        { keywords: ['jeans', 'pants', 'trousers', 'shorts', 'denim', 'chinos'], category: 'Bottoms' },
    ];

    for (const rule of categoryRules) {
        if (rule.keywords.some(kw => name.includes(kw))) {
            return rule.category;
        }
    }

    return 'General';
}
