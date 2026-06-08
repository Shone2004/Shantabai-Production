const stats = [
  {
    title: "Total Bookings",
    value: 12,
  },
  {
    title: "Upcoming",
    value: 3,
  },
  {
    title: "Completed",
    value: 9,
  },
  {
    title: "Total Spent",
    value: "₹12,450",
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
        >
          <h3 className="text-gray-500 text-sm font-medium">
            {item.title}
          </h3>

          <h1 className="text-3xl font-bold text-brand-green mt-3">
            {item.value}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;