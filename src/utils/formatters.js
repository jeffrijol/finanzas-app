// src/utils/formatters.js
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};