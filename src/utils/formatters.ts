export function formatCurrency(
    value: number,
    locale = 'id-ID',
    currency = 'IDR',
    withSymbol = true,
) {
    return new Intl.NumberFormat(locale, {
        style: withSymbol ? 'currency' : 'decimal',
        currency: withSymbol ? currency : undefined,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}
