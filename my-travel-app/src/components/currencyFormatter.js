import { getParamByISO } from 'iso-country-currency';

/**
 * Converts and formats a USD price into the destination's local currency.
 * @param {number} priceInUSD - The base price from your database.
 * @param {string} countryCode - The 2-letter ISO country code (e.g., 'IT', 'IL').
 * @param {object} liveRates - The live conversion dictionary fetched from the API.
 * @returns {string} - The mathematically converted price with the right currency symbol.
 */
export const convertAndFormatPrice = (priceInUSD, countryCode = 'US', liveRates = null) => {
  if (priceInUSD === null || priceInUSD === undefined) return 'N/A';
  if (Number(priceInUSD) === 0) return 'Free';

  try {
    // 1. Automatically find the target currency symbol mapping (e.g., 'EUR' for Italy)
    const targetCurrency = getParamByISO(countryCode.toUpperCase(), 'currency');
    
    // 2. Fetch the corresponding exchange rate multiplier relative to USD base
    const exchangeRate = liveRates ? liveRates[targetCurrency] : 1;
    
    // 3. Mathematical conversion logic
    const convertedPrice = Number(priceInUSD) * (exchangeRate || 1);

    // 4. Format visually according to localization rules
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(convertedPrice);
    
  } catch (error) {
    // Fallback safety layer: render standard USD formatting if anything breaks
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInUSD);
  }
};