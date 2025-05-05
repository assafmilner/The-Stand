import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale"; // אם רוצים בעברית

const formatTimeAgo = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: he });
};

export default formatTimeAgo;