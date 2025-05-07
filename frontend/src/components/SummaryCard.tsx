import React from "react";

const SummaryCard = () => {
  const progress = 75; // dalam persen

  return (
    <div className="bg-yellow-400 rounded-3xl p-4 mt-6 flex items-center justify-between text-black">
      {/* Kiri: Progress Circle dan Label */}
      <div className="flex flex-col items-center w-24">
        <div className="relative w-20 h-20">
          {/* Background lingkaran */}
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-white"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
              opacity="0.8"
            />
            <path
              className="text-blue-500"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray={`${progress}, 100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          {/* Icon tengah */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://img.icons8.com/?size=100&id=34005&format=png&color=FFFFFF"
              alt="Saving Icon"
              className="w-10 h-10"
            />
          </div>
        </div>
        <p className="text-sm text-center mt-2 font-semibold leading-tight">
          Savings<br />On Goals
        </p>
      </div>

      {/* Kanan: Revenue & Food */}
      <div className="flex-1 ml-6 border-l-2 border-white pl-4 space-y-4">
        <div className="flex items-center space-x-2">
          {/* Ubah emoji uang dengan gambar */}
          <img
            src="https://img.icons8.com/?size=100&id=dtvMlkUgj119&format=png&color=FFFFFF"
            alt="Revenue Icon"
            className="w-8 h-8"
          />
          <div>
            <p className="text-sm">Revenue Last Week</p>
            <p className="font-bold text-lg">$4.000.00</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Ubah emoji makanan dengan gambar */}
          <img
            src="https://img.icons8.com/?size=100&id=35746&format=png&color=FFFFFF"
            alt="Food Icon"
            className="w-8 h-8"
          />
          <div>
            <p className="text-sm">Food Last Week</p>
            <p className="text-blue-600 font-bold text-lg">-$100.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
