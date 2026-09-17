import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'dd MMM yyyy, h:mm a');
};

export const timeAgo = (timestamp) => {
  if (!timestamp) return '—';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
};

export const truncate = (str, n = 30) =>
  str?.length > n ? str.slice(0, n - 1) + '…' : str;

export const generateRideId = () =>
  'RM' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
};

export const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Driver Assigned',
  picked_up: 'Picked Up',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

export const VEHICLE_ICONS = { bike: '🛵', auto: '🛺', car: '🚗' };
export const VEHICLE_LABELS = { bike: 'Bike', auto: 'Auto', car: 'Car' };

export const UPI_DEEP_LINKS = {
  phonepe: (amount, txId) => `phonepe://pay?pa=ridemate@ybl&pn=RideMate&am=${amount}&cu=INR&tn=${txId}`,
  gpay: (amount, txId) => `tez://upi/pay?pa=ridemate@okicici&pn=RideMate&am=${amount}&cu=INR&tn=${txId}`,
  paytm: (amount, txId) => `paytmmp://pay?pa=ridemate@paytm&pn=RideMate&am=${amount}&cu=INR&tn=${txId}`,
};
