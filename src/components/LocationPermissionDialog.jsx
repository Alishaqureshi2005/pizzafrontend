import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationPermissionDialog = ({ onAllow, onDeny }) => {
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <div className="text-center mb-6">
          <FaMapMarkerAlt className="text-4xl text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Enable Location Services</h2>
          <p className="text-gray-600">
            To provide you with accurate delivery options, we need access to your location.
            This helps us:
          </p>
          <ul className="text-left mt-4 space-y-2 text-gray-600">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Show nearby delivery zones
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Calculate accurate delivery times
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Provide precise delivery estimates
            </li>
          </ul>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onDeny}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Not Now
          </button>
          <button
            onClick={onAllow}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Allow Location Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionDialog; 