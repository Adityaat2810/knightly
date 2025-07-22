import { useState } from 'react';

const ExitGameModal = ({ onClick }: { onClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className='w-24 h-12 bg-stone-800 rounded-md font-semibold text-white hover:bg-stone-700 transition-colors'
      >
        Exit
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-stone-800 border border-stone-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-white font-mono text-lg font-semibold mb-2">
                Are you absolutely sure?
              </h2>
              <p className="text-white font-mono text-sm opacity-90">
                This action cannot be undone. This will be considered as a loss.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="font-mono bg-[#739552] text-white font-semibold hover:bg-[#b2e084] hover:text-gray-700 border-none px-4 py-2 rounded-md transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  onClick();
                  setIsOpen(false);
                }}
                className="bg-[#e2e6aa] min-w-20 text-gray-900 hover:text-slate-100 hover:bg-[#bbc259] font-semibold px-4 py-2 rounded-md transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExitGameModal;