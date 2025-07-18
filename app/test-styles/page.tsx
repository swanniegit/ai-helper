export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Style Test Page</h1>
        
        {/* Test basic Tailwind classes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Basic Tailwind Classes</h2>
          <p className="text-gray-700 mb-4">This text should be gray and readable.</p>
          <button className="bg-gradient-to-r from-primary to-gray-700 hover:from-primary/90 hover:to-gray-700/90 text-white px-4 py-2 rounded-md transition-colors">
            Test Button
          </button>
        </div>

        {/* Test custom animations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">Custom Animations</h2>
          <p className="text-gray-700 mb-4">This card should fade in with animation.</p>
        </div>

        {/* Test custom button classes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-purple-600 mb-4">Custom Button Classes</h2>
          <button className="btn btn-sm btn-primary-light">Custom Button</button>
        </div>

        {/* Test status colors like in GoalCard */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-orange-600 mb-4">Status Colors</h2>
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              On Track
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Behind
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              At Risk
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Completed
            </span>
          </div>
        </div>

        {/* Test progress bars */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Progress Bars</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">75% Progress</p>
              <div className="w-full h-2 bg-gray-200 rounded">
                <div className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-400 to-green-600" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">50% Progress</p>
              <div className="w-full h-2 bg-gray-200 rounded">
                <div className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-yellow-400 to-yellow-600" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 