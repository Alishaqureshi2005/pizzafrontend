import React from 'react';
import { deliveryZoneService } from '../services/deliveryZoneService';

const DeliveryZoneInfo = ({ orderTotal = 0 }) => {
  const zones = deliveryZoneService.getAllZones();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Delivery Zones</h2>
      
      <div className="space-y-4">
        {zones.map(zone => (
          <div key={zone.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{zone.name}</h3>
              <span className="text-sm text-gray-600">
                Up to {zone.maxDistance}km
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Delivery Charge: €{zone.deliveryCharge.toFixed(2)}</p>
              <p>
                Free delivery for orders above €{zone.freeDeliveryThreshold.toFixed(2)}
              </p>
              
              {orderTotal > 0 && (
                <div className="mt-2">
                  {orderTotal >= zone.freeDeliveryThreshold ? (
                    <p className="text-green-600">
                      Your order qualifies for free delivery in this zone!
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      Add €{(zone.freeDeliveryThreshold - orderTotal).toFixed(2)} more to get free delivery
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium mb-2">Delivery Information:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Delivery charges are calculated based on your distance from our restaurant</li>
          <li>Free delivery is available for orders above the specified threshold in each zone</li>
          <li>Delivery time may vary based on distance and order volume</li>
          <li>Contact us for delivery to locations beyond our delivery zones</li>
        </ul>
      </div>
    </div>
  );
};

export default DeliveryZoneInfo; 