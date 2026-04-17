import { motion } from 'framer-motion';

export default function ScoreCard({ label, value, detail }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-accent">{value}</p>
      {detail && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{detail}</p>}
    </motion.div>
  );
}
