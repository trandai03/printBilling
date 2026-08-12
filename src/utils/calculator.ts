import {
  PaperSize,
  PrintMode,
  SidesMode,
  PaperWeight,
  ExtraServices,
  PricingConfig,
  CalculationResult,
  SelectedFileItem,
} from '../types/billing';

export function calculateBilling(
  fileItems: SelectedFileItem[],
  paperSize: PaperSize,
  printMode: PrintMode,
  sidesMode: SidesMode,
  _paperWeight: PaperWeight,
  extraServices: ExtraServices,
  pricingConfig: PricingConfig
): CalculationResult {
  if (!fileItems || fileItems.length === 0) {
    return {
      filePages: 0,
      copies: 0,
      totalPages: 0,
      totalSheets: 0,
      unitPrintPrice: 0,
      printCost: 0,
      extraCost: 0,
      totalAmount: 0,
      isBulkPricingApplied: false,
    };
  }

  let totalPages = 0;
  let totalSheets = 0;
  let totalCopies = 0;
  let totalRawFilePages = 0;

  for (const item of fileItems) {
    const pages = Math.max(1, item.pageCount);
    const copies = Math.max(1, item.copies);
    const itemPages = pages * copies;
    const itemSheets = sidesMode === 'SIMPLEX' ? itemPages : Math.ceil(itemPages / 2);

    totalRawFilePages += pages;
    totalCopies += copies;
    totalPages += itemPages;
    totalSheets += itemSheets;
  }

  // Check bulk sheet pricing rule
  const bulkConfig = pricingConfig.bulkSheetPricing;
  const isBulkPricingApplied =
    !!bulkConfig?.enabled && totalSheets >= (bulkConfig.thresholdSheets || 0);

  // Unit print price per page
  const unitPrintPrice = isBulkPricingApplied
    ? bulkConfig.unitPrice
    : (pricingConfig.printPrices[paperSize]?.[printMode === 'BW' ? 'bw' : 'color'] ?? 0);

  const printCost = totalPages * unitPrintPrice;

  // Duplex surcharge
  const duplexSurchargeTotal =
    sidesMode === 'DUPLEX' ? totalSheets * (pricingConfig.duplexSurcharge || 0) : 0;

  // Extra service fees (calculated based on number of file sets/copies)
  let extraCost = 0;
  const setMultiplier = Math.max(1, fileItems.length);

  if (extraServices.coverPage) {
    extraCost += (pricingConfig.extraServices.coverPagePrice || 0) * setMultiplier;
  }
  if (extraServices.staple) {
    extraCost += (pricingConfig.extraServices.staplePrice || 0) * setMultiplier;
  }
  if (extraServices.spiralBinding) {
    extraCost += (pricingConfig.extraServices.spiralBindingPrice || 0) * setMultiplier;
  }
  extraCost += duplexSurchargeTotal;

  // Grand Total rounded to nearest 100 VND
  const rawTotal = printCost + extraCost;
  const totalAmount = Math.round(rawTotal / 100) * 100;

  return {
    filePages: totalRawFilePages,
    copies: totalCopies,
    totalPages,
    totalSheets,
    unitPrintPrice,
    printCost,
    extraCost,
    totalAmount,
    isBulkPricingApplied,
  };
}
