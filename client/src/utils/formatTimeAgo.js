import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale"; // אם רוצים בעברית

const formatTimeAgo = (date) => {
  // בדיקה אם התאריך תקין
  if (!date) {
    return "לא ידוע";
  }
  
  // נוודא שאנחנו עובדים עם אובייקט Date תקין
  let dateObject;
  try {
    dateObject = new Date(date);
    
    // בדיקה אם התאריך תקין
    if (isNaN(dateObject.getTime())) {
      return "לא ידוע";
    }
    
    // בדיקה אם התאריך לא עתידי מדי (יותר מיום מהיום)
    const now = new Date();
    if (dateObject > now) {
      // אם התאריך בעתיד, נחזיר "עכשיו"
      return "עכשיו";
    }
    
    // בדיקה אם התאריך לא עתיק מדי (יותר מ-5 שנים)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    if (dateObject < fiveYearsAgo) {
      return dateObject.toLocaleDateString("he-IL");
    }
    
    return formatDistanceToNow(dateObject, { 
      addSuffix: true, 
      locale: he 
    });
    
  } catch (error) {
    console.error("Error formatting date:", error);
    return "לא ידוע";
  }
};

export default formatTimeAgo;