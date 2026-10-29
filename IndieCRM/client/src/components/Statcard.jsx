function StatCard({ title, value }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">

      <p className="text-gray-400">
        {title}
      </p>

      <h3 className="text-3xl font-bold">
        {value}
      </h3>

    </div>
  );
}

export default StatCard;