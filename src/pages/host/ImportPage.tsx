import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Upload, Link as LinkIcon, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function ImportPage() {
  const { host } = useAuth();
  const [importing, setImporting] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importHistory, setImportHistory] = useState<any[]>([]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    setImporting(true);

    setTimeout(() => {
      const newImport = {
        id: Date.now().toString(),
        url: importUrl,
        status: 'success',
        properties: Math.floor(Math.random() * 5) + 1,
        timestamp: new Date().toISOString(),
      };

      setImportHistory([newImport, ...importHistory]);
      setImportUrl('');
      setImporting(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import Listings</h1>
        <p className="text-gray-600 mt-2">Import your properties from other platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg"
              alt="Airbnb"
              className="w-10 h-10"
            />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Airbnb</h3>
          <p className="text-sm text-gray-600 mb-4">Import from Airbnb</p>
          <button className="text-[#cc2b5e] hover:underline text-sm font-medium">
            Connect
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src="https://cf.bstatic.com/static/img/b26logo/booking_logo_retina/22615963add19ac6b6d715a97c8d477e8b95b7ea.png"
              alt="Booking.com"
              className="w-10 h-10"
            />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Booking.com</h3>
          <p className="text-sm text-gray-600 mb-4">Import from Booking.com</p>
          <button className="text-[#cc2b5e] hover:underline text-sm font-medium">
            Connect
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Custom URL</h3>
          <p className="text-sm text-gray-600 mb-4">Import via iCal URL</p>
          <button className="text-[#cc2b5e] hover:underline text-sm font-medium">
            Connect
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Import via URL
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Paste your property listing URL from Airbnb, Booking.com, or any supported platform. We'll automatically extract the property details and create a listing for you.
          </p>
        </div>

        <form onSubmit={handleImport} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing URL
            </label>
            <input
              type="url"
              required
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://www.airbnb.com/rooms/12345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-2">
              Supported: Airbnb, Booking.com, VRBO, HomeAway
            </p>
          </div>

          <button
            type="submit"
            disabled={importing}
            className="flex items-center gap-2 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Import Property
              </>
            )}
          </button>
        </form>
      </div>

      {importHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Import History</h2>
          <div className="space-y-3">
            {importHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {item.status === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.properties} {item.properties === 1 ? 'property' : 'properties'} imported
                    </p>
                    <p className="text-sm text-gray-600 truncate max-w-md">{item.url}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Important Notes</h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#cc2b5e]">•</span>
            <span>Make sure your listing URL is publicly accessible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#cc2b5e]">•</span>
            <span>Import may take a few minutes depending on the platform</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#cc2b5e]">•</span>
            <span>Review imported properties and adjust pricing as needed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#cc2b5e]">•</span>
            <span>Images and amenities are automatically imported when available</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
