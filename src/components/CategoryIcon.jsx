import React from 'react';
import * as Icons from 'lucide-react';

export default function CategoryIcon({ name, size = 20, color, className = '' }) {
  // البحث عن الأيقونة بالاسم أو استخدام HelpCircle كبديل
  const IconComponent = Icons[name] || Icons.HelpCircle;

  return (
    <IconComponent
      size={size}
      color={color || 'currentColor'}
      className={className}
    />
  );
}
