export function numberToWords(num: number, currency: string = 'INR'): string {
  if (isNaN(num)) return '';
  const rounded = Math.round(Math.abs(num) * 100) / 100;
  if (rounded === 0) return 'Zero Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertIndian(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertIndian(n % 100) : '');
    if (n < 100000) return convertIndian(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertIndian(n % 1000) : '');
    if (n < 10000000) return convertIndian(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertIndian(n % 100000) : '');
    return convertIndian(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertIndian(n % 10000000) : '');
  }

  const intPart = Math.floor(rounded);
  const decPart = Math.round((rounded - intPart) * 100);

  let result = '';
  if (intPart > 0) {
    result = convertIndian(intPart).trim();
  }

  if (decPart > 0) {
    const paiseText = convertIndian(decPart).trim() + ' Paise';
    if (result) {
      result += ' and ' + paiseText;
    } else {
      result = paiseText;
    }
  }

  return (result || 'Zero').replace(/\s+/g, ' ') + ' Only';
}
