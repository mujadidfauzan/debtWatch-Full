import React from "react";

const TransactionItem = ({
  icon,
  title,
  time,
  category,
  amount,
  positive = false,
}: {
  icon: string;
  title: string;
  time: string;
  category: string;
  amount: string;
  positive?: boolean;
}) => (
  <div className="flex items-center justify-between bg-white rounded-xl shadow p-3">
    {/* Kiri: Icon + title & time */}
    <div className="flex items-center gap-3 flex-1">
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>

    {/* Tengah: Category */}
    <div className="flex-1 text-center">
      <p className="text-sm text-gray-500">{category}</p>
    </div>

    {/* Kanan: Amount */}
    <div className="text-right flex-1">
      <p className={`font-bold ${positive ? "text-green-600" : "text-red-500"}`}>{amount}</p>
    </div>
  </div>
);

  export default TransactionItem;
  