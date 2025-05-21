import { printerApi } from './adminApi';

class PrinterService {
  constructor() {
    this.printerSettings = null;
    this.loadSettings();
  }

  async loadSettings() {
    try {
      const response = await printerApi.getPrinterSettings();
      this.printerSettings = response.data.data;
    } catch (error) {
      console.error('Error loading printer settings:', error);
    }
  }

  async printOrder(order) {
    if (!this.printerSettings?.isEnabled) {
      console.log('Printer is disabled');
      return;
    }

    try {
      const printData = this.formatOrderForPrinting(order);
      await printerApi.printOrder(printData);
    } catch (error) {
      console.error('Error printing order:', error);
      throw error;
    }
  }

  formatOrderForPrinting(order) {
    const {
      orderNumber,
      customer,
      items,
      total,
      deliveryInfo,
      orderType,
      status,
      createdAt
    } = order;

    const header = this.printerSettings.headerText;
    const footer = this.printerSettings.footerText;
    const timestamp = new Date(createdAt).toLocaleString();

    // Format items for printing
    const formattedItems = items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      toppings: item.toppings?.map(t => t.name).join(', '),
      specialInstructions: item.specialInstructions
    }));

    // Format delivery info if present
    const deliveryDetails = deliveryInfo ? {
      address: deliveryInfo.address,
      phone: deliveryInfo.phone,
      deliveryTime: deliveryInfo.deliveryTime
    } : null;

    return {
      header,
      orderNumber,
      timestamp,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      },
      orderType,
      status,
      items: formattedItems,
      subtotal: total.subtotal,
      deliveryFee: total.deliveryFee,
      tax: total.tax,
      total: total.total,
      deliveryInfo: deliveryDetails,
      footer,
      copies: {
        customer: this.printerSettings.printCustomerCopy,
        kitchen: this.printerSettings.printKitchenCopy,
        delivery: this.printerSettings.printDeliveryCopy
      }
    };
  }

  async printOrderUpdate(order, updateType) {
    if (!this.printerSettings?.isEnabled) {
      return;
    }

    const shouldPrint = 
      (updateType === 'new' && this.printerSettings.printOnNewOrder) ||
      (updateType === 'update' && this.printerSettings.printOnOrderUpdate) ||
      (updateType === 'complete' && this.printerSettings.printOnOrderComplete) ||
      (updateType === 'cancel' && this.printerSettings.printOnOrderCancel);

    if (!shouldPrint) {
      return;
    }

    try {
      const printData = this.formatOrderForPrinting(order);
      printData.updateType = updateType;
      await printerApi.printOrderUpdate(printData);
    } catch (error) {
      console.error('Error printing order update:', error);
      throw error;
    }
  }

  async printTestPage() {
    if (!this.printerSettings?.isEnabled) {
      throw new Error('Printer is disabled');
    }

    try {
      await printerApi.testPrinter();
    } catch (error) {
      console.error('Error printing test page:', error);
      throw error;
    }
  }
}

export const printerService = new PrinterService(); 