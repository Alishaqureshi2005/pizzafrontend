import React, { useState, useEffect } from 'react';
import { FaPrint, FaSave, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { printerApi } from '../services/adminApi';

const AdminPrinter = () => {
  const [settings, setSettings] = useState({
    isEnabled: true,
    headerText: 'PIZZAHOUSE',
    footerText: 'Thank you for choosing PizzaHouse!',
    printCustomerCopy: true,
    printKitchenCopy: true,
    printDeliveryCopy: true,
    printOnNewOrder: true,
    printOnOrderUpdate: true,
    printOnOrderComplete: true,
    printOnOrderCancel: true,
    printerName: '',
    printerIP: '',
    printerPort: 9100
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await printerApi.getPrinterSettings();
      if (response?.data?.data) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error loading printer settings:', error);
      setError('Failed to load printer settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await printerApi.updatePrinterSettings(settings);
      toast.success('Printer settings saved successfully');
    } catch (error) {
      console.error('Error saving printer settings:', error);
      toast.error('Failed to save printer settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrint = async () => {
    try {
      setLoading(true);
      await printerApi.testPrinter();
      toast.success('Test print sent successfully');
    } catch (error) {
      console.error('Error sending test print:', error);
      toast.error('Failed to send test print');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-red-600 mb-8 text-center">Printer Settings</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Printer Connection Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Printer Connection</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Printer Name
                </label>
                <input
                  type="text"
                  value={settings.printerName}
                  onChange={(e) => setSettings({ ...settings, printerName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter printer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Printer IP Address
                </label>
                <input
                  type="text"
                  value={settings.printerIP}
                  onChange={(e) => setSettings({ ...settings, printerIP: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter printer IP address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Printer Port
                </label>
                <input
                  type="number"
                  value={settings.printerPort}
                  onChange={(e) => setSettings({ ...settings, printerPort: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter printer port"
                />
              </div>
            </div>

            {/* Print Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Print Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header Text
                </label>
                <input
                  type="text"
                  value={settings.headerText}
                  onChange={(e) => setSettings({ ...settings, headerText: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter header text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Text
                </label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter footer text"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Print Copies</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.printCustomerCopy}
                      onChange={(e) => setSettings({ ...settings, printCustomerCopy: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Customer Copy</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.printKitchenCopy}
                      onChange={(e) => setSettings({ ...settings, printKitchenCopy: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Kitchen Copy</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.printDeliveryCopy}
                      onChange={(e) => setSettings({ ...settings, printDeliveryCopy: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Delivery Copy</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Print Triggers</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.printOnNewOrder}
                      onChange={(e) => setSettings({ ...settings, printOnNewOrder: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Print on New Order</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.printOnOrderUpdate}
                      onChange={(e) => setSettings({ ...settings, printOnOrderUpdate: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Print on Order Update</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.printOnOrderComplete}
                      onChange={(e) => setSettings({ ...settings, printOnOrderComplete: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Print on Order Complete</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.printOnOrderCancel}
                      onChange={(e) => setSettings({ ...settings, printOnOrderCancel: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Print on Order Cancel</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleTestPrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <FaPrint />
              Test Print
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              disabled={loading}
            >
              <FaSave />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPrinter; 