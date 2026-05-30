import { motion } from 'framer-motion';

interface UserChipProps {
  avatar: string;
  amount: string;
  label: string;
  avatarOnLeft?: boolean;
}

export function UserChip({ avatar, amount, label, avatarOnLeft = true }: UserChipProps) {
  const avatarEl = (
    <img
      src={avatar}
      alt=""
      className="rounded-full shrink-0"
      style={{ width: 34.481, height: 34.481 }}
    />
  );

  const textEl = (
    <div className="flex flex-col items-start leading-normal">
      <span className="font-poppins font-semibold text-[12px] text-[#00d676] whitespace-nowrap">
        {amount}
      </span>
      <span className="font-poppins text-[10px] text-[#cbcbde] whitespace-nowrap">
        {label}
      </span>
    </div>
  );

  return (
    // gesture layer — hover scale + tap compress
    <motion.div
      data-chip
      className="flex items-center bg-[#33334d] rounded-full shrink-0 cursor-default"
      style={{
        width: 123.967,
        gap: 11.494,
        paddingInline: 6.568,
        paddingBlock: 3.284,
        justifyContent: avatarOnLeft ? 'flex-start' : 'flex-end',
        filter: 'drop-shadow(0px 0px 3.284px rgba(0, 214, 118, 0.24))',
      }}
      whileHover={{ scale: 1.06, filter: 'drop-shadow(0px 0px 7px rgba(0, 214, 118, 0.55))' }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
    >
      {avatarOnLeft ? <>{avatarEl}{textEl}</> : <>{textEl}{avatarEl}</>}
    </motion.div>
  );
}
